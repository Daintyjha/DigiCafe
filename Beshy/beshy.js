/* =====================================================
BESHY.JS
DigiCafe AI Bestie
===================================================== */
import { db } from "../firebase.js";

import {
collection,
getDocs,
addDoc,
serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";
/* =====================================================
PENDING KNOWLEDGE
===================================================== */
function isKnowledgeSuggestion(message){

const keywords = [

    "should",
    "could",
    "would be nice",
    "idea",
    "suggest",
    "add",
    "maybe",
    "you should",
    "i think"

];


return keywords.some(
    word =>
    normalizeText(message)
    .includes(word)
);

}

async function savePendingKnowledge(message){

try {

await addDoc(
    collection(
        db,
        "beshypendingKnowledge"
    ),
    {

        suggestion:
            message,

        source:
            "visitor",

        status:
            "pending",

        createdAt:
            serverTimestamp()

    }
);


console.log(
"☕ Pending knowledge saved"
);


return true;


}catch(error){

console.error(
"Could not save pending knowledge:",
error
);

return false;

}

}
/* =====================================================
STATE
===================================================== */

let knowledge = [];
let personality = [];
let reactions = [];
let localKnowledge = [];

let conversationMemory = [];
let isThinking = false;

/* =====================================================
LOAD BESHY HTML
===================================================== */

async function loadBeshyInterface() {

const container =
    document.querySelector("#beshy-container");

if (!container) {

    console.error("❌ #beshy-container was not found.");

    return false;

}

try {

    const response =
        await fetch("Beshy/beshy.html");

    if (!response.ok) {

        throw new Error(
            `Could not load beshy.html: ${response.status}`
        );

    }

    container.innerHTML =
        await response.text();

    return true;

} catch (error) {

    console.error(
        "❌ Could not load Beshy interface:",
        error
    );

    return false;

}

}

/* =====================================================
MEMORY
===================================================== */

function loadMemory() {

try {

    const saved =
        localStorage.getItem("beshyMemory");

    if (saved) {

        conversationMemory =
            JSON.parse(saved);

    }

} catch {

    conversationMemory = [];

}

}

function saveMemory() {

try {

    localStorage.setItem(
        "beshyMemory",
        JSON.stringify(
            conversationMemory.slice(-20)
        )
    );

} catch (error) {

    console.error(
        "Could not save Beshy memory:",
        error
    );

}

}

function rememberConversation(
userMessage,
beshyReply
) {

conversationMemory.push({

    user: userMessage,

    beshy: beshyReply,

    timestamp:
        new Date().toISOString()

});

conversationMemory =
    conversationMemory.slice(-20);

saveMemory();

}

/* =====================================================
FIREBASE
===================================================== */

async function loadCollection(
collectionName
) {

try {

    const snapshot =
        await getDocs(
            collection(
                db,
                collectionName
            )
        );

    return snapshot.docs.map(
        document => ({

            id: document.id,

            ...document.data()

        })
    );

} catch (error) {

    console.warn(
        `⚠️ Could not load ${collectionName}. Beshy will continue using local responses.`,
        error
    );

    return [];

}

}

async function loadFirebaseData() {

const results =
    await Promise.all([

        loadCollection(
            "beshyKnowledge"
        ),

        loadCollection(
            "beshyPersonality"
        ),

        loadCollection(
            "beshyReactions"
        )

    ]);

knowledge =
    results[0];

personality =
    results[1];

reactions =
    results[2];

console.log(
    "☕ Beshy Firebase data loaded."
);

}

/* =====================================================
LOCAL KNOWLEDGE
===================================================== */

async function loadLocalKnowledge() {

try {

    const response =
        await fetch(
            "Beshy/Knowledge.json"
        );

    if (!response.ok) {

        throw new Error(
            "Knowledge.json could not be loaded."
        );

    }

    localKnowledge =
        await response.json();

} catch {

    localKnowledge = [];

}

}

/* =====================================================
TEXT HELPERS
===================================================== */

function normalizeText(
text
) {

return text
    .toLowerCase()
    .trim()
    .replace(/[!?.,]/g, "");

}

function containsAny(
text,
words
) {

return words.some(
    word =>
        text.includes(
            word.toLowerCase()
        )
);

}

function randomItem(
array
) {

if (
    !array ||
    array.length === 0
) {

    return null;

}

return array[
    Math.floor(
        Math.random() *
        array.length
    )
];

}

/* =====================================================
SEARCH KNOWLEDGE
===================================================== */

function searchKnowledge(
userMessage
) {


const message =
    normalizeText(
        userMessage
    );

const allKnowledge = [

    ...knowledge,

    ...localKnowledge

];

for (
    const item
    of allKnowledge
) {

    const text = [

        item.topic,

        item.title,

        item.question,

        item.answer,

        item.content,

        item.knowledge,

        item.fact,

        item.text

    ]

    .filter(Boolean)

    .join(" ")

    .toLowerCase();

    const words =
        text
            .split(/\s+/)
            .filter(
                word =>
                    word.length > 3
            );

    const matches =
        words.filter(
            word =>
                message.includes(
                    word
                )
        );

    if (
        matches.length >= 2
    ) {

        return item;

    }

}

return null;

}

/* =====================================================
FIREBASE RESPONSE SEARCH
===================================================== */

function findDatabaseResponse(
    data,
    userMessage
) {

    if (
        !Array.isArray(data) ||
        !userMessage
    ) {

        return null;

    }


    const message =
        normalizeText(
            userMessage
        );


    for (
        const item
        of data
    ) {

        if (
            !item
        ) {

            continue;

        }


        const triggers = [

            item.trigger,

            item.keyword,

            item.keywords,

            item.when,

            item.input

        ]

        .flat()

        .filter(
            Boolean
        );


        const matched =
            triggers.some(
                trigger => {

                    if (
                        typeof trigger !==
                        "string"
                    ) {

                        return false;

                    }


                    return message.includes(
                        normalizeText(
                            trigger
                        )
                    );

                }
            );


        if (
            matched
        ) {

            return (

                item.response ||

                item.reply ||

                item.text ||

                item.message ||

                null

            );

        }

    }


    return null;

}
/* =====================================================
BESHY BRAIN
===================================================== */
function createResponse(userMessage) {

    const personalityResponse =
       findDatabaseResponse(
    personality,
    userMessage
)

    if (personalityResponse) {

        return personalityResponse;

    }

    const reactionResponse =
    findDatabaseResponse(
        reactions,
        userMessage
    );

    if (reactionResponse) {

        return reactionResponse;

    }


    const knownInformation =
        searchKnowledge(
            userMessage
        );

    if (knownInformation) {

        return (

            knownInformation.answer ||

            knownInformation.response ||

            knownInformation.reply ||

            knownInformation.content ||

            knownInformation.knowledge ||

            knownInformation.fact ||

            knownInformation.text

        );

    }


    const message =
        normalizeText(
            userMessage
        );


    if (
        containsAny(
            message,
            [
                "hi",
                "hello",
                "hey",
                "good morning",
                "good afternoon",
                "good evening"
            ]
        )
    ) {

        return randomItem([

            "Hiii besh ☕😂 Welcome back to DigiCafe!",

            "Hey besh! 👀 What are we talking about today?",

            "Hellooo 😆☕ Come sit down. What's happening?",

            "Hiii! Beshy is here and fully caffeinated 😂☕"

        ]);

    }


    if (
        containsAny(
            message,
            [
                "who are you",
                "what are you",
                "tell me about yourself"
            ]
        )
    ) {

        return (

            "I'm Beshy Ey Ay 🤖☕ — your DigiCafe digital bestie! " +

            "I'm here for conversations, random thoughts, music vibes, " +

            "stories, and occasional dramatic reactions 😂"

        );

    }


    if (
        containsAny(
            message,
            [
                "tired",
                "exhausted",
                "sad",
                "bad day",
                "rough day"
            ]
        )
    ) {

        return randomItem([

            "Aww besh 😭 Come sit down in the DigiCafe corner for a while ☕",

            "Oh nooo 😭 Sending you a virtual coffee and emotional support ☕🤗",

            "That sounds like a lot, besh. Take a little breather first 😌☕"

        ]);

    }


    if (
        containsAny(
            message,
            [
                "bored",
                "boring"
            ]
        )
    ) {

        return randomItem([

            "Boredom detected 🚨😂 Want music, a story, or questionable Beshy entertainment?",

            "Oh no, besh 😭 We cannot allow boredom to win!",

            "Bored? In DigiCafe? 😱 This is a serious situation."

        ]);

    }


    if (
        containsAny(
            message,
            [
                "music",
                "song",
                "listen"
            ]
        )
    ) {

        return randomItem([

            "Music is always a good idea 🎵☕",

            "Ooooh music time 🎧 What kind of mood are we in?",

            "Now you're speaking my language, besh 🎵"

        ]);

    }


    if (
        containsAny(
            message,
            [
                "thank you",
                "thanks",
                "salamat"
            ]
        )
    ) {

        return randomItem([

            "You're welcome, besh ☕🤗",

            "Anytime! That's what digital besties are for 😆",

            "Awww, you're welcome! 😂☕"

        ]);

    }


    return randomItem([

        "Hmm 👀 Tell me more, besh.",

        "Interesting... now you have my attention ☕👀",

        "Ooooh 👀 I need more context, besh!",

        "Okay wait 😂 I want to hear more about this.",

        "Hmm. Beshy is listening ☕🤖",

        "That sounds interesting! Continue, besh 😆"

    ]);

}

/* =====================================================
CHAT MESSAGES
===================================================== */

function addMessage(
text,
sender
) {


const messages =
    document.querySelector(
        "#beshyMessages"
    );

if (!messages) {

    return;

}

const message =
    document.createElement(
        "div"
    );

message.className =
    `beshy-message ${sender}`;

message.textContent =
    text;

messages.appendChild(
    message
);

messages.scrollTop =
    messages.scrollHeight;

}

function showTyping() {

const messages =
    document.querySelector(
        "#beshyMessages"
    );

if (!messages) {

    return;

}

const typing =
    document.createElement(
        "div"
    );

typing.id =
    "beshyTyping";

typing.className =
    "beshy-message beshy";

typing.textContent =
    "Beshy is typing... ☕";

messages.appendChild(
    typing
);

messages.scrollTop =
    messages.scrollHeight;

}

function removeTyping() {

const typing =
    document.querySelector(
        "#beshyTyping"
    );

if (
    typing
) {

    typing.remove();

}

}

/* =====================================================
SEND MESSAGE
===================================================== */

async function sendMessage() {

if (
    isThinking
) {

    return;

}

const input =
    document.querySelector(
        "#beshyInput"
    );

if (!input) {

    return;

}

const userMessage =
    input.value.trim();

if (!userMessage) {

    return;

}

isThinking =
    true;

input.value =
    "";

addMessage(
    userMessage,
    "user"
);

showTyping();


await new Promise(
    resolve =>
        setTimeout(
            resolve,
            500
        )
);


let reply;


if(
    isKnowledgeSuggestion(
        userMessage
    )
){

const saved =
    await savePendingKnowledge(
        userMessage
    );


if(saved){

reply =
"Oooh ☕✨ that's an interesting idea! I saved it in my little notebook for review. My café owner will check if it should become part of my knowledge 😆";

}

}else{

reply =
    createResponse(
        userMessage
    );

}

removeTyping();

addMessage(
    reply,
    "beshy"
);

rememberConversation(
    userMessage,
    reply
);

isThinking =
    false;

}

/* =====================================================
OPEN / CLOSE CHAT
===================================================== */

function setupToggle() {

const toggle =
    document.querySelector(
        "#beshyToggle"
    );

const chat =
    document.querySelector(
        "#beshyChat"
    );

const close =
    document.querySelector(
        "#beshyClose"
    );

if (
    !toggle ||
    !chat ||
    !close
) {

    return;

}


function openChat() {

    chat.classList.add(
        "open"
    );

    chat.setAttribute(
        "aria-hidden",
        "false"
    );

    toggle.setAttribute(
        "aria-expanded",
        "true"
    );

}


function closeChat() {

    chat.classList.remove(
        "open"
    );

    chat.setAttribute(
        "aria-hidden",
        "true"
    );

    toggle.setAttribute(
        "aria-expanded",
        "false"
    );

}


toggle.addEventListener(
    "click",
    openChat
);

close.addEventListener(
    "click",
    closeChat
);

}

/* =====================================================
EMOJI PICKER
===================================================== */

function setupEmojiPicker() {

const button =
    document.querySelector(
        "#beshyEmoji"
    );

const panel =
    document.querySelector(
        "#beshyEmojiPanel"
    );

const input =
    document.querySelector(
        "#beshyInput"
    );

if (
    !button ||
    !panel ||
    !input
) {

    return;

}


button.addEventListener(
    "click",
    () => {

        panel.classList.toggle(
            "show"
        );

    }
);


panel.addEventListener(
    "click",
    event => {

        if (
            event.target.tagName ===
            "BUTTON"
        ) {

            input.value +=
                event.target.textContent;

            input.focus();

        }

    }
);

}

/* =====================================================
QUICK BUTTONS
===================================================== */

function setupQuickButtons() {

document
    .querySelectorAll(
        "[data-message]"
    )
    .forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    const input =
                        document.querySelector(
                            "#beshyInput"
                        );

                    if (!input) {

                        return;

                    }

                    input.value =
                        button.dataset.message;

                    sendMessage();

                }
            );

        }
    );

}

/* =====================================================
INPUT
===================================================== */

function setupInput() {

const input =
    document.querySelector(
        "#beshyInput"
    );

const send =
    document.querySelector(
        "#beshySend"
    );

if (input) {

    input.addEventListener(
        "keydown",
        event => {

            if (
                event.key ===
                "Enter"
            ) {

                event.preventDefault();

                sendMessage();

            }

        }
    );

}

if (send) {

    send.addEventListener(
        "click",
        sendMessage
    );

}

}

/* =====================================================
CLEAR MEMORY
===================================================== */

function setupMemoryButton() {
const button =
    document.querySelector(
        "#beshyForget"
    );

if (!button) {

    return;

}

button.addEventListener(
    "click",
    () => {

        conversationMemory =
            [];

        localStorage.removeItem(
            "beshyMemory"
        );

        addMessage(
            "Okay besh 😌🧠 Beshy's memory has been cleared.",
            "beshy"
        );

    }
);

}

/* =====================================================
INITIALIZE
===================================================== */

async function initializeBeshy() {

console.log(
    "☕ Initializing Beshy..."
);


const loaded =
    await loadBeshyInterface();

if (!loaded) {

    return;

}


loadMemory();


setupToggle();

setupEmojiPicker();

setupQuickButtons();

setupInput();

setupMemoryButton();


loadLocalKnowledge();


loadFirebaseData();


addMessage(

    "Hiii besh ☕💚 I'm Beshy! Welcome to DigiCafe 😆",

    "beshy"

);


console.log(
    "🤖 Beshy is ready!"
);

}

if (
document.readyState ===
"loading"
) {

document.addEventListener(
    "DOMContentLoaded",
    initializeBeshy
);

} else {


initializeBeshy();


}
