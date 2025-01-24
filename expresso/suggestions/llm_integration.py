import frappe
import requests
from frappe.utils.password import get_decrypted_password

class LLMIntegration:
    def __init__(self):
        self.provider = frappe.get_doc('AI Provider', 'default')
        self.api_key = get_decrypted_password('AI Provider', self.provider.name, 'api_key')
        
    def get_suggestions(self, doc, field):
        prompt = self._build_prompt(doc, field)
        try:
            response = self._call_llm(prompt)
            return self._parse_response(response)
        except Exception as e:
            frappe.log_error(f"LLM API Error: {str(e)}")
            return []
            
    def _build_prompt(self, doc, field):
        context = {
            'doctype': doc.doctype,
            'field': field,
            'doc': doc.as_dict()
        }
        return f"""
        Based on this {context['doctype']} document context:
        {context['doc']}
        
        Suggest appropriate values for the {field} field.
        Return only the suggested values as a comma-separated list.
        """
        
    def _call_llm(self, prompt):
        response = requests.post(
            self.provider.url,
            headers={
                'Authorization': f'Bearer {self.api_key}',
                'Content-Type': 'application/json'
            },
            json={
                'model': self.provider.model,
                'messages': [{'role': 'user', 'content': prompt}],
                'temperature': 0.7,
                'max_tokens': 100
            },
            timeout=10
        )
        response.raise_for_status()
        return response.json()
        
    def _parse_response(self, response):
        choices = response.get('choices', [])
        if not choices:
            return []
            
        content = choices[0]['message']['content']
        return [s.strip() for s in content.split(',') if s.strip()]