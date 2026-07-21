// =====================================================
// BESHY FIREBASE CONNECTION
// =====================================================

import { initializeApp }
from "https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js";

import { getFirestore }
from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

// Import the functions you need from the SDKs you need

import { initializeApp } from "firebase/app";

// TODO: Add SDKs for Firebase products that you want to use

// https://firebase.google.com/docs/web/setup#available-libraries


// Your web app's Firebase configuration

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
