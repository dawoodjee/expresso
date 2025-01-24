import frappe
from frappe.model.document import Document
from frappe.utils import getdate, add_days

class TeamComparison(Document):
    def before_save(self):
        self.generate_comparison_data()

    def generate_comparison_data(self):
        team1_data = self.get_team_data(self.team_1)
        team2_data = self.get_team_data(self.team_2)
        
        self.comparison_data = frappe.as_json({
            'team_1': team1_data,
            'team_2': team2_data,
            'comparison': self.compare_teams(team1_data, team2_data)
        })

    def get_team_data(self, team):
        return frappe.db.sql("""
            SELECT 
                COUNT(*) as total,
                SUM(accepted) as accepted,
                SUM(IF(accepted=0, 1, 0)) as rejected,
                ROUND(SUM(accepted)/COUNT(*)*100, 2) as accuracy
            FROM `tabSuggestion History`
            WHERE user IN (SELECT user FROM `tabTeam Member` WHERE parent = %s)
            AND timestamp BETWEEN %s AND %s
        """, [team, *self.get_date_range()], as_dict=True)[0]

    def compare_teams(self, team1, team2):
        return {
            'total': team1['total'] - team2['total'],
            'accepted': team1['accepted'] - team2['accepted'],
            'rejected': team1['rejected'] - team2['rejected'],
            'accuracy': team1['accuracy'] - team2['accuracy']
        }

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