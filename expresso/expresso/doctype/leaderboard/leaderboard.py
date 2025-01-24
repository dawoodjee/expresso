import frappe
from frappe.model.document import Document
from frappe.utils import getdate, add_days

class Leaderboard(Document):
    def refresh(self):
        self.update_leaderboard()
        self.save()

    def update_leaderboard(self):
        self.leaderboard_data = frappe.as_json({
            'teams': self.get_team_leaderboard(),
            'users': self.get_user_leaderboard()
        })

    def get_team_leaderboard(self):
        return frappe.db.sql("""
            SELECT 
                team.parent as team,
                COUNT(*) as total,
                SUM(accepted) as accepted,
                SUM(IF(accepted=0, 1, 0)) as rejected,
                ROUND(SUM(accepted)/COUNT(*)*100, 2) as accuracy
            FROM `tabSuggestion History` sh
            JOIN `tabTeam Member` team ON sh.user = team.user
            WHERE sh.timestamp BETWEEN %s AND %s
            GROUP BY team.parent
            ORDER BY accuracy DESC
            LIMIT 10
        """, self.get_date_range(), as_dict=True)

    def get_user_leaderboard(self):
        return frappe.db.sql("""
            SELECT 
                user,
                COUNT(*) as total,
                SUM(accepted) as accepted,
                SUM(IF(accepted=0, 1, 0)) as rejected,
                ROUND(SUM(accepted)/COUNT(*)*100, 2) as accuracy
            FROM `tabSuggestion History`
            WHERE timestamp BETWEEN %s AND %s
            GROUP BY user
            ORDER BY accuracy DESC
            LIMIT 10
        """, self.get_date_range(), as_dict=True)

    def get_date_range(self):
        today = getdate()
        if self.time_period == 'Last Week':
            return [add_days(today, -7), today]
        elif self.time_period == 'Last Month':
            return [add_days(today, -30), today]
        elif self.time_period == 'Last Quarter':
            return [add_days(today, -90), today]
        else:  # Last Year
            return [add_days(today, -365), today]