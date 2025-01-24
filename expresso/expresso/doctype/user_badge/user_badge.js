frappe.provide("expresso.badges");

expresso.badges.UserBadge = class {
    constructor(frm) {
        this.frm = frm;
        this.init_ui();
    }

    init_ui() {
        this.create_badge_display();
        this.refresh_badges();
    }

    create_badge_display() {
        this.badge_container = $(`<div class="badge-container"></div>`);
        this.frm.fields_dict.badges.$wrapper.append(this.badge_container);
    }

    refresh_badges() {
        frappe.call({
            method: 'expresso.expresso.doctype.user_badge.user_badge.get_user_badges',
            args: {
                user: this.frm.doc.name
            },
            callback: (response) => {
                this.render_badges(response.message || []);
            }
        });
    }

    render_badges(badges) {
        this.badge_container.empty();
        
        badges.forEach(badge => {
            const badge_html = $(`
                <div class="badge-item">
                    <img src="${badge.icon}" alt="${badge.badge_name}">
                    <div class="badge-info">
                        <div class="badge-name">${badge.badge_name}</div>
                        <div class="badge-date">${badge.date_awarded}</div>
                    </div>
                </div>
            `);
            
            this.badge_container.append(badge_html);
        });
    }
};

frappe.ui.form.on('User', {
    refresh: function(frm) {
        if (!frm.badges) {
            frm.badges = new expresso.badges.UserBadge(frm);
        }
        frm.badges.refresh_badges();
    }
});