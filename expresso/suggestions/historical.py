import frappe

class HistoricalAnalyzer:
    def __init__(self, doctype):
        self.doctype = doctype
        
    def get_patterns(self, doc, field):
        conditions = self._get_conditions(doc)
        patterns = frappe.db.sql(f"""
            SELECT `{field}`, COUNT(*) as frequency
            FROM `tab{self.doctype}`
            WHERE {conditions}
            GROUP BY `{field}`
            ORDER BY frequency DESC
            LIMIT 5
        """, as_dict=True)
        
        return [p[field] for p in patterns if p[field] is not None]
        
    def _get_conditions(self, doc):
        conditions = ["docstatus = 1"]
        
        # Add conditions based on linked fields
        if hasattr(doc, 'customer'):
            conditions.append(f"customer = '{doc.customer}'")
        if hasattr(doc, 'supplier'): 
            conditions.append(f"supplier = '{doc.supplier}'")
            
        return " AND ".join(conditions)