// =====================================================
// DIGICAFE CONTENT INTERACTIONS
// =====================================================

import { watchAuthState } from "./auth.js";


// =====================================================
// INITIALIZE INTERACTIONS
// =====================================================

function initializeInteractions() {

    const interaction =
        document.querySelector(
            ".digi-interactions"
        );


    if (!interaction) {

        console.warn(
            "DigiCafe interaction component not found."
        );

        return;

    }


    const likeButton =
        interaction.querySelector(
            ".interaction-like"
        );


    const commentButton =
        interaction.querySelector(
            ".interaction-comment"
        );


    const commentInput =
        interaction.querySelector(
            ".comment-input"
        );


    const submitComment =
        interaction.querySelector(
            ".comment-submit"
        );


    /* =================================================
       WATCH FIREBASE LOGIN STATE
    ================================================= */

    watchAuthState(
        (user) => {

            if (user) {

                console.log(
                    "Interaction user:",
                    user.email
                );


                /* -----------------------------------------
                   USER IS LOGGED IN
                ----------------------------------------- */

                likeButton.disabled =
                    false;

                commentButton.disabled =
                    false;

                commentInput.disabled =
                    false;

                submitComment.disabled =
                    false;


                likeButton.title =
                    "Like this content";

                commentButton.title =
                    "View comments";


            } else {

                console.log(
                    "No user logged in."
                );


                /* -----------------------------------------
                   USER IS NOT LOGGED IN
                ----------------------------------------- */

                likeButton.disabled =
                    true;

                commentButton.disabled =
                    true;

                commentInput.disabled =
                    true;

                submitComment.disabled =
                    true;


                likeButton.title =
                    "Please log in to like";

                commentButton.title =
                    "Please log in to view comments";

                commentInput.placeholder =
                    "Please log in to comment.";

            }

        }
    );

}


export {
    initializeInteractions
};
