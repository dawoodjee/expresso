// Copyright (c) 2025, Fabric and contributors
// For license information, please see license.txt

frappe.ui.form.on("Settings", {
    setup(frm){
        frm.set_query("model", function() {
            return {
                filters: {
                    "provider": frm.doc.provider
                }
            };
        });
        frm.set_query("enabled_doctypes", function() {
            return {
                filters: {
                    "istable": 0
                }
            };
        });
    },
	refresh(frm) {

	},
});
