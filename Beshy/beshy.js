import { db, app } from "../firebase.js";

import {
    getFunctions,
    httpsCallable
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-functions.js";

import {
    collection,
    getDocs
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

console.log(
    "☕ Beshy Firebase connected!",
    db
);


/* =====================================================
   LOAD BESHY HTML
===================================================== */

document.addEventListener(
"DOMContentLoaded",
function(){


const container =
    document.getElementById(
        "beshy-container"
    );


if(!container){

    console.error(
        "❌ Beshy container missing."
    );

    return;

}



fetch(
    "Beshy/beshy.html"
)

.then(
response => {

    if(!response.ok){

        throw new Error(
            "Beshy HTML failed to load"
        );

    }

    return response.text();

}

)

.then(
html => {


container.innerHTML =
    html;


console.log(
    "💚 Beshy HTML loaded"
);



startBeshy();



}

)

.catch(
error => {

console.error(
    "❌ Beshy loading error:",
    error
);

}

);



});

/* =====================================================
   START BESHY
===================================================== */

function startBeshy(){



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




if(
!toggle ||
!chat ||
!closeButton ||
!input ||
!sendButton ||
!messages
){

console.error(
    "❌ Beshy elements missing."
);

return;

}



console.log(
    "💚 Beshy is ready!"
);


/* =====================================================
   EMOJI PICKER
===================================================== */


const emojiButton =
document.getElementById(
    "beshyEmoji"
);


const emojiPanel =
document.getElementById(
    "beshyEmojiPanel"
);



if(
    emojiButton &&
    emojiPanel
){


    // Open / close emoji menu

    emojiButton.addEventListener(
        "click",
        function(){


            emojiPanel.classList.toggle(
                "open"
            );


        }
    );




    // Put emoji into input

    const emojis =
    emojiPanel.querySelectorAll(
        "button"
    );



    emojis.forEach(
        function(emoji){


            emoji.addEventListener(
                "click",
                function(){


                    input.value =
                    input.value +
                    emoji.textContent;



                    input.focus();


                }
            );


        }
    );


}
/* =====================================================
   GEMINI FUNCTION CONNECTION
===================================================== */


const functions =
getFunctions(
    app,
    "us-central1"
);



const chatWithBeshy =
httpsCallable(
    functions,
    "chatWithBeshy"
);



console.log(
    "🤖 Gemini connection ready!"
);





/* =====================================================
   BESHY MEMORY
===================================================== */


let sharedKnowledge = [];

let beshyPersonality = {};

let beshyReactions = [];

let conversationMemory = [];





/* =====================================================
   LOAD FIRESTORE DATA
===================================================== */


async function loadFirebaseData(){


try{


const knowledgeSnapshot =
await getDocs(
    collection(
        db,
        "beshyKnowledge"
    )
);



knowledgeSnapshot.forEach(
doc => {


const data =
doc.data();



if(data.answer){

sharedKnowledge.push(
    data.answer
);

}


});





const personalitySnapshot =
await getDocs(
    collection(
        db,
        "beshyPersonality"
    )
);



personalitySnapshot.forEach(
doc => {


beshyPersonality =
doc.data();


});







const reactionSnapshot =
await getDocs(
    collection(
        db,
        "beshyReactions"
    )
);



reactionSnapshot.forEach(
doc => {


beshyReactions.push(
    doc.data()
);


});





console.log(
    "🔥 Firebase brain loaded",
    {
        sharedKnowledge,
        beshyPersonality,
        beshyReactions
    }
);



}

catch(error){

console.error(
    "❌ Firebase brain error:",
    error
);


}


}





/* =====================================================
   LOAD LOCAL KNOWLEDGE.JSON
===================================================== */


async function loadLocalKnowledge(){


try{


const response =
await fetch(
    "Knowledge.json"
);



const data =
await response.json();



if(
Array.isArray(data)
){

sharedKnowledge =
[
    ...sharedKnowledge,
    ...data
];

}



console.log(
    "📚 Local knowledge loaded",
    sharedKnowledge
);



}

catch(error){

console.error(
    "❌ Knowledge.json error",
    error
);


}


}




loadFirebaseData();

loadLocalKnowledge();





/* =====================================================
   DISPLAY MESSAGE
===================================================== */


function displayMessage(
text,
type
){


const message =
document.createElement(
    "div"
);



message.className =
"beshy-message " + type;



text
.split("\n")
.forEach(
line => {


const p =
document.createElement(
    "p"
);



p.textContent =
line;



message.appendChild(
    p
);


}

);



messages.appendChild(
message
);



messages.scrollTop =
messages.scrollHeight;


}
/* =====================================================
   BESHY PERSONALITY SYSTEM
===================================================== */


/* =====================================================
   RANDOM RESPONSE
===================================================== */

function randomResponse(list){

return list[
    Math.floor(
        Math.random() * list.length
    )
];

}





/* =====================================================
   BESHY NAME
===================================================== */

function beshyName(){

return (
    beshyPersonality.name
    ||
    "Beshy"
);

}






/* =====================================================
   GREETING
===================================================== */

function beshyGreeting(){

return randomResponse([

`Uy! Hello besh! 💚 Welcome back. I am ${beshyName()}, your Digital Cafe buddy ☕`,

`Finally! You arrived. 😌 I was here drinking imaginary coffee while waiting.`,

`Hello besh! ✨ Ready for music, stories, or random conversations?`

]);

}






/* =====================================================
   SASS MODE
===================================================== */

function sassyResponse(){

return randomResponse([

"Beh... you really asked an AI to roast you? The confidence is impressive. 😂",

"Besh, I support your chaos. Questionable choices, but entertaining. 😭",

"Activating tiny digital attitude mode. ✨",

"The drama. The confidence. The energy. I respect it. 😂"

]);

}






/* =====================================================
   FUNNY MODE
===================================================== */

function funnyResponse(){

return randomResponse([

"My humor runs on coffee and questionable digital decisions. ☕😂",

"I would tell a computer joke... but it might need a restart from laughing. 😭",

"I am 90% code and 10% cafe drama. ✨"

]);

}






/* =====================================================
   TEXT CLEANER
===================================================== */

function cleanText(text){

return text
.toLowerCase()
.replace(
    /[^\w\s]/g,
    ""
)
.trim();

}







/* =====================================================
   SEARCH BESHY KNOWLEDGE
===================================================== */

function findKnowledge(message){


const words =
cleanText(message)
.split(" ")
.filter(
word =>
word.length > 3
);



const matches =
sharedKnowledge.filter(
item => {


const content =
cleanText(
typeof item === "string"
?
item
:
JSON.stringify(item)
);



return words.some(
word =>
content.includes(word)
);


}

);



return matches.slice(
0,
3
);


}







/* =====================================================
   CHECK REACTIONS
===================================================== */

function checkReactions(message){


for(
const reaction of beshyReactions
){


if(
reaction.trigger &&
cleanText(message)
.includes(
cleanText(
reaction.trigger
)
)
){


if(
reaction.responses
){

return randomResponse(
reaction.responses
);

}


}


}


return null;

}







/* =====================================================
   LOCAL BESHY BRAIN
===================================================== */

function generateLocalResponse(text){



const lower =
cleanText(text);




/* GREETING */

if(
/^(hi|hello|hey|hiya|kumusta|kamusta|uy)/
.test(lower)
){

return beshyGreeting();

}





/* REACTIONS */

const reaction =
checkReactions(text);


if(reaction){

return reaction;

}







/* WHO IS BESHY */

if(

lower.includes("who are you")
||
lower.includes("what are you")
||
lower.includes("who is beshy")
||
lower.includes("ano ka")

){


return (

`I'm ${beshyName()}! 💚\n\n`

+

"I am your Digital Cafe Friend ☕✨\n\n"

+

"I can help you explore music, novels, "

+

"or simply keep you company.\n\n"

+

"Basically... your slightly chaotic cafe buddy. 😂"

);


}







/* DIGICAFE */

if(

lower.includes("digicafe")
||
lower.includes("digital cafe")

){


const knowledge =
findKnowledge(text);



if(
knowledge.length
){

return (

"Welcome to DigiCafe, besh! ☕✨\n\n"

+

knowledge.join(
"\n\n"
)

);


}



return (

"DigiCafe is your cozy digital hangout where you can listen to music, read stories, and chill with me. 💚"

);


}







/* SASS */

if(

lower.includes("sassy")
||
lower.includes("roast")
||
lower.includes("savage")

){

return sassyResponse();

}






/* FUNNY */

if(

lower.includes("funny")
||
lower.includes("joke")
||
lower.includes("laugh")

){

return funnyResponse();

}







/* MUSIC */

if(

lower.includes("music")
||
lower.includes("song")
||
lower.includes("playlist")

){

return randomResponse([


"Music time? Excellent choice, besh. 🎵 Check the DigiCafe music corner.",


"Finally, someone with taste. 😂 Let's create some cafe vibes.",


"Need relaxing, romantic, dramatic, or main-character music? 😌"


]);


}







/* NOVELS */

if(

lower.includes("book")
||
lower.includes("novel")
||
lower.includes("read")

){

return randomResponse([


"Reading time! 📚✨ Grab a story and get comfortable.",


"A reader? Very classy behavior, besh. 😌📖",


"Careful... one chapter can become 3 AM. 😂"


]);


}






/* KNOWLEDGE SEARCH */

const knowledge =
findKnowledge(text);



if(
knowledge.length
){

return (

"Ooooh, I found something in my brain. 🧠💚\n\n"

+

knowledge.join(
"\n\n"
)

);


}






/*
IMPORTANT:
Returning null means:
Beshy does not know.
Now Gemini will answer.
*/

return null;


}
/* =====================================================
   GEMINI AI FALLBACK
===================================================== */


async function askGemini(message){


try{


console.log(
"🤖 Asking Gemini:",
message
);



const result =
await chatWithBeshy({

message: message

});



return result.data.reply;



}

catch(error){


console.error(
"❌ Gemini error:",
error
);



return (
"Oops besh ☕😂 My AI coffee machine is having a tiny break. Try again!"
);


}
}

/* =====================================================
   MEMORY SYSTEM
===================================================== */


function saveConversation(
role,
message
){


conversationMemory.push({

role: role,

message: message,

time:
new Date().toISOString()

});



localStorage.setItem(

"beshyConversation",

JSON.stringify(
conversationMemory
)

);


}






function loadMemory(){


const saved =

JSON.parse(

localStorage.getItem(
"beshyConversation"
)

);



if(saved){

conversationMemory =
saved;

}


}




loadMemory();







/* =====================================================
   SEND MESSAGE
===================================================== */


async function sendMessage(){


const text =
input.value.trim();



if(!text){

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





let response =
generateLocalResponse(
text
);





/*
If local brain does not know,
ask Gemini
*/


if(
response === null
){


displayMessage(
"Thinking... ☕",
"bot"
);



response =
await askGemini(
text
);



/*
Remove temporary thinking message
*/

const thinking =
messages.lastChild;


if(
thinking &&
thinking.textContent.includes(
"Thinking"
)
){

thinking.remove();

}


}





displayMessage(
response,
"bot"
);



saveConversation(
"beshy",
response
);



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

function(event){


if(
event.key === "Enter"
){


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



quickButtons.forEach(

button => {


button.addEventListener(

"click",

function(){


const message =
button.dataset.message;



if(message){


input.value =
message;


sendMessage();


}


}

);


}

);







/* =====================================================
   OPEN / CLOSE BESHY
===================================================== */


function openBeshy(){


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






function closeBeshy(){


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

toggle.addEventListener(
"click",
openBeshy
);

closeButton.addEventListener(
"click",
closeBeshy
);


/* =====================================================
   FORGET MEMORY
===================================================== */


if(
forgetButton
){


forgetButton.addEventListener(

"click",

function(){



const confirmDelete =
confirm(
"Forget Beshy's visitor memory?"
);



if(!confirmDelete){

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
   WELCOME MESSAGE
===================================================== */


setTimeout(

function(){


if(
messages.children.length === 0
){


displayMessage(

beshyGreeting(),

"bot"

);


}


},

800

);



}
