app_name = "expresso"
app_title = "Expresso"
app_publisher = "Fabric"
app_description = "A Frappe/ERPNext Data Entry Companion ☕"
app_email = "adam.dawoodjee@gmail.com"
app_license = "mit"

import frappe
from expresso.suggestions import SuggestionService

# Add to existing hooks.py content
# app_include_js = "/assets/expresso/js/expresso.bundle.js"
app_include_js = 'expresso.bundle.js'

@frappe.whitelist()
def get_suggestions(doctype, field, doc_data):
    """API endpoint for getting suggestions"""
    try:
        service = SuggestionService(doctype)
        doc = frappe.get_doc(json.loads(doc_data))
        suggestions = service.get_predictions(doc, field)
        return {
            'success': True,
            'suggestions': suggestions
        }
    except Exception as e:
        frappe.log_error(f"Suggestion API Error: {str(e)}")
        return {
            'success': False,
            'error': str(e)
        }

def after_install():
    """Create default AI Provider if not exists"""
    if not frappe.db.exists('AI Provider', 'Open AI'):
        frappe.get_doc({
            'doctype': 'AI Provider',
            'provider': 'Open AI',
            'url': 'https://api.openai.com/v1/chat/completions'
        }).insert()


# Apps
# ------------------

# required_apps = []

# Each item in the list will be shown as an app in the apps page
# add_to_apps_screen = [
# 	{
# 		"name": "expresso",
# 		"logo": "/assets/expresso/logo.png",
# 		"title": "Expresso",
# 		"route": "/expresso",
# 		"has_permission": "expresso.api.permission.has_app_permission"
# 	}
# ]

# Includes in <head>
# ------------------

# include js, css files in header of desk.html
# app_include_css = "/assets/expresso/css/expresso.css"
# app_include_js = "/assets/expresso/js/expresso.js"

# include js, css files in header of web template
# web_include_css = "/assets/expresso/css/expresso.css"
# web_include_js = "/assets/expresso/js/expresso.js"

# include custom scss in every website theme (without file extension ".scss")
# website_theme_scss = "expresso/public/scss/website"

# include js, css files in header of web form
# webform_include_js = {"doctype": "public/js/doctype.js"}
# webform_include_css = {"doctype": "public/css/doctype.css"}

# include js in page
# page_js = {"page" : "public/js/file.js"}

# include js in doctype views
# doctype_js = {"doctype" : "public/js/doctype.js"}
# doctype_list_js = {"doctype" : "public/js/doctype_list.js"}
# doctype_tree_js = {"doctype" : "public/js/doctype_tree.js"}
# doctype_calendar_js = {"doctype" : "public/js/doctype_calendar.js"}

# Svg Icons
# ------------------
# include app icons in desk
# app_include_icons = "expresso/public/icons.svg"

# Home Pages
# ----------

# application home page (will override Website Settings)
# home_page = "login"

# website user home page (by Role)
# role_home_page = {
# 	"Role": "home_page"
# }

# Generators
# ----------

# automatically create page for each record of this doctype
# website_generators = ["Web Page"]

# Jinja
# ----------

# add methods and filters to jinja environment
# jinja = {
# 	"methods": "expresso.utils.jinja_methods",
# 	"filters": "expresso.utils.jinja_filters"
# }

# Installation
# ------------

# before_install = "expresso.install.before_install"
# after_install = "expresso.install.after_install"

# Uninstallation
# ------------

# before_uninstall = "expresso.uninstall.before_uninstall"
# after_uninstall = "expresso.uninstall.after_uninstall"

# Integration Setup
# ------------------
# To set up dependencies/integrations with other apps
# Name of the app being installed is passed as an argument

# before_app_install = "expresso.utils.before_app_install"
# after_app_install = "expresso.utils.after_app_install"

# Integration Cleanup
# -------------------
# To clean up dependencies/integrations with other apps
# Name of the app being uninstalled is passed as an argument

# before_app_uninstall = "expresso.utils.before_app_uninstall"
# after_app_uninstall = "expresso.utils.after_app_uninstall"

# Desk Notifications
# ------------------
# See frappe.core.notifications.get_notification_config

# notification_config = "expresso.notifications.get_notification_config"

# Permissions
# -----------
# Permissions evaluated in scripted ways

# permission_query_conditions = {
# 	"Event": "frappe.desk.doctype.event.event.get_permission_query_conditions",
# }
#
# has_permission = {
# 	"Event": "frappe.desk.doctype.event.event.has_permission",
# }

# DocType Class
# ---------------
# Override standard doctype classes

# override_doctype_class = {
# 	"ToDo": "custom_app.overrides.CustomToDo"
# }

# Document Events
# ---------------
# Hook on document methods and events

# doc_events = {
# 	"*": {
# 		"on_update": "method",
# 		"on_cancel": "method",
# 		"on_trash": "method"
# 	}
# }

# Scheduled Tasks
# ---------------

# scheduler_events = {
# 	"all": [
# 		"expresso.tasks.all"
# 	],
# 	"daily": [
# 		"expresso.tasks.daily"
# 	],
# 	"hourly": [
# 		"expresso.tasks.hourly"
# 	],
# 	"weekly": [
# 		"expresso.tasks.weekly"
# 	],
# 	"monthly": [
# 		"expresso.tasks.monthly"
# 	],
# }

# Testing
# -------

# before_tests = "expresso.install.before_tests"

# Overriding Methods
# ------------------------------
#
# override_whitelisted_methods = {
# 	"frappe.desk.doctype.event.event.get_events": "expresso.event.get_events"
# }
#
# each overriding function accepts a `data` argument;
# generated from the base implementation of the doctype dashboard,
# along with any modifications made in other Frappe apps
# override_doctype_dashboards = {
# 	"Task": "expresso.task.get_dashboard_data"
# }

# exempt linked doctypes from being automatically cancelled
#
# auto_cancel_exempted_doctypes = ["Auto Repeat"]

# Ignore links to specified DocTypes when deleting documents
# -----------------------------------------------------------

# ignore_links_on_delete = ["Communication", "ToDo"]

# Request Events
# ----------------
# before_request = ["expresso.utils.before_request"]
# after_request = ["expresso.utils.after_request"]

# Job Events
# ----------
# before_job = ["expresso.utils.before_job"]
# after_job = ["expresso.utils.after_job"]

# User Data Protection
# --------------------

# user_data_fields = [
# 	{
# 		"doctype": "{doctype_1}",
# 		"filter_by": "{filter_by}",
# 		"redact_fields": ["{field_1}", "{field_2}"],
# 		"partial": 1,
# 	},
# 	{
# 		"doctype": "{doctype_2}",
# 		"filter_by": "{filter_by}",
# 		"partial": 1,
# 	},
# 	{
# 		"doctype": "{doctype_3}",
# 		"strict": False,
# 	},
# 	{
# 		"doctype": "{doctype_4}"
# 	}
# ]

# Authentication and authorization
# --------------------------------

# auth_hooks = [
# 	"expresso.auth.validate"
# ]

# Automatically update python controller files with type annotations for this app.
# export_python_type_annotations = True

# default_log_clearing_doctypes = {
# 	"Logging DocType Name": 30  # days to retain logs
# }

