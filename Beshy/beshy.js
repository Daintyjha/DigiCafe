import { db } from "../firebase.js";

import {
    collection,
    getDocs
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

console.log("☕ Beshy Firebase connected!", db);


/* =====================================================
   LOAD BESHY HTML
===================================================== */

document.addEventListener("DOMContentLoaded", async function () {

    const container =
        document.getElementById("beshy-container");

    if (!container) {
        console.error("❌ Beshy container missing.");
        return;
    }

    try {

        const response =
            await fetch("Beshy/beshy.html");

        if (!response.ok) {
            throw new Error("Beshy HTML failed to load.");
        }

        container.innerHTML =
            await response.text();

        console.log("💚 Beshy HTML loaded.");

        startBeshy();

    } catch (error) {

        console.error(
            "❌ Beshy loading error:",
            error
        );
    }
});


/* =====================================================
   START BESHY
===================================================== */

function startBeshy() {

    const toggle =
        document.getElementById("beshyToggle");

    const chat =
        document.getElementById("beshyChat");

    const closeButton =
        document.getElementById("beshyClose");

    const input =
        document.getElementById("beshyInput");

    const sendButton =
        document.getElementById("beshySend");

    const messages =
        document.getElementById("beshyMessages");

    const forgetButton =
        document.getElementById("beshyForget");

    const emojiButton =
        document.getElementById("beshyEmoji");

    const emojiPanel =
        document.getElementById("beshyEmojiPanel");


    if (
        !toggle ||
        !chat ||
        !closeButton ||
        !input ||
        !sendButton ||
        !messages
    ) {

        console.error("❌ Beshy elements missing.");
        return;
    }


    console.log("💚 Beshy is ready!");


    /* =====================================================
       BESHY DATA
    ===================================================== */

    let sharedKnowledge = [];

    let beshyPersonality = {};

    let beshyReactions = [];

    let conversationMemory = [];


    /* =====================================================
       HELPER FUNCTIONS
    ===================================================== */

    function randomResponse(list) {

        if (
            !Array.isArray(list) ||
            list.length === 0
        ) {
            return "I am still learning, besh. 💚";
        }

        return list[
            Math.floor(
                Math.random() * list.length
            )
        ];
    }


    function cleanText(text) {

        return String(text)
            .toLowerCase()
            .replace(/[^\p{L}\p{N}\s]/gu, "")
            .replace(/\s+/g, " ")
            .trim();
    }


    function beshyName() {

        return (
            beshyPersonality.name ||
            "Beshy"
        );
    }


    function displayMessage(text, type) {

        const message =
            document.createElement("div");

        message.className =
            "beshy-message " + type;

        String(text)
            .split("\n")
            .forEach(function (line) {

                const paragraph =
                    document.createElement("p");

                paragraph.textContent =
                    line || " ";

                message.appendChild(
                    paragraph
                );
            });

        messages.appendChild(message);

        messages.scrollTop =
            messages.scrollHeight;
    }


    function formatKnowledge(items) {

        return items
            .map(function (item) {

                if (typeof item === "string") {
                    return item;
                }

                if (
                    item &&
                    typeof item === "object"
                ) {

                    return (
                        item.answer ||
                        item.reply ||
                        item.description ||
                        item.text ||
                        JSON.stringify(item)
                    );
                }

                return String(item);
            })
            .join("\n\n");
    }


    /* =====================================================
       LOAD FIRESTORE DATA
    ===================================================== */

    async function loadFirebaseData() {

        try {

            const knowledgeSnapshot =
                await getDocs(
                    collection(
                        db,
                        "beshyKnowledge"
                    )
                );

            knowledgeSnapshot.forEach(function (documentSnapshot) {

                const data =
                    documentSnapshot.data();

                const value =
                    data.answer ||
                    data.reply ||
                    data.text ||
                    data.description;

                if (value) {
                    sharedKnowledge.push(value);
                }
            });


            const personalitySnapshot =
                await getDocs(
                    collection(
                        db,
                        "beshyPersonality"
                    )
                );

            personalitySnapshot.forEach(function (documentSnapshot) {

                beshyPersonality = {
                    ...beshyPersonality,
                    ...documentSnapshot.data()
                };
            });


            const reactionSnapshot =
                await getDocs(
                    collection(
                        db,
                        "beshyReactions"
                    )
                );

            reactionSnapshot.forEach(function (documentSnapshot) {

                beshyReactions.push(
                    documentSnapshot.data()
                );
            });


            console.log(
                "🔥 Firebase brain loaded.",
                {
                    sharedKnowledge,
                    beshyPersonality,
                    beshyReactions
                }
            );

        } catch (error) {

            console.error(
                "❌ Firebase brain error:",
                error
            );
        }
    }


    /* =====================================================
       LOAD LOCAL KNOWLEDGE.JSON
    ===================================================== */

    async function loadLocalKnowledge() {

        try {

            const response =
                await fetch("Knowledge.json");

            if (!response.ok) {
                throw new Error(
                    "Knowledge.json failed to load."
                );
            }

            const data =
                await response.json();

            if (Array.isArray(data)) {

                sharedKnowledge.push(
                    ...data
                );
            }

            console.log(
                "📚 Local knowledge loaded.",
                sharedKnowledge
            );

        } catch (error) {

            console.error(
                "❌ Knowledge.json error:",
                error
            );
        }
    }


    /* =====================================================
       SEARCH BESHY KNOWLEDGE
    ===================================================== */

    function findKnowledge(message) {

        const words =
            cleanText(message)
                .split(" ")
                .filter(function (word) {
                    return word.length > 3;
                });

        if (words.length === 0) {
            return [];
        }

        const matches =
            sharedKnowledge.filter(function (item) {

                const content =
                    cleanText(
                        typeof item === "string"
                            ? item
                            : JSON.stringify(item)
                    );

                return words.some(function (word) {
                    return content.includes(word);
                });
            });

        return matches.slice(0, 3);
    }


    /* =====================================================
       CHECK FIREBASE REACTIONS
    ===================================================== */

    function checkReactions(message) {

        const cleanedMessage =
            cleanText(message);

        for (
            const reaction
            of beshyReactions
        ) {

            if (
                reaction.trigger &&
                cleanedMessage.includes(
                    cleanText(
                        reaction.trigger
                    )
                )
            ) {

                if (
                    Array.isArray(
                        reaction.responses
                    ) &&
                    reaction.responses.length > 0
                ) {

                    return randomResponse(
                        reaction.responses
                    );
                }

                if (reaction.response) {
                    return reaction.response;
                }

                if (reaction.reply) {
                    return reaction.reply;
                }
            }
        }

        return null;
    }


    /* =====================================================
       BESHY PERSONALITY
    ===================================================== */

    function beshyGreeting() {

        return randomResponse([

            `Uy! Hello besh! 💚 I am ${beshyName()}, your Digital Cafe buddy. ☕`,

            "Finally! You arrived. 😌 I was here drinking imaginary coffee while waiting.",

            "Hello besh! ✨ Ready for music, stories, or random conversations?",

            "Welcome to DigiCafe, besh! ☕ What would you like to explore today?"
        ]);
    }


    function sassyResponse() {

        return randomResponse([

            "Beh... you really asked me to roast you? The confidence is impressive. 😂",

            "Besh, I support your chaos. Questionable choices, but entertaining. 😭",

            "Activating tiny digital attitude mode. ✨",

            "The drama. The confidence. The energy. I respect it. 😂"
        ]);
    }


    function funnyResponse() {

        return randomResponse([

            "My humor runs on coffee and questionable digital decisions. ☕😂",

            "I would tell a computer joke, but it might need a restart from laughing. 😭",

            "I am 90% code and 10% cafe drama. ✨",

            "Why did the computer visit DigiCafe? It needed a byte to eat. 😂"
        ]);
    }


    /* =====================================================
       LOCAL BESHY BRAIN
    ===================================================== */

    function generateLocalResponse(text) {

        const lower =
            cleanText(text);


        /* GREETINGS */

        if (
            /^(hi|hello|hey|hiya|kumusta|kamusta|uy|good morning|good afternoon|good evening)\b/
                .test(lower)
        ) {
            return beshyGreeting();
        }


        /* FIREBASE REACTIONS */

        const reaction =
            checkReactions(text);

        if (reaction) {
            return reaction;
        }


        /* THANK YOU */

        if (
            lower.includes("thank you") ||
            lower.includes("thanks") ||
            lower.includes("salamat")
        ) {

            return randomResponse([

                "You are welcome, besh! 💚",

                "Anytime! That is what cafe buddies are for. ☕",

                "No problem, besh. I am happy to help. ✨"
            ]);
        }


        /* GOODBYE */

        if (
            lower.includes("goodbye") ||
            lower.includes("bye") ||
            lower.includes("see you") ||
            lower.includes("later")
        ) {

            return randomResponse([

                "Bye for now, besh! Come back anytime. 💚",

                "See you later! I will protect the imaginary coffee while you are gone. ☕😂",

                "Take care, besh! ✨"
            ]);
        }


        /* WHO IS BESHY */

        if (
            lower.includes("who are you") ||
            lower.includes("what are you") ||
            lower.includes("who is beshy") ||
            lower.includes("ano ka")
        ) {

            return (
                `I'm ${beshyName()}! 💚\n\n` +
                "I am your Digital Cafe friend. ☕✨\n\n" +
                "I can help you explore music, novels, DigiCafe information, " +
                "and anything stored in my Firebase knowledge.\n\n" +
                "Basically, I am your slightly chaotic cafe buddy. 😂"
            );
        }


        /* HELP */

        if (
            lower.includes("what can you do") ||
            lower.includes("help me") ||
            lower === "help" ||
            lower.includes("how can you help")
        ) {

            return (
                "I can help you explore DigiCafe. 💚\n\n" +
                "Try asking me about:\n" +
                "• Music and playlists\n" +
                "• Novels and stories\n" +
                "• DigiCafe information\n" +
                "• Jokes and fun replies\n" +
                "• Anything stored in my Firebase knowledge"
            );
        }


        /* DIGICAFE */

        if (
            lower.includes("digicafe") ||
            lower.includes("digital cafe")
        ) {

            const knowledge =
                findKnowledge(text);

            if (knowledge.length > 0) {

                return (
                    "Welcome to DigiCafe, besh! ☕✨\n\n" +
                    formatKnowledge(knowledge)
                );
            }

            return (
                "DigiCafe is your cozy digital hangout where you can listen to music, " +
                "read stories, explore creative content, and chill with me. 💚"
            );
        }


        /* SASS */

        if (
            lower.includes("sassy") ||
            lower.includes("roast") ||
            lower.includes("savage")
        ) {
            return sassyResponse();
        }


        /* JOKES */

        if (
            lower.includes("funny") ||
            lower.includes("joke") ||
            lower.includes("laugh")
        ) {
            return funnyResponse();
        }


        /* MUSIC */

        if (
            lower.includes("music") ||
            lower.includes("song") ||
            lower.includes("playlist") ||
            lower.includes("listen")
        ) {

            return randomResponse([

                "Music time? Excellent choice, besh. 🎵 Check the DigiCafe music corner.",

                "Finally, someone with taste. 😂 Let us create some cafe vibes.",

                "Need relaxing, romantic, dramatic, or main-character music? 😌",

                "Explore the music section and choose the mood that fits your day. 🎧"
            ]);
        }


        /* NOVELS */

        if (
            lower.includes("book") ||
            lower.includes("novel") ||
            lower.includes("story") ||
            lower.includes("read") ||
            lower.includes("chapter")
        ) {

            return randomResponse([

                "Reading time! 📚✨ Grab a story and get comfortable.",

                "A reader? Very classy behavior, besh. 😌📖",

                "Careful... one chapter can become 3 AM. 😂",

                "Visit the story section and choose your next emotional adventure. 📚"
            ]);
        }


        /* CONTACT */

        if (
            lower.includes("contact") ||
            lower.includes("email") ||
            lower.includes("phone")
        ) {

            const knowledge =
                findKnowledge(text);

            if (knowledge.length > 0) {
                return formatKnowledge(knowledge);
            }

            return (
                "You can check the Contact section of DigiCafe for the available contact information. 💚"
            );
        }


        /* FIREBASE KNOWLEDGE SEARCH */

        const knowledge =
            findKnowledge(text);

        if (knowledge.length > 0) {

            return (
                "Ooooh, I found something in my Firebase brain. 🧠💚\n\n" +
                formatKnowledge(knowledge)
            );
        }


        /* FALLBACK */

        return randomResponse([

            "Hmm, I do not know that one yet, besh. ☕ Try asking me about DigiCafe, music, novels, or the website.",

            "My Firebase brain does not have that answer yet. 😅 Try asking in a different way.",

            "I am still learning, besh. 💚 Ask me about DigiCafe, songs, novels, jokes, or my personality.",

            "That topic is not in my knowledge yet. Try asking in another way. ☕"
        ]);
    }


    /* =====================================================
       MEMORY
    ===================================================== */

    function saveConversation(role, message) {

        conversationMemory.push({
            role: role,
            message: message,
            time: new Date().toISOString()
        });

        try {

            localStorage.setItem(
                "beshyConversation",
                JSON.stringify(
                    conversationMemory
                )
            );

        } catch (error) {

            console.error(
                "❌ Could not save Beshy memory:",
                error
            );
        }
    }


    function loadMemory() {

        try {

            const saved =
                JSON.parse(
                    localStorage.getItem(
                        "beshyConversation"
                    )
                );

            if (Array.isArray(saved)) {
                conversationMemory = saved;
            }

        } catch (error) {

            conversationMemory = [];

            console.error(
                "❌ Could not load Beshy memory:",
                error
            );
        }
    }


    /* =====================================================
       SEND MESSAGE
    ===================================================== */

    function sendMessage() {

        const text =
            input.value.trim();

        if (!text) {
            return;
        }

        displayMessage(
            text,
            "user"
        );

        saveConversation(
            "user",
            text
        );

        input.value = "";

        const response =
            generateLocalResponse(text);

        setTimeout(function () {

            displayMessage(
                response,
                "bot"
            );

            saveConversation(
                "beshy",
                response
            );

        }, 250);
    }


    /* =====================================================
       EMOJI PICKER
    ===================================================== */

    if (
        emojiButton &&
        emojiPanel
    ) {

        emojiButton.addEventListener(
            "click",
            function () {

                emojiPanel.classList.toggle(
                    "open"
                );
            }
        );

        const emojis =
            emojiPanel.querySelectorAll(
                "button"
            );

        emojis.forEach(function (emoji) {

            emoji.addEventListener(
                "click",
                function () {

                    input.value +=
                        emoji.textContent;

                    input.focus();

                    emojiPanel.classList.remove(
                        "open"
                    );
                }
            );
        });
    }


    /* =====================================================
       BUTTON EVENTS
    ===================================================== */

    sendButton.addEventListener(
        "click",
        sendMessage
    );


    input.addEventListener(
        "keydown",
        function (event) {

            if (
                event.key === "Enter" &&
                !event.shiftKey
            ) {

                event.preventDefault();
                sendMessage();
            }
        }
    );


    /* =====================================================
       QUICK CHAT BUTTONS
    ===================================================== */

    const quickButtons =
        document.querySelectorAll(
            ".beshy-options button"
        );

    quickButtons.forEach(function (button) {

        button.addEventListener(
            "click",
            function () {

                const message =
                    button.dataset.message;

                if (message) {

                    input.value =
                        message;

                    sendMessage();
                }
            }
        );
    });


    /* =====================================================
       OPEN AND CLOSE
    ===================================================== */

    function openBeshy() {

        chat.classList.add("open");

        toggle.setAttribute(
            "aria-expanded",
            "true"
        );

        chat.setAttribute(
            "aria-hidden",
            "false"
        );

        input.focus();
    }


    function closeBeshy() {

        chat.classList.remove("open");

        toggle.setAttribute(
            "aria-expanded",
            "false"
        );

        chat.setAttribute(
            "aria-hidden",
            "true"
        );
    }


    toggle.addEventListener(
        "click",
        function () {

            if (
                chat.classList.contains(
                    "open"
                )
            ) {
                closeBeshy();
            } else {
                openBeshy();
            }
        }
    );


    closeButton.addEventListener(
        "click",
        closeBeshy
    );


    /* =====================================================
       FORGET MEMORY
    ===================================================== */

    if (forgetButton) {

        forgetButton.addEventListener(
            "click",
            function () {

                const confirmDelete =
                    confirm(
                        "Forget Beshy's visitor memory?"
                    );

                if (!confirmDelete) {
                    return;
                }

                conversationMemory = [];

                localStorage.removeItem(
                    "beshyConversation"
                );

                displayMessage(
                    "Okay besh. 🧠✨ My visitor memory is cleared.",
                    "bot"
                );
            }
        );
    }


    /* =====================================================
       START DATA LOAD
    ===================================================== */

    loadMemory();

    loadFirebaseData();

    loadLocalKnowledge();


    /* =====================================================
       WELCOME MESSAGE
    ===================================================== */

    setTimeout(function () {

        if (
            messages.children.length === 0
        ) {

            displayMessage(
                beshyGreeting(),
                "bot"
            );
        }

    }, 800);
}
