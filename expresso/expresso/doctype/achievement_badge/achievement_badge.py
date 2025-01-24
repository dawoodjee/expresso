import frappe
from frappe.model.document import Document
from frappe.utils import get_url_to_form, get_formatted_email, now
from frappe.realtime import publish_realtime

class AchievementBadge(Document):
    def validate(self):
        self.validate_threshold()

    def validate_threshold(self):
        if self.threshold <= 0:
            frappe.throw("Threshold must be greater than 0")

    def assign_badges(self):
        users = self.get_eligible_users()
        for user in users:
            if not self.has_badge(user):
                self.assign_badge_to_user(user)
                self.send_notifications(user)

    def get_eligible_users(self):
        criteria_field = {
            'Accuracy': 'accuracy',
            'Suggestions': 'total',
            'Accepted': 'accepted',
            'Rejected': 'rejected'
        }[self.criteria]

        return frappe.db.sql(f"""
            SELECT user
            FROM `tabSuggestion History`
            GROUP BY user
            HAVING {criteria_field} >= %s
        """, self.threshold, as_dict=True)

    def assign_badge_to_user(self, user):
        frappe.get_doc({
            'doctype': 'User Badge',
            'user': user,
            'badge': self.name,
            'date_awarded': frappe.utils.nowdate()
        }).insert()

    def has_badge(self, user):
        return frappe.db.exists('User Badge', {
            'user': user,
            'badge': self.name
        })

    def send_notifications(self, user):
        preferences = self.get_user_preferences(user)
        
        if preferences.enable_in_app_notifications:
            self.send_in_app_notification(user)
            
        if preferences.enable_email_notifications:
            self.send_email_notification(user)
            
        if preferences.enable_push_notifications:
            self.send_push_notification(user)

    def get_user_preferences(self, user):
        return frappe.get_doc('User Preferences', {'user': user})

    def send_in_app_notification(self, user):
        notification = frappe.new_doc('Notification Log')
        notification.subject = f'New Achievement: {self.badge_name}'
        notification.for_user = user
        notification.type = 'Alert'
        notification.document_type = 'Achievement Badge'
        notification.document_name = self.name
        notification.message = f"""
            <p>Congratulations! You've earned the <b>{self.badge_name}</b> badge.</p>
            <p>{self.description}</p>
            <p><a href="{get_url_to_form('Achievement Badge', self.name)}">View Badge</a></p>
        """
        notification.insert()
        self.log_notification(user, 'In-App', notification.subject, notification.message)

    def send_email_notification(self, user):
        email = frappe.db.get_value('User', user, 'email')
        if not email:
            return
            
        subject = f'New Achievement: {self.badge_name}'
        message = f"""
            <p>Congratulations! You've earned the <b>{self.badge_name}</b> badge.</p>
            <p>{self.description}</p>
            <p><a href="{get_url_to_form('Achievement Badge', self.name)}">View Badge</a></p>
        """
        
        frappe.sendmail(
            recipients=[email],
            subject=subject,
            message=get_formatted_email(subject, message),
            now=True
        )
        self.log_notification(user, 'Email', subject, message)

    def send_push_notification(self, user):
        message = f'You earned the {self.badge_name} badge!'
        publish_realtime(
            event='badge_earned',
            message=message,
            user=user,
            after_commit=True
        )
        self.log_notification(user, 'Push', 'New Achievement', message)

    def log_notification(self, user, notification_type, subject, message):
        frappe.get_doc({
            'doctype': 'Notification History',
            'user': user,
            'notification_type': notification_type,
            'subject': subject,
            'message': message,
            'timestamp': now()
        }).insert()