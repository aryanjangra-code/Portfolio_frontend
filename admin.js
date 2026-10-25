"use strict";

const API_BASE_URL = process.env.backend_url || 'http://localhost:5000';

/* ================================================
   1. DEMO LOGIN CONFIGURATION
================================================ */

/*
   These are temporary, client-side demo credentials.

   Username: admin
   Password: portfolio123

   This is NOT secure authentication. Anyone who can inspect
   the JavaScript can discover the credentials.

   Replace this mechanism with server-side authentication
   before using the admin portal publicly.
*/

const DEMO_CREDENTIALS = {
    username: "admin",
    password: "portfolio123"
};


/* ================================================
   2. DUMMY MESSAGE DATA
================================================ */

let messages = [];

// let messages = [
//     {
//         id: 1,
//         name: "Olivia Bennett",
//         email: "olivia.bennett@example.com",
//         date: "2026-10-18T10:25:00",
//         subject: "Website development enquiry",
//         body:
//             "Hi,\n\n" +
//             "I came across your portfolio and really liked your approach " +
//             "to frontend development. I'm looking for someone to help " +
//             "build a responsive website for a small business.\n\n" +
//             "Would you be available to discuss the project and its scope?\n\n" +
//             "Looking forward to hearing from you.",
//         read: false
//     },

//     {
//         id: 2,
//         name: "Daniel Carter",
//         email: "daniel.carter@example.com",
//         date: "2026-10-17T15:40:00",
//         subject: "Potential frontend collaboration",
//         body:
//             "Hello,\n\n" +
//             "I'm working on a full-stack application and need some help " +
//             "with the frontend experience. Your projects caught my attention, " +
//             "especially the way you approach interactive interfaces.\n\n" +
//             "I'd love to discuss a possible collaboration if you're interested.",
//         read: false
//     },

//     {
//         id: 3,
//         name: "Sophia Williams",
//         email: "sophia.williams@example.com",
//         date: "2026-10-16T09:15:00",
//         subject: "Question about your projects",
//         body:
//             "Hi there,\n\n" +
//             "I had a look at your project gallery and was curious about " +
//             "the technologies you used for your music player project.\n\n" +
//             "I'm learning web development too, and it would be helpful " +
//             "to understand a little more about how you approached it.\n\n" +
//             "Thanks for sharing your work!",
//         read: true
//     },

//     {
//         id: 4,
//         name: "Ethan Mitchell",
//         email: "ethan.mitchell@example.com",
//         date: "2026-10-14T18:05:00",
//         subject: "Internship opportunity",
//         body:
//             "Hello,\n\n" +
//             "We're looking for developers interested in contributing to " +
//             "a web application project. I wanted to reach out and ask " +
//             "whether you would be interested in learning more about the role.\n\n" +
//             "Let me know if you'd like to discuss the details.",
//         read: false
//     }
// ];


/* ================================================
   3. DOM REFERENCES
================================================ */

// Views
const loginView = document.getElementById("login-view");
const dashboardView = document.getElementById("dashboard-view");

// Login form elements
const loginForm = document.getElementById("login-form");
const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");
const loginError = document.getElementById("login-error");

// Dashboard elements
const logoutButton = document.getElementById("logout-button");
const messagesList = document.getElementById("messages-list");
const emptyState = document.getElementById("empty-state");
const currentDate = document.getElementById("current-date");

// Dashboard counts
const totalCount = document.getElementById("total-count");
const unreadCount = document.getElementById("unread-count");
const readCount = document.getElementById("read-count");
const sidebarUnreadCount = document.getElementById("sidebar-unread-count");
const messageTotalLabel = document.getElementById("message-total-label");


/* ================================================
   4. DATE FORMATTING
================================================ */

const dateFormatter = new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric"
});

const todayFormatter = new Intl.DateTimeFormat("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric"
});

function formatMessageDate(dateString) {
    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) {
        return "Date unavailable";
    }

    return dateFormatter.format(date);
}

function displayCurrentDate() {
    currentDate.textContent = todayFormatter.format(new Date());

    currentDate.dateTime = new Date().toISOString();
}


/* ================================================
   5. VIEW SWITCHING
================================================ */

function showView(viewName) {
    const isDashboard = viewName === "dashboard";

    loginView.hidden = isDashboard;
    dashboardView.hidden = !isDashboard;

    if (isDashboard) {
        displayCurrentDate();
    }
}


/* ================================================
   6. LOGIN LOGIC
================================================ */

loginForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const username = usernameInput.value.trim();
    const password = passwordInput.value;

    try {
        const response = await fetch(`${API_BASE_URL}/api/admin/login`, {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        if (!response.ok) throw new Error('Invalid credentials');

        // Clear error and load dashboard
        clearLoginError();
        
        // Fetch actual messages from backend before showing view
        await fetchMessagesFromBackend(); 
        showView("dashboard");

    } catch (error) {
        loginError.hidden = false;
        passwordInput.setAttribute("aria-invalid", "true");
        passwordInput.focus();
    }
});


// Clear the validation error when the user starts correcting their input.
usernameInput.addEventListener("input", clearLoginError);
passwordInput.addEventListener("input", clearLoginError);

function clearLoginError() {
    loginError.hidden = true;
    passwordInput.removeAttribute("aria-invalid");
}


/* ================================================
   7. LOGOUT LOGIC
================================================ */

logoutButton.addEventListener("click", function () {
    // Return to the login screen.
    showView("login");

    // Clear the login fields.
    loginForm.reset();

    // Reset error states.
    loginError.hidden = true;
    passwordInput.removeAttribute("aria-invalid");

    // Place the cursor back in the username field.
    usernameInput.focus();
});


/* ================================================
   8. MESSAGE CARD CREATION
================================================ */

/*
   Build message cards using DOM methods.

   textContent ensures that names, email addresses, subjects,
   and bodies are treated as text instead of executable HTML.
*/

function createMessageCard(message) {
    // List item
    const listItem = document.createElement("li");
    listItem.className = "message-item";
    listItem.dataset.id = String(message.id);

    // Article
    const article = document.createElement("article");
    article.className = "message-card";

    if (message.read) {
        article.classList.add("is-read");
    }

    // Message header
    const cardTop = document.createElement("div");
    cardTop.className = "message-card__top";

    const identity = document.createElement("div");
    identity.className = "message-identity";

    const senderRow = document.createElement("div");
    senderRow.className = "sender-row";

    const senderName = document.createElement("h3");
    senderName.className = "sender-name";
    senderName.textContent = message.name;

    const readIndicator = document.createElement("span");
    readIndicator.className = "read-indicator";
    readIndicator.setAttribute("aria-hidden", "true");

    // Email address is rendered as a mailto link.
    const senderEmail = document.createElement("a");
    senderEmail.className = "sender-email";
    senderEmail.href = `mailto:${message.email}`;
    senderEmail.textContent = message.email;

    // Read/unread status label
    const readState = document.createElement("span");
    readState.className = "read-state";
    readState.textContent = message.read ? "Read" : "Unread";

    senderRow.append(senderName, readIndicator);
    identity.append(senderRow, senderEmail);
    cardTop.append(identity, readState);


    // Message subject
    const subjectContainer = document.createElement("div");
    subjectContainer.className = "message-subject";

    const subjectLabel = document.createElement("span");
    subjectLabel.className = "message-subject-label";
    subjectLabel.textContent = "Subject";

    const subject = document.createElement("h4");
    subject.textContent = message.subject;

    subjectContainer.append(subjectLabel, subject);


    // Message body
    const body = document.createElement("p");
    body.className = "message-body";
    body.textContent = message.body;


    // Card footer
    const cardFooter = document.createElement("footer");
    cardFooter.className = "message-card__footer";

    const date = document.createElement("time");
    date.className = "message-date";
    date.dateTime = message.date;
    date.textContent = formatMessageDate(message.date);

    const actions = document.createElement("div");
    actions.className = "message-actions";


    // Read/unread toggle button
    const readButton = document.createElement("button");
    readButton.type = "button";
    readButton.className = "button button-message button-read";
    readButton.dataset.action = "toggle-read";

    readButton.textContent = message.read
        ? "Mark as unread"
        : "Mark as read";

    readButton.setAttribute(
        "aria-label",
        `${message.read ? "Mark as unread" : "Mark as read"}: ${message.name}`
    );


    // Delete button
    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "button button-message button-delete";
    deleteButton.dataset.action = "delete";
    deleteButton.textContent = "Delete";

    deleteButton.setAttribute(
        "aria-label",
        `Delete message from ${message.name}`
    );


    // Assemble the card.
    actions.append(readButton, deleteButton);

    cardFooter.append(date, actions);

    article.append(
        cardTop,
        subjectContainer,
        body,
        cardFooter
    );

    listItem.appendChild(article);

    return listItem;
}


/* ================================================
   9. RENDER THE INBOX
================================================ */

async function fetchMessagesFromBackend() {
    try {
        const response = await fetch('/api/admin/messages');
        if (response.ok) {
            messages = await response.json();
            
            // Map the MongoDB _id and createdAt to match your frontend logic
            messages = messages.map(msg => ({
                ...msg,
                id: msg._id, // Map MongoDB _id to your existing frontend id property
                date: msg.createdAt 
            }));
            
            renderMessages();
        } else {
            // If token expired, force logout
            showView("login");
        }
    } catch (error) {
        console.error('Failed to load inbox:', error);
    }
}


function renderMessages() {
    // Sort newest messages first.
    const sortedMessages = [...messages].sort(function (a, b) {
        return new Date(b.date) - new Date(a.date);
    });

    // Clear the previous rendered cards.
    messagesList.replaceChildren();

    // Rebuild the DOM from the current message data.
    const fragment = document.createDocumentFragment();

    sortedMessages.forEach(function (message) {
        fragment.appendChild(createMessageCard(message));
    });

    messagesList.appendChild(fragment);

    // Update empty-state visibility.
    const hasMessages = messages.length > 0;

    messagesList.hidden = !hasMessages;
    emptyState.hidden = hasMessages;

    // Update dashboard statistics.
    updateMessageCounts();
}


/* ================================================
   10. UPDATE DASHBOARD COUNTS
================================================ */

function updateMessageCounts() {
    const total = messages.length;

    const unread = messages.filter(function (message) {
        return !message.read;
    }).length;

    const read = messages.filter(function (message) {
        return message.read;
    }).length;

    totalCount.textContent = total;
    unreadCount.textContent = unread;
    readCount.textContent = read;

    // Also update the sidebar's unread count.
    sidebarUnreadCount.textContent = unread;

    messageTotalLabel.textContent =
        `${total} ${total === 1 ? "message" : "messages"}`;
}


/* ================================================
   11. MESSAGE ACTIONS
================================================ */

/*
   Event delegation:
   One listener handles every message button, including
   buttons created when the message list is re-rendered.
*/

messagesList.addEventListener("click", function (event) {
    const button = event.target.closest("button[data-action]");

    // Ignore clicks outside action buttons.
    if (!button || !messagesList.contains(button)) {
        return;
    }

    const listItem = button.closest(".message-item");

    if (!listItem) {
        return;
    }

    const messageId = Number(listItem.dataset.id);

    const message = messages.find(function (item) {
        return item.id === messageId;
    });

    // Ignore a button if the corresponding message no longer exists.
    if (!message) {
        return;
    }

    const action = button.dataset.action;

    if (action === "toggle-read") {
        toggleMessageRead(messageId);
    }

    if (action === "delete") {
        deleteMessage(messageId);
    }
});


/* ================================================
   12. TOGGLE READ STATUS
================================================ */

function toggleMessageRead(messageId) {
    const message = messages.find(function (item) {
        return item.id === messageId;
    });

    if (!message) {
        return;
    }

    // Switch the existing status.
    message.read = !message.read;

    // Re-render the card and statistics.
    renderMessages();
}


/* ================================================
   13. DELETE MESSAGE
================================================ */

// function deleteMessage(messageId) {
//     const message = messages.find(function (item) {
//         return item.id === messageId;
//     });

//     if (!message) {
//         return;
//     }

//     const confirmed = window.confirm(
//         `Delete the message from ${message.name}?`
//     );

//     if (!confirmed) {
//         return;
//     }

//     // Remove the message from the in-memory data.
//     messages = messages.filter(function (item) {
//         return item.id !== messageId;
//     });

//     // Re-rendering removes the message from the DOM and
//     // updates the statistics and empty state.
//     renderMessages();
// }

async function deleteMessage(messageId) {
    const confirmed = window.confirm('Delete this message?');
    if (!confirmed) return;

    try {
        const response = await fetch(`${API_BASE_URL}/api/admin/messages/${messageId}`, {
            method: 'DELETE',
            credentials: 'include'
        });

        if (response.ok) {
            // If the backend deleted it, remove it from the screen
            messages = messages.filter(item => item.id !== messageId);
            renderMessages();
        }
    } catch (error) {
        console.error('Failed to delete', error);
    }
}



/* ================================================
   14. INITIALIZE THE APPLICATION
================================================ */

// Start on the login screen.
showView("login");

// Render the sample messages so the dashboard is ready
// as soon as the user signs in.
renderMessages();
