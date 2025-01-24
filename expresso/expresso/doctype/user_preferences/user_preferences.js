frappe.provide("expresso.preferences");

expresso.preferences.UserPreferences = class {
    constructor(frm) {
        this.frm = frm;
        this.setup_ui();
        this.add_preview_button();
    }

    setup_ui() {
        this.frm.set_df_property('report_time', 'hidden', this.frm.doc.report_frequency === 'Never');
        this.frm.set_df_property('report_format', 'hidden', this.frm.doc.report_frequency === 'Never');
        
        this.frm.fields_dict.report_frequency.$input.on('change', () => {
            const show = this.frm.doc.report_frequency !== 'Never';
            this.frm.set_df_property('report_time', 'hidden', !show);
            this.frm.set_df_property('report_format', 'hidden', !show);
        });
    }

    add_preview_button() {
        if (this.frm.doc.report_frequency !== 'Never') {
            this.frm.add_custom_button(__('Preview Report'), () => this.preview_report(), {
                icon: 'fa fa-eye',
                label: __('Preview')
            });
        }
    }

    preview_report() {
        frappe.call({
            method: 'expresso.suggestions.tasks.generate_preview',
            args: {
                user: frappe.session.user,
                format: this.frm.doc.report_format
            },
            callback: (response) => {
                if (response.message) {
                    this.show_preview(response.message);
                }
            }
        });
    }

    show_preview(content) {
        const preview = new frappe.ui.Dialog({
            title: __('Report Preview'),
            size: 'large',
            fields: [
                {
                    fieldtype: 'HTML',
                    fieldname: 'preview_content'
                }
            ],
            primary_action_label: __('Export'),
            primary_action: () => this.export_preview(content)
        });

        preview.fields_dict.preview_content.$wrapper.html(content);
        preview.show();
    }

    export_preview(content) {
        if (content.type === 'pdf') {
            this.download_file(content.content, 'suggestion_preview.pdf', 'application/pdf');
        } else if (content.type === 'csv') {
            this.download_file(content.content, 'suggestion_preview.csv', 'text/csv');
        } else {
            this.download_file(content.pdf, 'suggestion_preview.pdf', 'application/pdf');
            this.download_file(content.csv, 'suggestion_preview.csv', 'text/csv');
        }
    }

    download_file(content, filename, type) {
        const blob = new Blob([content], { type });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
};

frappe.ui.form.on('User Preferences', {
    refresh: function(frm) {
        if (!frm.preferences) {
            frm.preferences = new expresso.preferences.UserPreferences(frm);
        }
        
        if (frm.is_new()) {
            frm.set_value('user', frappe.session.user);
            frm.set_value('report_frequency', 'Daily');
            frm.set_value('report_time', '09:00:00');
            frm.set_value('report_format', 'PDF');
        }
    }
});