/* =====================================================
   BESHY STAFF ROOM
   Knowledge Review System
===================================================== */


import { db } from "../firebase.js";


import {
    collection,
    getDocs,
    doc,
    deleteDoc,
    addDoc,
    serverTimestamp
}
from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";



const list =
document.querySelector("#knowledgeList");



/* =====================================================
   LOAD PENDING KNOWLEDGE
===================================================== */


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



if(snapshot.empty){

    list.innerHTML =
    `
    <p>
    ☕ No new notes for Beshy yet.
    </p>
    `;

    return;

}




snapshot.forEach(

(doc)=>{


const data =
doc.data();



const card =
document.createElement("div");



card.className =
"knowledge-card";



card.innerHTML = `

<h3>
📒 Visitor Suggestion
</h3>


<p>
${data.suggestion}
</p>


<p>
Status:
${data.status}
</p>


<button class="approve">
✅ Approve
</button>


<button class="reject">
❌ Reject
</button>


<hr>

`;



list.appendChild(card);





/* ===============================
   APPROVE BUTTON
================================ */


card.querySelector(".approve")
.addEventListener(

"click",

()=>{


approveKnowledge(
    doc.id,
    data
);


}

);





/* ===============================
   REJECT BUTTON
================================ */


card.querySelector(".reject")
.addEventListener(

"click",

()=>{


rejectKnowledge(
    doc.id
);


}

);




}

);



}


catch(error){


console.error(
"Could not load notebook:",
error
);


}


}





/* =====================================================
   APPROVE KNOWLEDGE
===================================================== */


async function approveKnowledge(
id,
data
){


try {



await addDoc(

collection(
    db,
    "beshyKnowledge"
),

{


topic:
"Visitor Contribution",


question:
data.suggestion,


answer:
data.suggestion,


source:
"approved visitor knowledge",


createdAt:
serverTimestamp()


}

);





await deleteDoc(

doc(

    db,

    "pendingKnowledge",

    id

)

);




alert(
"☕ Beshy learned something new!"
);



loadPendingKnowledge();



}



catch(error){


console.error(
"Could not approve knowledge:",
error
);


}



}





/* =====================================================
   REJECT KNOWLEDGE
===================================================== */


async function rejectKnowledge(
id
){


try {



await deleteDoc(

doc(

db,

"pendingKnowledge",

id

)

);



alert(
"🗑️ Suggestion rejected."
);



loadPendingKnowledge();



}


catch(error){


console.error(
"Could not reject knowledge:",
error
);


}



}







/* =====================================================
   START
===================================================== */


loadPendingKnowledge();
