import {
    registerUser,
    loginUser,
    logoutUser,
    watchAuthState
} from "./auth.js";


const emailInput =
    document.getElementById("email");

const passwordInput =
    document.getElementById("password");

const registerButton =
    document.getElementById("register");

const loginButton =
    document.getElementById("login");

const logoutButton =
    document.getElementById("logout");

const status =
    document.getElementById("status");


/* =====================================================
   CREATE ACCOUNT
===================================================== */

registerButton.addEventListener(
    "click",
    async () => {

        try {

            const user =
                await registerUser(
                    emailInput.value,
                    passwordInput.value
                );

            status.textContent =
                `Account created: ${user.email}`;

        } catch (error) {

            console.error(error);

            status.textContent =
                error.message;

        }

    }
);


/* =====================================================
   LOGIN
===================================================== */

loginButton.addEventListener(
    "click",
    async () => {

        try {

            const user =
                await loginUser(
                    emailInput.value,
                    passwordInput.value
                );

            status.textContent =
                `Logged in as: ${user.email}`;

        } catch (error) {

            console.error(error);

            status.textContent =
                error.message;

        }

    }
);


/* =====================================================
   LOGOUT
===================================================== */

logoutButton.addEventListener(
    "click",
    async () => {

        try {

            await logoutUser();

            status.textContent =
                "Logged out.";

        } catch (error) {

            console.error(error);

            status.textContent =
                error.message;

        }

    }
);


/* =====================================================
   AUTH STATE
===================================================== */

watchAuthState(
    (user) => {

        if (user) {

            console.log(
                "Current user:",
                user.email
            );

        } else {

            console.log(
                "No user logged in."
            );

        }

    }
);
