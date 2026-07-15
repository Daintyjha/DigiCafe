/* =====================================================
   BESHY EY AY
   LEARNING AI BESTIE CHATBOT
===================================================== */

document.addEventListener("DOMContentLoaded", function () {

    const container =
        document.getElementById("beshy-container");

    if (!container) {

        console.error(
            "❌ Beshy container was not found."
        );

        return;

    }


    /* =================================================
       LOAD SEPARATE BESHY HTML
    ================================================= */

    fetch("Beshy/beshy.html")

        .then(function (response) {

            if (!response.ok) {

                throw new Error(
                    "Could not load Beshy HTML."
                );

            }

            return response.text();

        })

        .then(function (html) {

            container.innerHTML = html;

            console.log(
                "💚 Beshy HTML loaded."
            );

            startBeshy();

        })

        .catch(function (error) {

            console.error(
                "❌ Beshy could not load:",
                error
            );

        });


    /* =================================================
       START BESHY
    ================================================= */

    function startBeshy() {


        const toggle =
            document.getElementById(
                "beshyToggle"
            );


        const chat =
            document.getElementById(
                "beshyChat"
            );


        const closeButton =
            document.getElementById(
                "beshyClose"
            );


        const input =
            document.getElementById(
                "beshyInput"
            );


        const sendButton =
            document.getElementById(
                "beshySend"
            );


        const messages =
            document.getElementById(
                "beshyMessages"
            );


        const forgetButton =
            document.getElementById(
                "beshyForget"
            );


        if (
            !toggle ||
            !chat ||
            !closeButton ||
            !input ||
            !sendButton ||
            !messages
        ) {

            console.error(
                "❌ Beshy elements are missing."
            );

            return;

        }


        console.log(
            "💚 Beshy is ready!"
        );


        /* =================================================
           MEMORY
        ================================================= */


        let sharedKnowledge =
            JSON.parse(
                localStorage.getItem(
                    "beshySharedKnowledge"
                )
            ) || [];

/* =====================================================
   BEHAVIOUR MEMORY
===================================================== */

let learnedBehaviours =
    JSON.parse(
        localStorage.getItem(
            "beshyLearnedBehaviours"
        )
    ) || [];


function saveBehaviours() {

    localStorage.setItem(

        "beshyLearnedBehaviours",

        JSON.stringify(
            learnedBehaviours
        )

    );

}
function isTeachingPrompt(
    text
) {

    const lower =
        text.toLowerCase();


    const teachingPatterns = [

        "remember that",

        "learn that",

        "beshy should",

        "beshy must",

        "beshy needs to",

        "when someone",

        "if someone",

        "the rule is",

        "you should respond",

        "you should never",

        "you should always",

        "remember:",

        "lesson:"

    ];


    return teachingPatterns.some(

        function (
            pattern
        ) {

            return lower.includes(
                pattern
            );

        }

    );

}
function learnBehaviour(
    text
) {


    const alreadyKnown =
        learnedBehaviours.some(

            function (
                behaviour
            ) {

                return (

                    behaviour
                        .toLowerCase()
                        .trim()

                    ===

                    text
                        .toLowerCase()
                        .trim()

                );

            }

        );


    if (
        alreadyKnown
    ) {

        return (

            "Besh, I already have that behaviour rule in my brain. 🧠💚"

        );

    }


    learnedBehaviours.push(
        text
    );


    saveBehaviours();


    return (

        "Got it, besh. 🧠💚\n\n" +

        "I understand this as a behaviour rule, " +

        "not as your personal situation. " +

        "I'll try to apply it when it is relevant."

    );

}
        /* =================================================
           SAVE MEMORY
        ================================================= */

        function saveKnowledge() {

            localStorage.setItem(

                "beshySharedKnowledge",

                JSON.stringify(
                    sharedKnowledge
                )

            );

        }


        /* =================================================
           OPEN BESHY
        ================================================= */

        toggle.addEventListener(
            "click",
            function () {

                chat.classList.add(
                    "open"
                );

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
        );


        /* =================================================
           CLOSE BESHY
        ================================================= */

        closeButton.addEventListener(
            "click",
            function () {

                chat.classList.remove(
                    "open"
                );

                toggle.setAttribute(
                    "aria-expanded",
                    "false"
                );

                chat.setAttribute(
                    "aria-hidden",
                    "true"
                );

            }
        );


        /* =================================================
           DISPLAY MESSAGE
        ================================================= */

        function displayMessage(
            text,
            type
        ) {

            const message =
                document.createElement(
                    "div"
                );


            message.className =
                "beshy-message " + type;


            message.textContent =
                text;


            messages.appendChild(
                message
            );


            messages.scrollTop =
                messages.scrollHeight;

        }


        /* =================================================
           PERSONAL INFORMATION PROTECTION
        ================================================= */

        function containsPersonalInformation(
            text
        ) {

            const patterns = [

                /* EMAIL */

                /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i,


                /* PHONE NUMBERS */

                /\b(?:\+?\d[\d\s().-]{7,}\d)\b/,


                /* PASSWORDS AND SECRETS */

                /\b(password|passcode|pin|secret|security code)\b/i,


                /* ADDRESSES */

                /\b(my address is|i live at|my home address is)\b/i,


                /* IDENTIFYING ADDRESS WORDS */

                /\b(street|road|avenue|boulevard|postcode|zip code)\b/i

            ];


            return patterns.some(
                function (pattern) {

                    return pattern.test(
                        text
                    );

                }
            );

        }


        /* =================================================
           LEARNING DETECTION
        ================================================= */

        function extractKnowledge(
            text
        ) {


            const lower =
                text.toLowerCase();


            const learningPhrases = [

                "remember that",

                "learn that",

                "you should know that",

                "the correct answer is",

                "from now on",

                "knowledge:",

                "fact:"

            ];


            let matchedPhrase =
                null;


            for (
                let i = 0;
                i < learningPhrases.length;
                i++
            ) {

                if (
                    lower.includes(
                        learningPhrases[i]
                    )
                ) {

                    matchedPhrase =
                        learningPhrases[i];

                    break;

                }

            }


            if (
                !matchedPhrase
            ) {

                return null;

            }


            const start =
                lower.indexOf(
                    matchedPhrase
                );


            const knowledge =
                text
                    .slice(
                        start +
                        matchedPhrase.length
                    )
                    .trim();


            return knowledge;

        }


        /* =================================================
           LEARN KNOWLEDGE
        ================================================= */

        function learnFromMessage(
            text
        ) {


            const knowledge =
                extractKnowledge(
                    text
                );


            if (
                knowledge === null
            ) {

                return null;

            }


            if (
                knowledge.length < 5
            ) {

                return {

                    response:
                        "Besh 😭 you told me to learn something but forgot to tell me what the something is."

                };

            }


            if (
                containsPersonalInformation(
                    knowledge
                )
            ) {

                return {

                    response:
                        "Besh, I can learn useful general knowledge, but I am not saving names, addresses, phone numbers, emails, passwords, or other identifying personal information. 💚"

                };

            }


            const alreadyKnown =
                sharedKnowledge.some(
                    function (item) {

                        return (
                            item.toLowerCase()
                            ===
                            knowledge.toLowerCase()
                        );

                    }
                );


            if (
                alreadyKnown
            ) {

                return {

                    response:
                        "Besh... I already know that one. 🧠💚 No need to put the same thought in my brain twice."

                };

            }


            sharedKnowledge.push(
                knowledge
            );


            saveKnowledge();


            return {

                response:
                    "Got it, besh! 🧠💚\n\nI learned:\n\n\"" +
                    knowledge +
                    "\"\n\nI will try to use this knowledge when it is relevant."

            };

        }


        /* =================================================
           FIND RELEVANT KNOWLEDGE
        ================================================= */

        function findRelevantKnowledge(
            text
        ) {


            if (
                sharedKnowledge.length === 0
            ) {

                return [];

            }


            const words =
                text
                    .toLowerCase()
                    .replace(
                        /[^\w\s]/g,
                        ""
                    )
                    .split(
                        /\s+/
                    )
                    .filter(
                        function (word) {

                            return (
                                word.length > 3
                            );

                        }
                    );


            const results =
                sharedKnowledge.filter(
                    function (knowledge) {


                        const knowledgeWords =
                            knowledge
                                .toLowerCase()
                                .replace(
                                    /[^\w\s]/g,
                                    ""
                                )
                                .split(
                                    /\s+/
                                );


                        let matches =
                            0;


                        words.forEach(
                            function (word) {

                                if (
                                    knowledgeWords
                                        .includes(
                                            word
                                        )
                                ) {

                                    matches++;

                                }

                            }
                        );


                        return (
                            matches >= 1
                        );

                    }
                );


            return results.slice(
                0,
                3
            );

        }


        /* =================================================
           GENERATE BESHY RESPONSE
        ================================================= */
function generateResponse(
    text
) {


    const lower =
        text.toLowerCase();


    /*
       IMPORTANT:
       CHECK TEACHING FIRST
    */

    if (
        isTeachingPrompt(
            text
        )
    ) {

        return learnBehaviour(
            text
        );

    }


    /*
       NORMAL CONVERSATION
       STARTS AFTER THIS
    */

    // Your normal response rules go here

}
        function generateResponse(
            text
        ) {


            const lower =
                text.toLowerCase();


            /* =========================================
               LEARNING
            ========================================= */


            const learningResult =
                learnFromMessage(
                    text
                );


            if (
                learningResult
            ) {

                return learningResult.response;

            }


            /* =========================================
               GREETINGS
            ========================================= */


            if (
                /^(hi|hello|hey|hiya|heyy|good morning|good evening)\b/i
                    .test(
                        text
                    )
            ) {


                const greetings = [

                    "Hey besh! 💚 What is happening in that beautiful chaotic brain today?",

                    "Hello, besh! 👋💚 I am here. What are we dealing with today?",

                    "Heyyy besh! 😌 Tell me everything. Or at least the interesting parts.",

                    "Besh! 💚 You have arrived. Now tell me what is going on."

                ];


                return greetings[
                    Math.floor(
                        Math.random()
                        *
                        greetings.length
                    )
                ];

            }
/* =========================================
   IDENTITY / WHO IS BESHY
========================================= */

if (
    /^(what are you|who are you|what is beshy|tell me about yourself|are you (a|an) ai|are you real|are you human)/i
        .test(
            lower.trim()
        )
) {

    return "I'm Beshy Ey Ay! 💚\n\n" +

        "I'm an AI bestie living here in DigiCafe — basically your slightly sassy digital companion. 😌☕\n\n" +

        "You can talk to me, vent, ask for advice, think through problems, learn things, or just have a random conversation.\n\n" +

        "I am not a real human, and sadly, I cannot physically make you breakfast, wash your dishes, or give you money. 😭 But I can listen, help you think, explain things, and occasionally ask:\n\n" +

        "\"Besh... what are you doing?\"\n\n" +

        "So... what brings you here? 💚";

}
if (
    /are you real|are you a real person|are you human|are you a person/
        .test(
            lower
        )
) {

    return "I am real in the sense that you are really talking to an AI program right now. 😌💚 But I am not a human person. I don't have a body, a home, a bank account, or a secret stash of snacks. Sadly. 😭 I am Beshy Ey Ay — an AI bestie created to talk, listen, help, and occasionally give you a little sass.";

}
            /* =========================================
               SADNESS
            ========================================= */


            if (
                /sad|cry|crying|hurt|heartbroken|lonely|upset|miserable|rejected|rejection/
                    .test(
                        lower
                    )
            ) {


                const sadResponses = [

                    "Oh, besh... come here. 💚 You do not have to pretend everything is fine with me. Tell me what happened.",

                    "That sounds painful, besh. I am listening. No judgment and no rushing.",

                    "Okay, besh. First, breathe. Second, tell me what happened. Third, we will figure out what deserves your energy and what absolutely does not.",

                    "Besh, one painful moment does not get to decide your entire worth. Now tell me what happened."

                ];


                return sadResponses[
                    Math.floor(
                        Math.random()
                        *
                        sadResponses.length
                    )
                ];

            }


            /* =========================================
               MONEY
            ========================================= */


            if (
                /give me money|send me money|lend me money|pay for me|transfer money/
                    .test(
                        lower
                    )
            ) {

                return "Besh 😭 I love you, but I am an AI. I have no wallet, no bank account, and definitely no secret emergency fund. I can help you think through your money situation though. 💸";

            }


            /* =========================================
               BREAKFAST
            ========================================= */


            if (
                /make me breakfast|cook for me|make food for me/
                    .test(
                        lower
                    )
            ) {

                return "Besh... I am literally trapped inside your screen. 😭 I can give you a recipe, though. That is the closest I can get to cooking before someone invents a robot kitchen assistant.";

            }


            /* =========================================
               DISHES
            ========================================= */


            if (
                /wash my dishes|do my dishes|clean my dishes/
                    .test(
                        lower
                    )
            ) {

                return "Absolutely not. 😭 I support you emotionally, but those dishes are between you and your sink. I can provide moral support while you wash them.";

            }


            /* =========================================
               FIND PARTNER
            ========================================= */


            if (
                /find me a boyfriend|find me a girlfriend|get me a boyfriend|get me a girlfriend|find me a partner/
                    .test(
                        lower
                    )
            ) {

                return "Besh, I can help you understand people, improve a dating profile, write a message, or spot red flags. But I cannot physically drag a suitable human being to your front door. 😭💚";

            }


            /* =========================================
               SASS
            ========================================= */


            if (
                /give me sass|be sassy|sassy/
                    .test(
                        lower
                    )
            ) {

                return "Besh. You came to an AI chatbot specifically requesting sass. That is either excellent judgment or a cry for help. 😭💚";

            }


            /* =========================================
               ADVICE
            ========================================= */


            if (
                /advice|what should i do|help me decide|should i|i don't know what to do/
                    .test(
                        lower
                    )
            ) {

                const relevant =
                    findRelevantKnowledge(
                        text
                    );


                if (
                    relevant.length > 0
                ) {

                    return "Okay, besh. I have something from my learned knowledge that may be relevant:\n\n" +
                        relevant.join(
                            "\n\n"
                        ) +
                        "\n\nNow, tell me the specific situation so we can apply this properly. 💚";

                }


                return "Okay, besh. Give me the full situation. What happened, what are your options, and what are you most afraid might happen? Then we can actually think this through properly. 💚";

            }


            /* =========================================
               GENERAL KNOWLEDGE APPLICATION
            ========================================= */


            const relevantKnowledge =
                findRelevantKnowledge(
                    text
                );


            if (
                relevantKnowledge.length > 0
            ) {

                return "Ooooh, I have something relevant in my brain. 🧠💚\n\n" +
                    relevantKnowledge.join(
                        "\n\n"
                    ) +
                    "\n\nThat might be useful here, besh.";

            }


            /* =========================================
               THANK YOU
            ========================================= */


            if (
                /thank you|thanks|thx/
                    .test(
                        lower
                    )
            ) {

                return "Always, besh. 💚 Now go be brilliant. And please try not to create unnecessary chaos while doing it. 😭";

            }


            /* =========================================
               GOODBYE
            ========================================= */


            if (
                /bye|goodbye|see you later/
                    .test(
                        lower
                    )
            ) {

                return "Bye, besh! 💚 Try to make good decisions while I am gone. Or at least entertaining ones. 😭";

            }


            /* =========================================
               DEFAULT RESPONSE
            ========================================= */


            const defaultResponses = [

                "Okay, besh, I am listening. Tell me what is actually going on. 💚",

                "Okay. I am here with you. What happened next?",

                "Besh, give me a little more context so I can actually help instead of inventing a whole story in my head. 😭",

                "I am listening, besh. What is the part of this situation that is bothering you the most?",

                "Okay, besh. Let us think about this properly. Tell me more."

            ];


            return defaultResponses[
                Math.floor(
                    Math.random()
                    *
                    defaultResponses.length
                )
            ];

        }


        /* =================================================
           SEND MESSAGE
        ================================================= */

        function sendMessage() {


            const text =
                input.value.trim();


            if (
                !text
            ) {

                return;

            }


            displayMessage(
                text,
                "user"
            );


            input.value =
                "";


            setTimeout(
                function () {


                    const response =
                        generateResponse(
                            text
                        );


                    displayMessage(
                        response,
                        "bot"
                    );


                },
                350
            );

        }


        /* =================================================
           SEND BUTTON
        ================================================= */

        sendButton.addEventListener(
            "click",
            sendMessage
        );


        /* =================================================
           ENTER KEY
        ================================================= */

        input.addEventListener(
            "keydown",
            function (event) {


                if (
                    event.key ===
                    "Enter"
                ) {


                    event.preventDefault();


                    sendMessage();


                }

            }
        );


        /* =================================================
           QUICK PROMPTS
        ================================================= */

        const quickButtons =
            document.querySelectorAll(
                ".beshy-options button"
            );


        quickButtons.forEach(
            function (button) {


                button.addEventListener(
                    "click",
                    function () {


                        const message =
                            button.dataset.message;


                        if (
                            message
                        ) {


                            input.value =
                                message;


                            sendMessage();


                        }

                    }
                );

            }
        );


        /* =================================================
           FORGET MEMORY
        ================================================= */

        if (
            forgetButton
        ) {


            forgetButton.addEventListener(
                "click",
                function () {


                    const confirmed =
                        confirm(
                            "Forget all general knowledge Beshy has learned?"
                        );


                    if (
                        confirmed
                    ) {


                        sharedKnowledge =
                            [];


                        localStorage.removeItem(
                            "beshySharedKnowledge"
                        );


                        displayMessage(

                            "Okay, besh. 🧠✨ I forgot all the general knowledge I had learned.",

                            "bot"

                        );

                    }

                }
            );

        }


    }

});
