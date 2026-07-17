// Beshy Firebase Connection

import { initializeApp } 
from "https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js";

import { getFirestore }
from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";


const firebaseConfig = {

  apiKey: "AIzaSyBLI3WImMtnSWD5KtaHAu3s3iFnZNkkL74",

  authDomain: "digicafe-beshy.firebaseapp.com",

  projectId: "digicafe-beshy",

  storageBucket: "digicafe-beshy.firebasestorage.app",

  messagingSenderId: "359684807397",

  appId: "1:359684807397:web:ebc66e014e04694361120c"

};

const app = initializeApp(firebaseConfig);


// This allows Beshy to use Firestore
export const db = getFirestore(app);


// This allows Beshy to use Firebase Functions
export { app };
const app = initializeApp(firebaseConfig);


// This allows Beshy to use Firestore
export const db = getFirestore(app);
