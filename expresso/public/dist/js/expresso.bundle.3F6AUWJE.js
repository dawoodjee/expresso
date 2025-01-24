(() => {
  // ../expresso/expresso/public/js/expresso.js
  frappe.provide("expresso");
  $(document).ready(function() {
    const settings = frappe.model.get_doc("Settings", "Settings");
    console.log(settings);
    frappe.db.get_doc("Settings", "Settings").then((settings2) => {
      console.log("Settings:", settings2);
      let allowed_docs = [];
      settings2.enabled_doctypes.map((doctype) => {
        allowed_docs.push(doctype.name);
      });
      if (allowed_docs) {
        setup_form(allowed_docs);
      }
      return;
    }).catch((error) => {
    });
    function setup_form(doctypes) {
      let frm_loaded = false;
      for (let i = 0; i < doctypes.length; i++) {
        const doctype = doctypes[i];
        frappe.ui.form.on(doctype, {
          refresh(frm) {
            if (!frm_loaded) {
              frm_loaded = true;
            }
            console.log(`Form refreshed for ${doctype}`);
          },
          onload_post_render(frm) {
          }
        });
        if (frm_loaded) {
          break;
        }
      }
    }
  });
})();
//# sourceMappingURL=expresso.bundle.3F6AUWJE.js.map
