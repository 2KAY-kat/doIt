//service worker registration code type shit
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('firebase-messaging-sw.js')
    .then(registration => {
        console.log('Registered Service worker successffully: ', registration);
    })
    .catch(error => {
        console.log('Failed to Register Service worker: ', error);
    });
}

//firebase configuration
const firebaseConfig = {
    apiKey: "THE_API_KEY_#",
    authDomain: "THE_DOIT_DOMAIN.firebaseapp.com",
    projectId: "THE_DOIT_ID",
    storageBucket: "THE_DOIT_ID.appspot.com",
    messagingSenderId: "THE_SENDER_ID",
    appId: "THE_DOIT_ID",
    measurementId: "THE_DOIT_MEASUREMENT_ID" 
};
firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

Notification.requestPermission().then(permission => {
    if (permission === "granted") {
        console.log("Allowed to receive notifications from this app.");
        messaging.getToken({vapidKey: "THE_DOIT_PUBLIC_VAPID_KEY"}).then(currentToken => {
            if (currentToken) {
                console.log('FCM Token:', currentToken);

                localStorage.setItem('fcm_token', currentToken);
            } else {
                console.log('No Registration Token is available rn.');
            }
        }).catch(error => {
            console.log('There was an Error while getting the Token:', error);
        });
    }
});


//doIt form submission
document.getElementById('todo-form').addEventListener('submit', function(e) {
    e.preventDefault();

    const todoInput = document.getElementById('todo-input');
    const reminderInput = document.getElementById('reminder-input');

    const todoText = todoInput.ariaValueMax;
    const reminderTime = new Date(reminderInput.value);

    if (todoText && reminderTime) {
        addTodoToStorage(todoText, reminderTime);
        scheduleReminder(todoText, reminderTime);
        todoInput.value = '';
        reminderInput.value = '';
    }
});

//doIt storage implemanattion to localStorage
function addTodoToStorage(text, reminderTime) {
    let todos = JSON.parse(localStorage.getItem('todos')) || [];
    
    const  todo = {
        text,
        reminderTime,
        isCompleted: false
    };
    todos.push(todo);
    localStorage.setItem('todos', JSON.stringify(todos));

    renderTodos();
}

//doIt rendering imple...
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

//doIt Removing Imple...
function removeTodo(index) {
    let todos = JSON.parse(localStorage.getItem('todos')) || [];

    todos.splice(index, 1);
    localStorage.setItem('toods', JSON.stringify(todos));

    renderTodos();
}

//doIt Reminder Imple...
function scheduleReminder(todoText, reminderTime) {
    const now = new Date();
    const delay = reminderTime - now;

    if(delay > 0) {
        setTimeout(() => {
            sendPushNotification(todoText);
        }, delay);
    }
}

//doIt Send Notification {pushnotif.}
function sendPushNotification(todoText) {
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification("doIt Reminder", {
            body: `It's time to: ${todoText}`,
            icon: `icon.png`
        });
    }
}

renderTodos();