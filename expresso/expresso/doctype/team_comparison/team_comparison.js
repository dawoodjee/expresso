frappe.provide("expresso.comparison");

expresso.comparison.TeamComparison = class {
    constructor(frm) {
        this.frm = frm;
        this.charts = {};
        this.init_charts();
    }

    init_charts() {
        this.charts.comparison = this.create_chart({
            parent: this.frm.fields_dict.comparison_chart.wrapper,
            type: 'bar',
            height: 300,
            colors: ['#7CD6FD', '#743EE2'],
            data: {
                labels: ['Total', 'Accepted', 'Rejected', 'Accuracy'],
                datasets: []
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });

        this.refresh_charts();
    }

    create_chart(config) {
        const canvas = document.createElement('canvas');
        config.parent.append(canvas);
        return new Chart(canvas.getContext('2d'), {
            type: config.type,
            data: config.data,
            options: config.options
        });
    }

    refresh_charts() {
        const data = JSON.parse(this.frm.doc.comparison_data || '{}');
        
        this.charts.comparison.data.datasets = [
            {
                label: this.frm.doc.team_1,
                data: [
                    data.team_1.total,
                    data.team_1.accepted,
                    data.team_1.rejected,
                    data.team_1.accuracy
                ],
                backgroundColor: '#7CD6FD'
            },
            {
                label: this.frm.doc.team_2,
                data: [
                    data.team_2.total,
                    data.team_2.accepted,
                    data.team_2.rejected,
                    data.team_2.accuracy
                ],
                backgroundColor: '#743EE2'
            }
        ];
        
        this.charts.comparison.update();
    }
};

frappe.ui.form.on('Team Comparison', {
    refresh: function(frm) {
        if (!frm.comparison) {
            frm.comparison = new expresso.comparison.TeamComparison(frm);
        }
        frm.comparison.refresh_charts();
    }
});