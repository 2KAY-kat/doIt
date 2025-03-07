// Import Firebase modules (ES Module syntax)
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js";
import { getMessaging, getToken, onMessage } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging.js";

// Service Worker Registration
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('firebase-messaging-sw.js')
        .then(registration => {
            console.log('Service Worker registered successfully:', registration);
        })
        .catch(error => {
            console.log('Service Worker registration failed:', error);
        });
}

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

// Firebase Messaging Instance
const messaging = getMessaging(app);

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

// To-Do Form Submission
document.getElementById('todo-form').addEventListener('submit', function (e) {
    e.preventDefault();

    const todoInput = document.getElementById('todo-input');
    const reminderInput = document.getElementById('reminder-input');

    const todoText = todoInput.value;
    const reminderTime = new Date(reminderInput.value);

    if (todoText && reminderTime) {
        addTodoToStorage(todoText, reminderTime);
        scheduleReminder(todoText, reminderTime);
        todoInput.value = '';
        reminderInput.value = '';
    }
});

// Add To-Do to Local Storage
function addTodoToStorage(text, reminderTime) {
    let todos = JSON.parse(localStorage.getItem('todos')) || [];

    const todo = {
        text,
        reminderTime,
        isCompleted: false
    };
    todos.push(todo);
    localStorage.setItem('todos', JSON.stringify(todos));

    renderTodos();
}

// Render To-Dos
function renderTodos() {
    const todoList = document.getElementById('todo-list');
    todoList.innerHTML = '';
    const todos = JSON.parse(localStorage.getItem('todos')) || [];

    todos.forEach((todo, index) => {
        const li = document.createElement('li');
        li.innerHTML = `
            ${todo.text} <button onClick="removeTodo(${index})">Delete</button>
        `;
        todoList.appendChild(li);
    });
}

// Remove To-Do
window.removeTodo = function(index) {
    let todos = JSON.parse(localStorage.getItem('todos')) || [];
    todos.splice(index, 1);
    localStorage.setItem('todos', JSON.stringify(todos));
    renderTodos(); // Call renderTodos instead of removeTodo
}

// Schedule Reminder
async function scheduleReminder(todoText, reminderTime) {
    const now = new Date();
    const delay = reminderTime - now;

    if (delay > 0) {
        // Store reminder in both localStorage and IndexedDB for service worker
        const reminder = {
            id: Date.now().toString(),
            text: todoText,
            time: reminderTime.getTime(),
            notified: false
        };

        // Store in localStorage
        let reminders = JSON.parse(localStorage.getItem('reminders') || '[]');
        reminders.push(reminder);
        localStorage.setItem('reminders', JSON.stringify(reminders));

        try {
            // Register periodic sync for background checks
            const registration = await navigator.serviceWorker.ready;
            if ('periodicSync' in registration) {
                await registration.periodicSync.register('check-reminders', {
                    minInterval: 60000 // Check every minute
                });
            }

            // Schedule immediate timeout for foreground notifications
            setTimeout(() => {
                if (document.visibilityState === 'visible') {
                    sendPushNotification(todoText);
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