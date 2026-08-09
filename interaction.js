// =====================================================
// DIGICAFE CONTENT INTERACTIONS
// =====================================================

import {
    collection,
    doc,
    setDoc,
    deleteDoc,
    getDocs,
    query,
    where,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

import { db } from "./firebase.js";

import { watchAuthState } from "./auth.js";


// =====================================================
// CURRENT INTERACTION INSTANCE
// =====================================================

let authUnsubscribe = null;


// =====================================================
// INITIALIZE INTERACTIONS
// =====================================================

export function initializeInteractions() {

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


    /* =================================================
       CONTENT ID
    ================================================= */

    const contentId =
        interaction.dataset.contentId;


    const contentType =
        interaction.dataset.contentType;


    if (!contentId) {

        console.warn(
            "Interaction cannot initialize yet: missing content ID."
        );

        return;

    }


    console.log(
        "Initializing interaction:",
        contentType,
        contentId
    );


    /* =================================================
       ELEMENTS
    ================================================= */

    const likeButton =
        interaction.querySelector(
            ".interaction-like"
        );


    const likeIcon =
        interaction.querySelector(
            ".interaction-like-icon"
        );


    const likeCount =
        interaction.querySelector(
            ".interaction-like-count"
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
       CLEAN PREVIOUS AUTH LISTENER
    ================================================= */

    if (authUnsubscribe) {

        authUnsubscribe();

        authUnsubscribe =
            null;

    }


    /* =================================================
       USER STATE
    ================================================= */

    let currentUser =
        null;


    let userHasLiked =
        false;


    /* =================================================
       INITIAL BUTTON STATE
    ================================================= */

    likeButton.disabled =
        true;


    commentButton.disabled =
        true;


    commentInput.disabled =
        true;


    submitComment.disabled =
        true;


    /* =================================================
       LOAD LIKE COUNT
    ================================================= */

    loadLikeCount();


    /* =================================================
       WATCH AUTH STATE
    ================================================= */

    authUnsubscribe =
        watchAuthState(
            async (user) => {

                currentUser =
                    user;


                /* =========================================
                   LOGGED IN
                ========================================= */

                if (user) {

                    console.log(
                        "Interaction user:",
                        user.email
                    );


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


                    commentInput.placeholder =
                        "Write a comment...";


                    userHasLiked =
                        await checkUserLike(
                            user.uid,
                            contentId,
                            contentType
                        );


                    updateLikeButton();

                }


                /* =========================================
                   LOGGED OUT
                ========================================= */

                else {

                    console.log(
                        "No user logged in."
                    );


                    currentUser =
                        null;


                    userHasLiked =
                        false;


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


                    updateLikeButton();

                }

            }
        );


    /* =================================================
       LIKE BUTTON
    ================================================= */

    likeButton.addEventListener(
        "click",
        async () => {

            if (!currentUser) {

                alert(
                    "Please log in to like this content."
                );

                return;

            }


            likeButton.disabled =
                true;


            try {

                const likeDocumentId =
                    createLikeDocumentId(
                        contentType,
                        contentId,
                        currentUser.uid
                    );


                const likeRef =
                    doc(
                        db,
                        "likes",
                        likeDocumentId
                    );


                /* =========================================
                   REMOVE LIKE
                ========================================= */

                if (userHasLiked) {

                    await deleteDoc(
                        likeRef
                    );


                    userHasLiked =
                        false;

                }


                /* =========================================
                   ADD LIKE
                ========================================= */

                else {

                    await setDoc(
                        likeRef,
                        {

                            userId:
                                currentUser.uid,

                            contentId:
                                contentId,

                            contentType:
                                contentType,

                            createdAt:
                                serverTimestamp()

                        }
                    );


                    userHasLiked =
                        true;

                }


                updateLikeButton();


                await loadLikeCount();


            } catch (error) {

                console.error(
                    "Like error:",
                    error
                );

                alert(
                    "Sorry, something went wrong."
                );

            }


            likeButton.disabled =
                false;

        }
    );


    /* =================================================
       LOAD LIKE COUNT
    ================================================= */

    async function loadLikeCount() {

        try {

            const likesRef =
                collection(
                    db,
                    "likes"
                );


            const likesQuery =
                query(
                    likesRef,

                    where(
                        "contentId",
                        "==",
                        contentId
                    ),

                    where(
                        "contentType",
                        "==",
                        contentType
                    )
                );


            const snapshot =
                await getDocs(
                    likesQuery
                );


            likeCount.textContent =
                snapshot.size;


        } catch (error) {

            console.error(
                "Could not load likes:",
                error
            );

        }

    }


    /* =================================================
       CHECK USER LIKE
    ================================================= */

    async function checkUserLike(
        userId,
        contentId,
        contentType
    ) {

        try {

            const likesRef =
                collection(
                    db,
                    "likes"
                );


            const userLikeQuery =
                query(

                    likesRef,

                    where(
                        "userId",
                        "==",
                        userId
                    ),

                    where(
                        "contentId",
                        "==",
                        contentId
                    ),

                    where(
                        "contentType",
                        "==",
                        contentType
                    )

                );


            const snapshot =
                await getDocs(
                    userLikeQuery
                );


            return !snapshot.empty;


        } catch (error) {

            console.error(
                "Could not check user like:",
                error
            );


            return false;

        }

    }


    /* =================================================
       UPDATE LIKE BUTTON
    ================================================= */

    function updateLikeButton() {

        if (userHasLiked) {

            likeIcon.textContent =
                "♥";


            likeButton.classList.add(
                "liked"
            );

        }

        else {

            likeIcon.textContent =
                "♡";


            likeButton.classList.remove(
                "liked"
            );

        }

    }

}


// =====================================================
// CREATE LIKE DOCUMENT ID
// =====================================================

function createLikeDocumentId(
    contentType,
    contentId,
    userId
) {

    return (
        `${contentType}_${contentId}_${userId}`
    );

}
