frappe.provide("expresso.notifications");

expresso.notifications.NotificationHistory = class {
    constructor(frm) {
        this.frm = frm;
        this.init_ui();
    }

    init_ui() {
        this.create_notification_list();
        this.add_filters();
        this.add_buttons();
        this.add_statistics();
        this.refresh_notifications();
    }

    create_notification_list() {
        this.notification_list = $(`<div class="notification-list"></div>`);
        this.frm.fields_dict.notifications.$wrapper.append(this.notification_list);
    }

    add_filters() {
        this.filter_container = $(`<div class="notification-filters"></div>`);
        this.frm.fields_dict.notifications.$wrapper.prepend(this.filter_container);
        
        // Date range filter
        this.date_range_filter = $(`
            <div class="date-range-filter">
                <input type="date" class="form-control filter-date-from">
                <span>to</span>
                <input type="date" class="form-control filter-date-to">
            </div>
        `);
        this.filter_container.append(this.date_range_filter);
        this.date_range_filter.find('input').change(() => this.refresh_notifications());
        
        // Type filter
        this.type_filter = $(`
            <select class="form-control filter-type">
                <option value="">All Types</option>
                <option value="In-App">In-App</option>
                <option value="Email">Email</option>
                <option value="Push">Push</option>
            </select>
        `);
        this.filter_container.append(this.type_filter);
        this.type_filter.change(() => this.refresh_notifications());
        
        // Status filter
        this.status_filter = $(`
            <select class="form-control filter-status">
                <option value="">All Statuses</option>
                <option value="read">Read</option>
                <option value="unread">Unread</option>
            </select>
        `);
        this.filter_container.append(this.status_filter);
        this.status_filter.change(() => this.refresh_notifications());
    }

    add_statistics() {
        this.statistics_container = $(`
            <div class="notification-statistics">
                <div class="statistics-card">
                    <div class="statistics-title">Total Notifications</div>
                    <div class="statistics-value total-notifications">0</div>
                </div>
                <div class="statistics-card">
                    <div class="statistics-title">Unread Notifications</div>
                    <div class="statistics-value unread-notifications">0</div>
                </div>
                <div class="statistics-card">
                    <div class="statistics-title">Most Frequent Type</div>
                    <div class="statistics-value frequent-type">-</div>
                </div>
                <div class="statistics-chart">
                    <canvas id="notificationChart"></canvas>
                </div>
            </div>
        `);
        this.frm.fields_dict.notifications.$wrapper.prepend(this.statistics_container);
        this.chart = null;
    }

    refresh_notifications() {
        const from_date = this.date_range_filter.find('.filter-date-from').val();
        const to_date = this.date_range_filter.find('.filter-date-to').val();
        
        frappe.call({
            method: 'expresso.expresso.doctype.notification_history.notification_history.get_user_notifications',
            args: {
                user: this.frm.doc.user,
                type: this.type_filter.val(),
                status: this.status_filter.val(),
                from_date: from_date,
                to_date: to_date
            },
            callback: (response) => {
                this.render_notifications(response.message || []);
                this.update_statistics(response.message || []);
            }
        });
    }

    render_notifications(notifications) {
        this.notification_list.empty();
        
        notifications.forEach(notification => {
            const notification_html = $(`
                <div class="notification-item ${notification.read ? 'read' : 'unread'}">
                    <div class="notification-header">
                        <div class="notification-type">${notification.notification_type}</div>
                        <div class="notification-timestamp">${notification.timestamp}</div>
                    </div>
                    <div class="notification-subject">${notification.subject}</div>
                    <div class="notification-message">${notification.message}</div>
                </div>
            `);
            
            if (!notification.read) {
                notification_html.click(() => this.mark_as_read(notification.name));
            }
            
            this.notification_list.append(notification_html);
        });
    }

    update_statistics(notifications) {
        const total = notifications.length;
        const unread = notifications.filter(n => !n.read).length;
        
        const typeCounts = notifications.reduce((acc, n) => {
            acc[n.notification_type] = (acc[n.notification_type] || 0) + 1;
            return acc;
        }, {});
        
        const frequentType = Object.keys(typeCounts).reduce((a, b) => 
            typeCounts[a] > typeCounts[b] ? a : b, '-');
        
        this.statistics_container.find('.total-notifications').text(total);
        this.statistics_container.find('.unread-notifications').text(unread);
        this.statistics_container.find('.frequent-type').text(frequentType);
        
        this.render_chart(typeCounts);
    }

    render_chart(typeCounts) {
        const ctx = this.statistics_container.find('#notificationChart')[0].getContext('2d');
        
        if (this.chart) {
            this.chart.destroy();
        }
        
        const labels = Object.keys(typeCounts);
        const data = Object.values(typeCounts);
        
        this.chart = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: [
                        '#4e73df',
                        '#1cc88a',
                        '#36b9cc',
                        '#f6c23e',
                        '#e74a3b'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }

    add_buttons() {
        const button_container = $(`<div class="notification-buttons"></div>`);
        this.frm.fields_dict.notifications.$wrapper.append(button_container);
        
        this.mark_all_read_button = $(`<button class="btn btn-default btn-mark-all-read">Mark All as Read</button>`);
        button_container.append(this.mark_all_read_button);
        this.mark_all_read_button.click(() => this.mark_all_as_read());
        
        this.export_button = $(`<button class="btn btn-default btn-export">Export Notifications</button>`);
        button_container.append(this.export_button);
        this.export_button.click(() => this.export_notifications());
    }

    mark_as_read(notification_name) {
        frappe.call({
            method: 'expresso.expresso.doctype.notification_history.notification_history.mark_as_read',
            args: {
                name: notification_name
            },
            callback: () => this.refresh_notifications()
        });
    }

    mark_all_as_read() {
        frappe.call({
            method: 'expresso.expresso.doctype.notification_history.notification_history.mark_all_as_read',
            args: {
                user: this.frm.doc.user
            },
            callback: () => this.refresh_notifications()
        });
    }

    export_notifications() {
        const from_date = this.date_range_filter.find('.filter-date-from').val();
        const to_date = this.date_range_filter.find('.filter-date-to').val();
        
        frappe.call({
            method: 'expresso.expresso.doctype.notification_history.notification_history.export_notifications',
            args: {
                user: this.frm.doc.user,
                type: this.type_filter.val(),
                status: this.status_filter.val(),
                from_date: from_date,
                to_date: to_date
            }
        });
    }
};

frappe.ui.form.on('Notification History', {
    refresh: function(frm) {
        if (!frm.notifications) {
            frm.notifications = new expresso.notifications.NotificationHistory(frm);
        }
        frm.notifications.refresh_notifications();
    }
});