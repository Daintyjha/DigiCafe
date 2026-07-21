// =====================================================
// BESHY FIREBASE CONNECTION
// =====================================================

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


// Initialize Firebase

const app = initializeApp(firebaseConfig);


// Initialize Firestore

export const db = getFirestore(app);


console.log("🔥 Firebase connected:", app.name);

