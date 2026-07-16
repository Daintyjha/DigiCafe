/* =====================================================
   BESHY EY AY
   FIREBASE POWERED DIGITAL CAFE BESTIE
===================================================== */


/* =====================================================
   FIREBASE IMPORTS
===================================================== */

import { db } from "./firebase.js";

import {
    collection,
    getDocs
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";


console.log("☕ Beshy Firebase connected!", db);



/* =====================================================
   LOAD BESHY
===================================================== */


document.addEventListener("DOMContentLoaded", function () {


    const container =
        document.getElementById(
            "beshy-container"
        );


    if (!container) {

        console.error(
            "❌ Beshy container was not found."
        );

        return;

    }



    fetch("Beshy/beshy.html")

        .then(function(response){


            if(!response.ok){

                throw new Error(
                    "Could not load Beshy HTML."
                );

            }


            return response.text();


        })


        .then(function(html){


            container.innerHTML =
                html;


            console.log(
                "💚 Beshy HTML loaded."
            );


            startBeshy();


        })


        .catch(function(error){


            console.error(
                "❌ Beshy loading error:",
                error
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
   BESHY BRAIN STORAGE
===================================================== */


let sharedKnowledge = [];

let beshyPersonality = {};

let beshyReactions = [];

let conversationMemory = [];



let learnedBehaviours =
    JSON.parse(
        localStorage.getItem(
            "beshyLearnedBehaviours"
        )
    ) || [];




/* =====================================================
   LOAD LOCAL JSON KNOWLEDGE
===================================================== */


async function loadLocalKnowledge(){


try{


const response =
    await fetch(
        "Beshy/Knowledge.json"
    );


const data =
    await response.json();



if(Array.isArray(data)){


    sharedKnowledge =
        [
            ...sharedKnowledge,
            ...data
        ];


}



console.log(
    "📚 Local knowledge loaded:",
    sharedKnowledge
);



}

catch(error){


console.error(
    "❌ Knowledge.json error:",
    error
);


}



}






/* =====================================================
   LOAD FIREBASE KNOWLEDGE
===================================================== */


async function loadFirebaseKnowledge(){


try{


const snapshot =
    await getDocs(
        collection(
            db,
            "beshyKnowledge"
        )
    );



snapshot.forEach(
    function(doc){


        const data =
            doc.data();



        if(data.answer){


            sharedKnowledge.push(
                data.answer
            );


        }



    }
);



console.log(
    "🔥 Firebase knowledge loaded:",
    sharedKnowledge
);



}

catch(error){


console.error(
    "❌ Firebase knowledge error:",
    error
);


}


}







/* =====================================================
   LOAD BESHY PERSONALITY
===================================================== */


async function loadPersonality(){


try{


const snapshot =
    await getDocs(
        collection(
            db,
            "beshyPersonality"
        )
    );



snapshot.forEach(
    function(doc){


        beshyPersonality =
            doc.data();


    }
);



console.log(
    "☕ Personality loaded:",
    beshyPersonality
);



}

catch(error){


console.error(
    "❌ Personality error:",
    error
);


}



}







/* =====================================================
   LOAD BESHY REACTIONS
===================================================== */


async function loadReactions(){


try{


const snapshot =
    await getDocs(
        collection(
            db,
            "beshyReactions"
        )
    );



snapshot.forEach(
    function(doc){


        beshyReactions.push(
            doc.data()
        );


    }
);



console.log(
    "😂 Reactions loaded:",
    beshyReactions
);



}

catch(error){


console.error(
    "❌ Reaction loading error:",
    error
);


}


}





/* =====================================================
   START LOADING BRAIN
===================================================== */


loadLocalKnowledge();

loadFirebaseKnowledge();

loadPersonality();

loadReactions();



/* =====================================================
   PART 2
   BESHY PERSONALITY ENGINE
===================================================== */



/* =====================================================
   DISPLAY MESSAGE
===================================================== */


function displayMessage(text, type){


const message =
    document.createElement(
        "div"
    );


message.className =
    "beshy-message " + type;



const lines =
    text.split("\n");



lines.forEach(
    function(line){


        const paragraph =
            document.createElement(
                "p"
            );


        paragraph.textContent =
            line;


        message.appendChild(
            paragraph
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
   RANDOM RESPONSE
===================================================== */


function randomResponse(responses){


return responses[
    Math.floor(
        Math.random() *
        responses.length
    )
];


}






/* =====================================================
   FIND FIREBASE REACTION
===================================================== */


function getReaction(trigger){


const result =
    beshyReactions.find(
        function(item){


            return (
                item.trigger &&
                item.trigger
                .toLowerCase()
                .includes(
                    trigger
                    .toLowerCase()
                )
            );


        }
    );



if(result && result.responses){


return randomResponse(
    result.responses
);


}



return null;


}





/* =====================================================
   BESHY PERSONALITY HELPERS
===================================================== */


function beshyName(){


return (
    beshyPersonality.name
    ||
    "Beshy"
);


}





function beshyGreeting(){


const name =
    beshyName();



return randomResponse([


`Uy! Hello besh! 💚 Welcome back. I am ${name}, your digital cafe buddy ☕`,


`Finally! You arrived. 😌 I was here pretending my imaginary coffee was enough.`,


`Hello besh! ✨ Ready for music, stories, chaos, or random conversations?`


]);


}





/* =====================================================
   SASSY RESPONSES
===================================================== */


function sassyResponse(){


return randomResponse([


"Beh... you really came here asking an AI for sass? Bold choice. 😂",


"Besh, I support your decision. Questionable? Yes. Entertaining? Also yes. 😭",


"Okay besh, activating my tiny imaginary attitude module. ✨",


"Wow. The confidence. The chaos. I respect it. 😂"



]);


}






/* =====================================================
   FUNNY RESPONSES
===================================================== */


function funnyResponse(){


return randomResponse([


"Besh, my humor is powered by coffee and questionable digital decisions. ☕😂",


"I would make a joke about computers... but I don't want to crash from laughing. 😭",


"I am 90% code, 10% dramatic cafe friend energy. ✨"



]);


}







/* =====================================================
   OPEN BESHY
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






/* =====================================================
   CLOSE BESHY
===================================================== */


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
   PART 3
   BESHY THINKING ENGINE
===================================================== */



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
   FIND KNOWLEDGE
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
        function(item){


            const knowledge =
                cleanText(
                    typeof item === "string"
                    ? item
                    : JSON.stringify(item)
                );



            return words.some(
                word =>
                knowledge.includes(word)
            );


        }
    );



return matches.slice(
    0,
    3
);


}







/* =====================================================
   FIREBASE REACTION CHECK
===================================================== */


function checkReactions(message){


for(
    let reaction of beshyReactions
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
   GENERATE BESHY RESPONSE
===================================================== */


function generateResponse(text){



const lower =
    cleanText(text);




/* ==========================================
   FIREBASE REACTIONS FIRST
========================================== */


const reaction =
    checkReactions(
        text
    );


if(reaction){

return reaction;

}






/* ==========================================
   GREETINGS
========================================== */


if(
/^(hi|hello|hey|hiya|kumusta|kamusta|uy)/
.test(lower)
){


return beshyGreeting();


}





/* ==========================================
   WHO IS BESHY
========================================== */


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

`I'm ${beshyName()}! 💚\n\n` +

"I am your Digital Cafe Friend ☕✨\n\n" +

"I can help you explore music, novels, " +

"chat about random things, or simply keep you company.\n\n" +

"Basically... your slightly chaotic cafe buddy. 😂"


);


}






/* ==========================================
   DIGICAFE
========================================== */


if(
lower.includes("digicafe")
||
lower.includes("digital cafe")
){


const knowledge =
    findKnowledge(
        text
    );



if(
knowledge.length > 0
){

return (

"Welcome to DigiCafe, besh! ☕✨\n\n" +

knowledge.join(
    "\n\n"
)

);

}


return (

"DigiCafe is your cozy digital hangout where you can listen to music, read stories, and chill with me. 💚"

);


}






/* ==========================================
   SASS MODE
========================================== */


if(
lower.includes("sassy")
||
lower.includes("be savage")
||
lower.includes("roast me")
){


return sassyResponse();


}







/* ==========================================
   FUNNY MODE
========================================== */


if(
lower.includes("funny")
||
lower.includes("make me laugh")
||
lower.includes("joke")
){


return funnyResponse();


}







/* ==========================================
   MUSIC
========================================== */


if(
lower.includes("music")
||
lower.includes("song")
||
lower.includes("playlist")
){


return randomResponse([


"Music time? Excellent choice, besh. 🎵 Let me prepare the imaginary cafe vibes.",


"Finally, a person with taste. 😂 Go check the music corner of DigiCafe ☕🎶",


"Need a mood? Relaxing, romantic, dramatic, or 'staring out the window like a main character' playlist? 😌"


]);


}







/* ==========================================
   NOVELS / READING
========================================== */


if(
lower.includes("book")
||
lower.includes("novel")
||
lower.includes("read")
){


return randomResponse([


"Reading time! 📚✨ Pick a story and get comfy, besh.",


"A reader? I approve. Very classy behavior. 😌📖",


"Careful, besh. One chapter can become 'why is it already 3 AM?' 😂"


]);


}







/* ==========================================
   KNOWLEDGE SEARCH
========================================== */


const knowledge =
    findKnowledge(
        text
    );



if(
knowledge.length > 0
){


return (

"Ooooh, I found something in my brain. 🧠💚\n\n" +

knowledge.join(
    "\n\n"
)

);


}






/* ==========================================
   DEFAULT
========================================== */


return randomResponse([


"Okay besh, I am listening. ☕ Tell me more.",


"Hmm... interesting. Continue, I want the full story. 👀",


"Besh, give me more context before my tiny AI brain starts making dramatic assumptions. 😂",


"I am here. What happened next?",


"Okay, besh. Let's figure this out together. 💚"



]);



}
/* =====================================================
   PART 4
   CHAT CONTROLS + MEMORY
===================================================== */



/* =====================================================
   SAVE VISITOR MEMORY
===================================================== */


function saveConversation(role, message){


conversationMemory.push({

    role: role,

    message: message,

    time: new Date().toISOString()

});


localStorage.setItem(

    "beshyConversation",

    JSON.stringify(
        conversationMemory
    )

);


}






/* =====================================================
   LOAD OLD CHAT MEMORY
===================================================== */


const oldMemory =
    JSON.parse(

        localStorage.getItem(
            "beshyConversation"
        )

    );



if(
    oldMemory
){

conversationMemory =
    oldMemory;

}







/* =====================================================
   SEND MESSAGE
===================================================== */


function sendMessage(){


const text =
    input.value.trim();



if(
    !text
){

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





setTimeout(
function(){



const response =
    generateResponse(
        text
    );



displayMessage(
    response,
    "bot"
);



saveConversation(
    "beshy",
    response
);



},
400
);



}







/* =====================================================
   SEND BUTTON
===================================================== */


sendButton.addEventListener(

"click",

sendMessage

);







/* =====================================================
   ENTER KEY
===================================================== */


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
   QUICK BUTTONS
===================================================== */


const quickButtons =

document.querySelectorAll(

".beshy-options button"

);




quickButtons.forEach(

function(button){



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



if(
!confirmDelete
){

return;

}





conversationMemory = [];



localStorage.removeItem(

"beshyConversation"

);



localStorage.removeItem(

"beshyLearnedBehaviours"

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




/* =====================================================
   END START BESHY
===================================================== */


}



/* =====================================================
   END DOM CONTENT LOADED
===================================================== */


});           
       
