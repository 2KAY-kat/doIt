// Import Firebase modules (ES Module syntax)
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js";
import { getMessaging, getToken, onMessage } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging.js";

// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyBPtoM1O5VpaAmjdNo8QTX5BLTgwtdXTY0",
    authDomain: "doit-2b4af.firebaseapp.com",
    projectId: "doit-2b4af",
    storageBucket: "doit-2b4af",
    messagingSenderId: "672989037293",
    appId: "1:672989037293:web:3af2552677820a945382e4",
    measurementId: "G-BQ2BQ96JTF"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

// Service Worker Registration
if ('serviceWorker' in navigator) {
    try {
        const swRegistration = await navigator.serviceWorker.register(
            '/doIt/firebase-messaging-sw.js',
            {
                scope: '/doIt/',
                updateViaCache: 'none'
            }
        );
        console.log('Service Worker registered successfully:', swRegistration);

        // Get FCM token with service worker
        const currentToken = await getToken(messaging, {
            vapidKey: "BN9kPeitTHd1810RpAhmzC_Vqxd61gjxUIIb_3-p6WO9IB_vMP38oZSM-lfczmnzXT0424tIzBiEvPc5HaNvq9o",
            serviceWorkerRegistration: swRegistration
        });

        if (currentToken) {
            console.log('FCM Token:', currentToken);
            localStorage.setItem('fcm_token', currentToken);
        }
    } catch (error) {
        console.error('Service Worker registration failed:', error);
    }
}

// Request Notification Permission
Notification.requestPermission().then(permission => {
    if (permission === "granted") {
        console.log("✅ Notifications are allowed!");

        // Get Firebase Token
        getToken(messaging, { vapidKey: "BN9kPeitTHd1810RpAhmzC_Vqxd61gjxUIIb_3-p6WO9IB_vMP38oZSM-lfczmnzXT0424tIzBiEvPc5HaNvq9o" })
            .then(currentToken => {
                if (currentToken) {
                    console.log('FCM Token:', currentToken);
                    localStorage.setItem('fcm_token', currentToken);
                } else {
                    console.log('No Registration Token is available.');
                }
            })
            .catch(error => {
                console.log('Error while getting the Token:', error);
            });
    } else {
        console.log("❌ Notifications are not allowed!");
    }
});

// Form submission handler
document.getElementById('todo-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const todoText = document.getElementById('todo-input').value;
    const reminderTime = new Date(document.getElementById('reminder-input').value);
    const priority = document.getElementById('priority-input').value;

    const editingIndex = localStorage.getItem('editingTodoIndex');
    let todos = JSON.parse(localStorage.getItem('todos')) || [];

    if (editingIndex !== null) {
        // Update existing todo
        const index = parseInt(editingIndex);
        todos[index] = {
            ...todos[index],
            text: todoText,
            priority: priority,
            reminderTime: reminderTime.getTime(),
            updatedAt: Date.now()
        };
        localStorage.removeItem('editingTodoIndex');
        
        // Reset submit button text
        const submitButton = document.querySelector('#todo-form button[type="submit"]');
        submitButton.textContent = 'Add Todo';
    } else {
        // Add new todo
        const todo = {
            id: Date.now().toString(),
            text: todoText,
            priority: priority,
            completed: false,
            createdAt: Date.now(),
            reminderTime: reminderTime.getTime()
        };
        todos.push(todo);
    }

    // Save to localStorage
    localStorage.setItem('todos', JSON.stringify(todos));

    // Schedule reminder
    await scheduleReminder(todoText, reminderTime);

    // Reset form and update UI
    e.target.reset();
    renderTodos();
    updateStats();
});

// Render todos with priority styling
function renderTodos() {
    const todoList = document.getElementById('todo-list');
    todoList.innerHTML = '';
    const todos = JSON.parse(localStorage.getItem('todos')) || [];

    todos.forEach((todo, index) => {
        const li = document.createElement('li');
        li.className = `todo-item priority-${todo.priority}`;
        li.innerHTML = `
            <input type="checkbox" ${todo.completed ? 'checked' : ''} 
                   onchange="toggleTodo(${index})">
            <span class="${todo.completed ? 'completed' : ''}">${todo.text}</span>
            <div class="todo-actions">
                <button onclick="removeTodo(${index})">Delete</button>
                <button onclick="editTodo(${index})">Edit</button>
            </div>
        `;
        todoList.appendChild(li);
    });

    updateProgress();
}

// Update statistics
function updateStats() {
    const todos = JSON.parse(localStorage.getItem('todos')) || [];
    const total = todos.length;
    const completed = todos.filter(todo => todo.completed).length;
    const pending = total - completed;

    document.getElementById('total-tasks').textContent = total;
    document.getElementById('completed-tasks').textContent = completed;
    document.getElementById('pending-tasks').textContent = pending;
}

// Update progress bar
function updateProgress() {
    const todos = JSON.parse(localStorage.getItem('todos')) || [];
    const total = todos.length;
    const completed = todos.filter(todo => todo.completed).length;
    const progress = total === 0 ? 0 : (completed / total) * 100;

    document.getElementById('progress').style.width = `${progress}%`;
}

// Toggle todo completion
window.toggleTodo = function(index) {
    let todos = JSON.parse(localStorage.getItem('todos')) || [];
    todos[index].completed = !todos[index].completed;
    localStorage.setItem('todos', JSON.stringify(todos));
    renderTodos();
    updateStats();
};

// Remove To-Do
window.removeTodo = function(index) {
    let todos = JSON.parse(localStorage.getItem('todos')) || [];
    todos.splice(index, 1);
    localStorage.setItem('todos', JSON.stringify(todos));
    renderTodos(); // Call renderTodos instead of removeTodo
}

// Edit todo function
window.editTodo = function(index) {
    const todos = JSON.parse(localStorage.getItem('todos')) || [];
    const todo = todos[index];
    
    // Store the index being edited
    localStorage.setItem('editingTodoIndex', index);
    
    // Populate form with todo data
    document.getElementById('todo-input').value = todo.text;
    
    // Convert timestamp to datetime-local format
    const reminderDate = new Date(todo.reminderTime);
    const formattedDate = reminderDate.toISOString().slice(0, 16);
    document.getElementById('reminder-input').value = formattedDate;
    
    document.getElementById('priority-input').value = todo.priority;
    
    // Change submit button text to indicate editing
    const submitButton = document.querySelector('#todo-form button[type="submit"]');
    submitButton.textContent = 'Update Todo';
};

// Schedule Reminder
async function scheduleReminder(todoText, reminderTime) {
    const now = new Date();
    const delay = reminderTime - now;

    if (delay > 0) {
        const reminder = {
            id: Date.now().toString(),
            text: todoText,
            time: reminderTime.getTime(),
            notified: false
        };

        try {
            // Store in localStorage
            let reminders = JSON.parse(localStorage.getItem('reminders') || '[]');
            reminders.push(reminder);
            localStorage.setItem('reminders', JSON.stringify(reminders));

            // Get the service worker registration
            const registration = await navigator.serviceWorker.ready;

            // Set up timer for notification
            setTimeout(async () => {
                if (!reminder.notified) {
                    // Show notification using service worker
                    await registration.showNotification("doIt Reminder", {
                        body: `It's time to: ${todoText}`,
                        icon: '/doIt/icon-144x144.png',
                        tag: reminder.id,
                        requireInteraction: true,
                        actions: [
                            { action: 'complete', title: 'Mark Complete' },
                            { action: 'snooze', title: 'Snooze' }
                        ]
                    });

                    // Update reminder status
                    reminder.notified = true;
                    reminders = JSON.parse(localStorage.getItem('reminders') || '[]');
                    const index = reminders.findIndex(r => r.id === reminder.id);
                    if (index !== -1) {
                        reminders[index].notified = true;
                        localStorage.setItem('reminders', JSON.stringify(reminders));
                    }
                }
            }, delay);

        } catch (error) {
            console.error('Error scheduling reminder:', error);
            // Fallback to basic notification
            setTimeout(() => sendPushNotification(todoText), delay);
        }
    }
}

// Send Push Notification
function sendPushNotification(todoText) {
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification("doIt Reminder", {
            body: `It's time to: ${todoText}`,
            icon: 'icon-144x144.png'
        });
    }
}

renderTodos();

document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
        // Check for missed notifications
        const reminders = JSON.parse(localStorage.getItem('reminders') || '[]');
        const now = new Date().getTime();

        reminders.forEach(reminder => {
            if (reminder.time <= now && !reminder.notified) {
                sendPushNotification(reminder.text);
                reminder.notified = true;
            }
        });

        localStorage.setItem('reminders', JSON.stringify(reminders));
    }
});