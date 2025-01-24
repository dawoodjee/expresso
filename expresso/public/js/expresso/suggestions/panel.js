frappe.provide("expresso.ui");

expresso.ui.SuggestionPanel = class {
    constructor(field) {
        this.field = field;
        this.container = this.createContainer();
        this.suggestions = [];
    }

    createContainer() {
        const container = document.createElement('div');
        container.className = 'expresso-suggestion-panel';
        container.style.position = 'absolute';
        container.style.zIndex = 1000;
        container.style.backgroundColor = '#ffffff';
        container.style.border = '1px solid #d1d8dd';
        container.style.borderRadius = '3px';
        container.style.boxShadow = '0 2px 5px rgba(0,0,0,0.1)';
        
        this.field.wrapper.appendChild(container);
        return container;
    }

    show(suggestions) {
        this.suggestions = suggestions;
        this.render();
        this.container.style.display = 'block';
    }

    hide() {
        this.container.style.display = 'none';
    }

    render() {
        this.container.innerHTML = `
            <div class="suggestion-header">
                <span>Suggestions</span>
            </div>
            <div class="suggestion-list">
                ${this.suggestions.map(s => `
                    <div class="suggestion-item" data-value="${s}">
                        ${s}
                    </div>
                `).join('')}
            </div>
        `;
        
        this.addEventListeners();
    }

    addEventListeners() {
        this.container.querySelectorAll('.suggestion-item').forEach(item => {
            item.addEventListener('click', () => {
                this.field.set_value(item.dataset.value);
                this.hide();
            });
        });
    }
};