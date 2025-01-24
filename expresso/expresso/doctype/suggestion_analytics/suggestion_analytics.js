frappe.provide("expresso.analytics");

expresso.analytics.SuggestionAnalytics = class {
    constructor(frm) {
        this.frm = frm;
        this.charts = {};
        this.init_charts();
        this.add_export_button();
    }

    // ... existing chart methods ...

    add_export_button() {
        this.frm.add_custom_button(__('Export Data'), () => this.export_data(), {
            icon: 'fa fa-download',
            label: __('Export')
        });
    }

    export_data() {
        const data = this.prepare_export_data();
        const csv = this.convert_to_csv(data);
        this.download_csv(csv);
    }

    prepare_export_data() {
        const trends = this.get_trend_data();
        const accuracy = JSON.parse(this.frm.doc.analytics_data || '{}');
        
        return {
            headers: ['Date', 'Accuracy', 'Total Suggestions', 'Accepted', 'Rejected'],
            rows: trends.labels.map((date, index) => [
                date,
                trends.data[index],
                accuracy.total_suggestions || 0,
                accuracy.accepted_suggestions || 0,
                accuracy.rejected_suggestions || 0
            ])
        };
    }

    convert_to_csv(data) {
        const rows = [data.headers.join(',')];
        data.rows.forEach(row => {
            rows.push(row.join(','));
        });
        return rows.join('\n');
    }

    download_csv(csv) {
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'suggestion_analytics.csv';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
};

frappe.ui.form.on('Suggestion Analytics', {
    refresh: function(frm) {
        if (!frm.analytics) {
            frm.analytics = new expresso.analytics.SuggestionAnalytics(frm);
        }
        frm.analytics.refresh_charts();
    }
});