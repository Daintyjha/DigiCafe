import { initializeApp } 
from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";

import {
    getFirestore,
    collection,
    addDoc,
    getDocs,
    query,
    where
}
from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";


// Firebase configuration
// Replace these with your Firebase details

const firebaseConfig = {

    apiKey: "YOUR_API_KEY",

    authDomain: "YOUR_AUTH_DOMAIN",

    projectId: "YOUR_PROJECT_ID",

    storageBucket: "YOUR_STORAGE_BUCKET",

    messagingSenderId: "YOUR_MESSAGING_ID",

    appId: "YOUR_APP_ID"

};


const app =
initializeApp(firebaseConfig);


const db =
getFirestore(app);


export {

    db,

    collection,

    addDoc,

    getDocs,

    query,

    where

};
