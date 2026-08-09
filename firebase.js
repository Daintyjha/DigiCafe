// =====================================================
// BESHY FIREBASE CONNECTION
// =====================================================

import { initializeApp }
from "https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js";

import { getFirestore }
from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

import { getAuth }
from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";

const firebaseConfig = {

  apiKey: "AIzaSyBLI3WImMtnSWD5KtaHAu3s3iFnZNkkL74",

  authDomain: "digicafe-beshy.firebaseapp.com",

  projectId: "digicafe-beshy",

  storageBucket: "digicafe-beshy.firebasestorage.app",

  messagingSenderId: "359684807397",

 appId: "1:359684807397:web:ebc66e014e04694361120c"


};


// =====================================================
// INITIALIZE FIREBASE
// =====================================================

const app =
    initializeApp(firebaseConfig);


// =====================================================
// FIRESTORE
// =====================================================

export const db =
    getFirestore(app);


// =====================================================
// AUTHENTICATION
// =====================================================

export const auth =
    getAuth(app);


console.log(
    "🔥 Firebase connected:",
    app.name
);

console.log(
    "🔐 Firebase Authentication ready"
);
