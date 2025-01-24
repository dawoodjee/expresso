import frappe
from frappe.utils import now_datetime
from .historical import HistoricalAnalyzer
from .llm_integration import LLMIntegration
from .caching import SuggestionCache
from frappe.model.document import Document

class SuggestionService(Document):
    def __init__(self, doctype):
        self.doctype = doctype
        self.cache = SuggestionCache()
        self.llm = LLMIntegration()
        self.history = HistoricalAnalyzer(doctype)
        
    def get_predictions(self, doc, field):
        cache_key = self._get_cache_key(doc, field)
        cached = self.cache.get(cache_key)
        if cached: return cached
        
        historical = self.history.get_patterns(doc, field)
        llm = self.llm.get_suggestions(doc, field)
        
        merged = self._merge_suggestions(historical, llm)
        self.cache.set(cache_key, merged)
        return merged
        
    def track_suggestion(self, doc, field, value, accepted=False):
        frappe.get_doc({
            'doctype': 'Suggestion History',
            'user': frappe.session.user,
            'doctype': doc.doctype,
            'fieldname': field,
            'suggested_value': value,
            'accepted': accepted,
            'timestamp': now_datetime()
        }).insert()
        
    def _get_cache_key(self, doc, field):
        return f"suggestions:{self.doctype}:{doc.name}:{field}"
        
    def _merge_suggestions(self, historical, llm):
        combined = historical + llm
        return list(dict.fromkeys(combined))