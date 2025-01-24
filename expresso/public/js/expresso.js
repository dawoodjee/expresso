frappe.provide("expresso");

$(document).ready(function() {

    frappe.db.get_doc('Settings', 'Settings').then((settings) => {
        console.log("Settings:", settings);
        let allowed_docs = [];
        settings.enabled_doctypes.map((doctype) => {
            allowed_docs.push(doctype.name);
        });

        if (allowed_docs){
            setup_form(allowed_docs);
        }
        return;
    }).catch((error) => {
        return;
    });

    function setup_form(doctypes) {
        let frm_loaded = false;

        for (let i = 0; i < doctypes.length; i++) {
            const doctype = doctypes[i];

            // Attach event listeners to the current DocType
            frappe.ui.form.on(doctype, {
                refresh(frm) {
                    if (!frm_loaded) {
                        frm_loaded = true;
                    }
                    console.log(`Form refreshed for ${doctype}`);
                    // Add your refresh logic here
                },
                onload_post_render(frm) {
                }
            });

            // Break out of the loop if the correct form is loaded
            if (frm_loaded) {
                break;
            }
        }
    }
});