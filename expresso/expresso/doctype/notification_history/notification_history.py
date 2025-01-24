import frappe
from frappe.model.document import Document
from frappe.utils.csvutils import build_csv_response
from frappe.utils import getdate

class NotificationHistory(Document):
    def before_insert(self):
        if not self.timestamp:
            self.timestamp = frappe.utils.now_datetime()

    def mark_as_read(self):
        self.read = 1
        self.save()

@frappe.whitelist()
def get_user_notifications(user, type=None, status=None, from_date=None, to_date=None):
    filters = {'user': user}
    
    if type:
        filters['notification_type'] = type
        
    if status == 'read':
        filters['read'] = 1
    elif status == 'unread':
        filters['read'] = 0

    if from_date and to_date:
        filters['timestamp'] = ['between', [getdate(from_date), getdate(to_date)]]
    elif from_date:
        filters['timestamp'] = ['>=', getdate(from_date)]
    elif to_date:
        filters['timestamp'] = ['<=', getdate(to_date)]

    return frappe.get_all('Notification History',
        filters=filters,
        fields=['name', 'notification_type', 'subject', 'message', 'timestamp', 'read'],
        order_by='timestamp desc',
        limit=50
    )

@frappe.whitelist()
def mark_as_read(name):
    notification = frappe.get_doc('Notification History', name)
    notification.mark_as_read()

@frappe.whitelist()
def mark_all_as_read(user):
    frappe.db.sql("""
        UPDATE `tabNotification History`
        SET `read` = 1
        WHERE `user` = %s AND `read` = 0
    """, user)
    frappe.db.commit()

@frappe.whitelist()
def export_notifications(user, type=None, status=None, from_date=None, to_date=None):
    filters = {'user': user}
    
    if type:
        filters['notification_type'] = type
        
    if status == 'read':
        filters['read'] = 1
    elif status == 'unread':
        filters['read'] = 0

    if from_date and to_date:
        filters['timestamp'] = ['between', [getdate(from_date), getdate(to_date)]]
    elif from_date:
        filters['timestamp'] = ['>=', getdate(from_date)]
    elif to_date:
        filters['timestamp'] = ['<=', getdate(to_date)]

    notifications = frappe.get_all('Notification History',
        filters=filters,
        fields=['notification_type', 'subject', 'message', 'timestamp', 'read'],
        order_by='timestamp desc'
    )
    
    csv_data = [['Type', 'Subject', 'Message', 'Timestamp', 'Read']]
    for notification in notifications:
        csv_data.append([
            notification.notification_type,
            notification.subject,
            notification.message,
            notification.timestamp,
            'Yes' if notification.read else 'No'
        ])
    
    build_csv_response(csv_data, f'{user}_notifications')