class DoItWidget extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        this.render();
        this.loadTodos();
    }

    async loadTodos() {
        const todos = JSON.parse(localStorage.getItem('todos')) || [];
        const pending = todos.filter(todo => !todo.completed);
        this.updateWidget(pending);
    }

    render() {
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
                    background: white;
                    border-radius: 16px;
                    padding: 1rem;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                }
                .todo-list {
                    margin: 0;
                    padding: 0;
                    list-style: none;
                }
                .todo-item {
                    padding: 0.5rem;
                    border-bottom: 1px solid #eee;
                }
            </style>
            <h3>Upcoming Tasks</h3>
            <ul class="todo-list"></ul>
        `;
    }

    updateWidget(todos) {
        const list = this.shadowRoot.querySelector('.todo-list');
        list.innerHTML = todos
            .slice(0, 5)
            .map(todo => `
                <li class="todo-item">
                    <span>${todo.text}</span>
                    <small>${new Date(todo.reminderTime).toLocaleTimeString()}</small>
                </li>
            `)
            .join('');
    }
}

customElements.define('doit-widget', DoItWidget);