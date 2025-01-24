import frappe
from frappe.utils import now_datetime

class SuggestionCache:
    def __init__(self):
        self.cache = frappe.cache()
        self.default_expiry = 3600  # 1 hour
        
    def get(self, key):
        """Get cached suggestions with timestamp"""
        cached = self.cache.get(key)
        if not cached:
            return None
            
        value, timestamp = cached
        if self._is_expired(timestamp):
            self.delete(key)
            return None
            
        return value
        
    def set(self, key, value, expiry=None):
        """Cache suggestions with current timestamp"""
        expiry = expiry or self.default_expiry
        timestamp = now_datetime().isoformat()
        self.cache.set(key, (value, timestamp), expiry)
        
    def delete(self, key):
        """Remove cached suggestions"""
        self.cache.delete(key)
        
    def invalidate(self, doctype=None):
        """Invalidate cache for specific doctype or all"""
        if doctype:
            keys = self.cache.get_keys(f'suggestions:{doctype}:*')
        else:
            keys = self.cache.get_keys('suggestions:*')
            
        for key in keys:
            self.delete(key)
            
    def _is_expired(self, timestamp):
        """Check if cached data is expired"""
        from datetime import datetime
        cache_time = datetime.fromisoformat(timestamp)
        return (now_datetime() - cache_time).total_seconds() > self.default_expiry