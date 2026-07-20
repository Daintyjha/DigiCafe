import { db } from "./firebase.js";

import {
    collection,
    addDoc,
    query,
    orderBy,
    onSnapshot,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

const chatMessages = document.getElementById("chatMessages");
const chatForm = document.getElementById("chatForm");

const usernameInput = document.getElementById("username");
const messageInput = document.getElementById("messageInput");

const messagesRef = collection(db, "chatMessages");

const messagesQuery = query(
    messagesRef,
    orderBy("createdAt", "asc")
);

onSnapshot(messagesQuery, (snapshot) => {

    chatMessages.innerHTML = "";

    snapshot.forEach((doc) => {

        const data = doc.data();

        const messageElement = document.createElement("div");

        messageElement.classList.add("chat-message");

        messageElement.innerHTML = `
            <strong>${data.username}</strong>
            <p>${data.message}</p>
        `;

        chatMessages.appendChild(messageElement);

    });

    chatMessages.scrollTop = chatMessages.scrollHeight;

});

chatForm.addEventListener("submit", async (event) => {

    event.preventDefault();

    const username = usernameInput.value.trim();
    const message = messageInput.value.trim();

    if (!username || !message) return;

    try {

        await addDoc(messagesRef, {

            username: username,
            message: message,
            createdAt: serverTimestamp()

        });

        messageInput.value = "";

    } catch (error) {

        console.error("Error sending message:", error);

    }

});
