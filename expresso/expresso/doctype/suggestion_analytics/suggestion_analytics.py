import frappe
from frappe.model.document import Document
from frappe.utils import nowdate

class SuggestionAnalytics(Document):
    def refresh(self):
        self.update_analytics()
        self.save()

    def update_analytics(self):
        data = self.get_analytics_data()
        self.total_suggestions = data['total']
        self.accepted_suggestions = data['accepted']
        self.rejected_suggestions = data['rejected']
        self.accuracy_rate = data['accuracy']
        self.most_accurate_field = data['most_accurate']
        self.least_accurate_field = data['least_accurate']
        self.analytics_data = frappe.as_json(data)

    def get_analytics_data(self, user=None, team=None):
        conditions = "WHERE 1=1"
        params = {}
        
        if user:
            conditions += " AND user = %(user)s"
            params['user'] = user
            
        if team:
            conditions += " AND user IN (SELECT user FROM `tabTeam Member` WHERE parent = %(team)s)"
            params['team'] = team
            
        data = frappe.db.sql(f"""
            SELECT 
                COUNT(*) as total,
                SUM(accepted) as accepted,
                SUM(IF(accepted=0, 1, 0)) as rejected,
                ROUND(SUM(accepted)/COUNT(*)*100, 2) as accuracy
            FROM `tabSuggestion History`
            {conditions}
        """, params, as_dict=True)[0]

        fields = frappe.db.sql(f"""
            SELECT 
                fieldname,
                ROUND(SUM(accepted)/COUNT(*)*100, 2) as accuracy
            FROM `tabSuggestion History`
            {conditions}
            GROUP BY fieldname
            ORDER BY accuracy DESC
        """, params, as_dict=True)

        data['most_accurate'] = fields[0]['fieldname'] if fields else ''
        data['least_accurate'] = fields[-1]['fieldname'] if fields else ''
        
        return data

    def get_user_analytics(self, user):
        return self.get_analytics_data(user=user)

    def get_team_analytics(self, team):
        return self.get_analytics_data(team=team)