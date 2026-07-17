// =====================================================
// BESHY FIREBASE CONNECTION
// =====================================================

import { initializeApp }
from "https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js";

import { getFirestore }
from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

const firebaseConfig = {

  apiKey: "YOUR_API_KEY",

  authDomain: "digicafe-beshy.firebaseapp.com",

  projectId: "digicafe-beshy",

  storageBucket: "digicafe-beshy.firebasestorage.app",

  messagingSenderId: "359684807397",

  appId: "1:359684807397:web:ebc66e014e04694361120c"

};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);

export { app };
