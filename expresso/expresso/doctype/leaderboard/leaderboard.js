frappe.provide("expresso.leaderboard");

expresso.leaderboard.Leaderboard = class {
    constructor(frm) {
        this.frm = frm;
        this.init_ui();
    }

    init_ui() {
        this.create_leaderboard_sections();
        this.refresh_leaderboard();
    }

    create_leaderboard_sections() {
        this.team_leaderboard = this.create_leaderboard_section('team_leaderboard', 'Team Leaderboard');
        this.user_leaderboard = this.create_leaderboard_section('user_leaderboard', 'User Leaderboard');
    }

    create_leaderboard_section(fieldname, label) {
        const wrapper = $(`<div class="leaderboard-section">
            <h4>${label}</h4>
            <div class="leaderboard-list"></div>
        </div>`);
        
        this.frm.fields_dict[fieldname].$wrapper.append(wrapper);
        return wrapper.find('.leaderboard-list');
    }

    refresh_leaderboard() {
        const data = JSON.parse(this.frm.doc.leaderboard_data || '{}');
        
        this.render_leaderboard(this.team_leaderboard, data.teams || []);
        this.render_leaderboard(this.user_leaderboard, data.users || []);
    }

    render_leaderboard(container, items) {
        container.empty();
        
        items.forEach((item, index) => {
            const rank = index + 1;
            const row = $(`
                <div class="leaderboard-row">
                    <div class="rank">${rank}</div>
                    <div class="name">${item.team || item.user}</div>
                    <div class="accuracy">${item.accuracy}%</div>
                </div>
            `);
            
            if (rank === 1) row.addClass('gold');
            if (rank === 2) row.addClass('silver');
            if (rank === 3) row.addClass('bronze');
            
            container.append(row);
        });
    }
};

frappe.ui.form.on('Leaderboard', {
    refresh: function(frm) {
        if (!frm.leaderboard) {
            frm.leaderboard = new expresso.leaderboard.Leaderboard(frm);
        }
        frm.leaderboard.refresh_leaderboard();
    }
});