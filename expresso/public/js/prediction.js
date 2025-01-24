frappe.provide("expresso.predict");

class FieldPredictor {
    constructor(frm) {
        console.log('FieldPredictor initialized 1')
        this.frm = frm;
        this.state = 'idle';
        this.fieldQueue = [];
        this.currentField = null;
        this.panel = null;
        this.badge = null;
    }

    async init() {
        // if (!this.isEnabled()) return;
        
        this.loadConfig();
        console.log('FieldPredictor initialized 2', this.isEnabled())
        this.setupFieldListeners();
        await this.startPredictionFlow();
    }

    isEnabled() {
        // return frappe.model.get_doc('Settings', 'Settings')
        //     .enabled_doctypes.includes(this.frm.doctype);
    }

    loadConfig() {
        console.log(3)
        const config = frappe.model.get_doc('AI Model', 'deepseek');
        console.log(3.4, this.frm.doctype)
        this.fieldQueue =  ['customer', 'items', 'taxes_and_charges'];
        //config.prediction_order[this.frm.doctype] ||
        console.log(4)
    }

    setupFieldListeners() {
        this.fieldQueue.forEach(field => {
            const fieldObj = this.frm.fields_dict[field];
            if (fieldObj) {
                this.badge = new expresso.ui.SuggestionBadge(fieldObj);
                this.panel = new expresso.ui.SuggestionPanel(fieldObj);
                
                fieldObj.df.onfocus = () => this.handleFieldFocus(field);
                this.badge.onClick(() => this.showSuggestions(field));
            }
        });
    }

    async handleFieldFocus(field) {
        this.currentField = field;
        this.state = 'predicting';
        this.showLoading();
        
        const suggestions = await this.getSuggestions(field);
        this.showSuggestions(field, suggestions);
        
        this.state = 'idle';
        this.hideLoading();
    }

    async getSuggestions(field) {
        try {
            const response = await frappe.call({
                method: 'expresso.hooks.get_suggestions',
                args: {
                    doctype: this.frm.doctype,
                    field: field,
                    doc_data: JSON.stringify(this.frm.doc)
                }
            });
            
            return response.message.suggestions || [];
        } catch (error) {
            console.error('Prediction error:', error);
            return [];
        }
    }

    showLoading() {
        this.badge.hide();
        this.field.wrapper.classList.add('expresso-loading');
    }

    hideLoading() {
        this.field.wrapper.classList.remove('expresso-loading');
    }

    showSuggestions(field, suggestions) {
        if (suggestions.length > 0) {
            this.badge.show();
            this.panel.show(suggestions);
        } else {
            this.badge.hide();
            this.panel.hide();
        }
    }
}


// (function() {
//     if (window.frappe && frappe.ready) {
//         frappe.ready(function() {
//             if (frappe.get_route()[0] === 'Form') {
//                 var doctype = frappe.get_route()[1];
                
//                 frappe.ui.form.on(doctype, {
//                     onload_post_render: function(frm) {
//                         new FieldPredictor(frm).init();
//                     }
//                 });
//             }
//         });
//     } else {
//         // Fallback if frappe.ready is not immediately available
//         document.addEventListener('DOMContentLoaded', function() {
//             if (window.frappe && frappe.get_route) {
//                 if (frappe.get_route()[0] === 'Form') {
//                     var doctype = frappe.get_route()[1];
                    
//                     frappe.ui.form.on(doctype, {
//                         onload_post_render: function(frm) {
//                             new FieldPredictor(frm).init();
//                         }
//                     });
//                 }
//             }
//         });
//     }
// })();
// import frappe
// frappe.init_ready(function() {
//     console.log(1112)
//     if (frappe.get_route()[0] === 'Form') {
//         console.log(1113)
//         var doctype = frappe.get_route()[1];
        
//         frappe.ui.form.on(doctype, {
//             onload_post_render: function(frm) {
//                 console.log(1114)
//                 new FieldPredictor(frm).init();
//             }
//         });
//     }
// });

// jQuery(document).ready(function() {
//     console.log("DOM fully loaded");

    // Your code here
//     if (frappe.get_route()[0] === 'Form') {
//         var doctype = frappe.get_route()[1];
//         console.log("Current DocType:", doctype);

//         frappe.ui.form.on(doctype, {
//             onload_post_render: function(frm) {
//                 console.log("Form loaded and rendered");
//                 new FieldPredictor(frm).init();
//             }
//         });
//     }
// });

// console.log('01')

jQuery(document).ready(function() {
    // List of DocTypes to target
    const doctypes = ['Sales Invoice', 'Purchase Invoice'];
    let correctFormLoaded = false; // Flag to track if the correct form is loaded

    // Iterate over each DocType
    for (let i = 0; i < doctypes.length; i++) {
        const doctype = doctypes[i];

        // Attach event listeners to the current DocType
        frappe.ui.form.on(doctype, {
            refresh(frm) {
                if (!correctFormLoaded) {
                    correctFormLoaded = true; // Set the flag to true
                }

                console.log(`Form refreshed for ${doctype}`);
                // Add your refresh logic here

                // Check if this is the correct form
                if (frm.doctype === doctype && frappe.get_route()[1] === doctype) {
                    console.log(`Correct form loaded: ${doctype}`);
                    // break; // Exit the loop
                }
                frm.add_custom_button(__("Connection Test"), function() {
                    console.log(`1 ${doctype}`);
                });
            },
            onload_post_render(frm) {
                if (!correctFormLoaded) {
                    console.log(`Form loaded and rendered for ${doctype}`);
                    // Add your onload_post_render logic here

                    // Check if this is the correct form
                    if (frm.doctype === doctype && frappe.get_route()[1] === doctype) {
                        console.log(`Correct form loaded: ${doctype}`);
                        correctFormLoaded = true; // Set the flag to true
                        // break; // Exit the loop
                    }
                }
            }
        });

        // Break out of the loop if the correct form is loaded
        if (correctFormLoaded) {
            break;
        }
    }
});