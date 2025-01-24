frappe.provide("expresso.ui");

expresso.ui.SuggestionBadge = class {
    constructor(field) {
        this.field = field;
        this.badge = this.createBadge();
    }

    createBadge() {
        const badge = document.createElement('div');
        badge.className = 'expresso-suggestion-badge';
        badge.innerHTML = '💡';
        badge.style.position = 'absolute';
        badge.style.right = '-25px';
        badge.style.top = '5px';
        badge.style.cursor = 'pointer';
        badge.style.fontSize = '16px';
        
        this.field.wrapper.style.position = 'relative';
        this.field.wrapper.appendChild(badge);
        return badge;
    }

    show() {
        this.badge.style.display = 'block';
    }

    hide() {
        this.badge.style.display = 'none';
    }

    onClick(callback) {
        this.badge.addEventListener('click', callback);
    }
};
