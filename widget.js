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
                    border-radius: 12px;
                    padding: 0.875rem;
                    box-shadow: 0 2px 8px rgba(12, 11, 11, 0.1);
                    max-width: 100%;
                    margin: 0.5rem;
                    font-size: 14px;
                }

                h3 {
                    margin: 0 0 0.75rem 0;
                    font-size: 1.1rem;
                    color: #333;
                }

                .todo-list {
                    margin: 0;
                    padding: 0;
                    list-style: none;
                }

                .todo-item {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 0.75rem 0;
                    border-bottom: 1px solid #eee;
                    gap: 0.5rem;
                }

                .todo-item:last-child {
                    border-bottom: none;
                }

                .todo-text {
                    flex: 1;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }

                .todo-time {
                    font-size: 0.8rem;
                    color: #666;
                    white-space: nowrap;
                }

                @media (max-width: 480px) {
                    :host {
                        margin: 0.25rem;
                        padding: 0.75rem;
                    }

                    .todo-item {
                        padding: 0.625rem 0;
                    }

                    h3 {
                        font-size: 1rem;
                    }
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
                    <span class="todo-text">${todo.text}</span>
                    <span class="todo-time">${new Date(todo.reminderTime).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                    })}</span>
                </li>
            `)
            .join('');
    }
}

customElements.define('doit-widget', DoItWidget);