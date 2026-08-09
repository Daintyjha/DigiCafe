import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";

import { auth } from "./firebase.js";


/* =====================================================
   REGISTER
===================================================== */

export async function registerUser(email, password) {

    const userCredential =
        await createUserWithEmailAndPassword(
            auth,
            email,
            password
        );

    return userCredential.user;
}


/* =====================================================
   LOGIN
===================================================== */

export async function loginUser(email, password) {

    const userCredential =
        await signInWithEmailAndPassword(
            auth,
            email,
            password
        );

    return userCredential.user;
}


/* =====================================================
   LOGOUT
===================================================== */

export async function logoutUser() {

    await signOut(auth);

}


/* =====================================================
   WATCH LOGIN STATE
===================================================== */

export function watchAuthState(callback) {

    return onAuthStateChanged(
        auth,
        callback
    );

}
