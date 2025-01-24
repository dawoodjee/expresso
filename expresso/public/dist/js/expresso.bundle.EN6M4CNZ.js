(() => {
  // ../expresso/expresso/public/js/prediction.js
  frappe.provide("expresso.predict");
  jQuery(document).ready(function() {
    const doctypes = ["Sales Invoice", "Purchase Invoice"];
    let correctFormLoaded = false;
    for (let i = 0; i < doctypes.length; i++) {
      const doctype = doctypes[i];
      frappe.ui.form.on(doctype, {
        refresh(frm) {
          if (!correctFormLoaded) {
            correctFormLoaded = true;
          }
          console.log(`Form refreshed for ${doctype}`);
          if (frm.doctype === doctype && frappe.get_route()[1] === doctype) {
            console.log(`Correct form loaded: ${doctype}`);
          }
          frm.add_custom_button(__("Connection Test"), function() {
            console.log(`1 ${doctype}`);
          });
        },
        onload_post_render(frm) {
          if (!correctFormLoaded) {
            console.log(`Form loaded and rendered for ${doctype}`);
            if (frm.doctype === doctype && frappe.get_route()[1] === doctype) {
              console.log(`Correct form loaded: ${doctype}`);
              correctFormLoaded = true;
            }
          }
        }
      });
      if (correctFormLoaded) {
        break;
      }
    }
  });
})();
//# sourceMappingURL=expresso.bundle.EN6M4CNZ.js.map
