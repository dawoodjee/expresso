def generate_report_data(user=None, team=None):
    """Generate data for the analytics report"""
    conditions = "WHERE 1=1"
    params = {}
    
    if user:
        conditions += " AND user = %(user)s"
        params['user'] = user
        
    if team:
        conditions += " AND user IN (SELECT user FROM `tabTeam Member` WHERE parent = %(team)s)"
        params['team'] = team
        
    return frappe.db.sql(f"""
        SELECT 
            DATE(timestamp) as date,
            COUNT(*) as total,
            SUM(accepted) as accepted,
            SUM(IF(accepted=0, 1, 0)) as rejected,
            ROUND(SUM(accepted)/COUNT(*)*100, 2) as accuracy
        FROM `tabSuggestion History`
        {conditions}
        GROUP BY DATE(timestamp)
        ORDER BY date
    """, params, as_dict=True)

def generate_preview(user=None, team=None, format='PDF'):
    """Generate preview of report for user or team"""
    data = generate_report_data(user=user, team=team)
    
    if format == 'PDF':
        return {
            'type': 'pdf',
            'content': generate_pdf(data)
        }
    elif format == 'CSV':
        return {
            'type': 'csv',
            'content': generate_csv(data)
        }
    else:
        return {
            'type': 'both',
            'pdf': generate_pdf(data),
            'csv': generate_csv(data)
        }