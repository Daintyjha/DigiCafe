// =====================================================
// DIGICAFE ACCOUNT PAGE
// =====================================================

import {
    registerUser,
    loginUser,
    logoutUser,
    watchAuthState
} from "./auth.js";


// =====================================================
// ELEMENTS
// =====================================================

const loginForm =
    document.getElementById(
        "loginForm"
    );

const registerForm =
    document.getElementById(
        "registerForm"
    );

const authForms =
    document.getElementById(
        "authForms"
    );

const accountLoggedIn =
    document.getElementById(
        "accountLoggedIn"
    );


const showRegister =
    document.getElementById(
        "showRegister"
    );

const showLogin =
    document.getElementById(
        "showLogin"
    );


const loginButton =
    document.getElementById(
        "loginButton"
    );

const registerButton =
    document.getElementById(
        "registerButton"
    );

const logoutButton =
    document.getElementById(
        "logoutButton"
    );


const loginEmail =
    document.getElementById(
        "loginEmail"
    );

const loginPassword =
    document.getElementById(
        "loginPassword"
    );


const registerEmail =
    document.getElementById(
        "registerEmail"
    );

const registerPassword =
    document.getElementById(
        "registerPassword"
    );


const loginMessage =
    document.getElementById(
        "loginMessage"
    );

const registerMessage =
    document.getElementById(
        "registerMessage"
    );

const logoutMessage =
    document.getElementById(
        "logoutMessage"
    );


const currentUserEmail =
    document.getElementById(
        "currentUserEmail"
    );


// =====================================================
// SHOW REGISTER
// =====================================================

showRegister.addEventListener(
    "click",
    () => {

        loginForm.hidden =
            true;

        registerForm.hidden =
            false;

        loginMessage.textContent =
            "";

        registerMessage.textContent =
            "";

    }
);


// =====================================================
// SHOW LOGIN
// =====================================================

showLogin.addEventListener(
    "click",
    () => {

        registerForm.hidden =
            true;

        loginForm.hidden =
            false;

        loginMessage.textContent =
            "";

        registerMessage.textContent =
            "";

    }
);


// =====================================================
// CREATE ACCOUNT
// =====================================================

registerButton.addEventListener(
    "click",
    async () => {

        registerMessage.textContent =
            "";

        const email =
            registerEmail.value.trim();

        const password =
            registerPassword.value;


        if (!email || !password) {

            registerMessage.textContent =
                "Please enter your email and password.";

            return;

        }


        try {

            const user =
                await registerUser(
                    email,
                    password
                );


            registerMessage.textContent =
                `Welcome to DigiCafe, ${user.email}!`;

        } catch (error) {

            console.error(
                "Registration error:",
                error
            );


            registerMessage.textContent =
                getAuthErrorMessage(
                    error
                );

        }

    }
);


// =====================================================
// LOGIN
// =====================================================

loginButton.addEventListener(
    "click",
    async () => {

        loginMessage.textContent =
            "";

        const email =
            loginEmail.value.trim();

        const password =
            loginPassword.value;


        if (!email || !password) {

            loginMessage.textContent =
                "Please enter your email and password.";

            return;

        }


        try {

            await loginUser(
                email,
                password
            );


            loginMessage.textContent =
                "Welcome back! ☕";

        } catch (error) {

            console.error(
                "Login error:",
                error
            );


            loginMessage.textContent =
                getAuthErrorMessage(
                    error
                );

        }

    }
);


// =====================================================
// LOGOUT
// =====================================================

logoutButton.addEventListener(
    "click",
    async () => {

        logoutMessage.textContent =
            "";


        try {

            await logoutUser();

        } catch (error) {

            console.error(
                "Logout error:",
                error
            );


            logoutMessage.textContent =
                "Something went wrong while logging out.";

        }

    }
);


// =====================================================
// WATCH AUTH STATE
// =====================================================

watchAuthState(
    (user) => {

        if (user) {

            authForms.hidden =
                true;

            accountLoggedIn.hidden =
                false;


            currentUserEmail.textContent =
                user.email;


        } else {

            authForms.hidden =
                false;

            accountLoggedIn.hidden =
                true;

        }

    }
);


// =====================================================
// FIREBASE ERROR TRANSLATION
// =====================================================

function getAuthErrorMessage(
    error
) {

    switch (error.code) {

        case "auth/email-already-in-use":

            return "That email already has a DigiCafe account.";

        case "auth/invalid-email":

            return "Please enter a valid email address.";

        case "auth/weak-password":

            return "Please choose a stronger password.";

        case "auth/invalid-credential":

            return "The email or password is incorrect.";

        case "auth/user-not-found":

            return "We couldn't find an account with that email.";

        case "auth/wrong-password":

            return "The password is incorrect.";

        default:

            return "Something went wrong. Please try again.";

    }

}

