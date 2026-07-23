import { db } from "../firebase.js";

import {
collection,
getDocs
}
from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";


const list =
document.querySelector("#knowledgeList");


async function loadPendingKnowledge(){

try {


const snapshot =
await getDocs(
    collection(
        db,
        "pendingKnowledge"
    )
);


list.innerHTML = "";


snapshot.forEach(
(doc)=>{


const data =
doc.data();


const card =
document.createElement("div");


card.innerHTML = `

<h3>📒 Suggestion</h3>

<p>
${data.suggestion}
</p>

<p>
Status:
${data.status}
</p>


<hr>

`;


list.appendChild(card);


});


}
catch(error){

console.error(
"Could not load notebook:",
error
);

}

}


loadPendingKnowledge();
