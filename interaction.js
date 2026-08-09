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
    serverTimestamp,
    orderBy
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
       CONTENT INFORMATION
    ================================================= */

    const contentId =
        interaction.dataset.contentId;


    const contentType =
        interaction.dataset.contentType;


    if (!contentId) {

        console.warn(
            "Interaction cannot initialize: missing content ID."
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


    const commentCount =
        interaction.querySelector(
            ".interaction-comment-count"
        );


    const commentsSection =
        interaction.querySelector(
            ".interaction-comments"
        );


    const commentList =
        interaction.querySelector(
            ".comment-list"
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
       VALIDATE ELEMENTS
    ================================================= */

    if (
        !likeButton ||
        !likeIcon ||
        !likeCount ||
        !commentButton ||
        !commentCount ||
        !commentList ||
        !commentInput ||
        !submitComment
    ) {

        console.warn(
            "DigiCafe interaction HTML is incomplete."
        );

        return;

    }


    /* =================================================
       USER STATE
    ================================================= */

    let currentUser =
        null;


    let userHasLiked =
        false;


    /* =================================================
       CLEAN PREVIOUS AUTH LISTENER
    ================================================= */

    if (authUnsubscribe) {

        authUnsubscribe();

        authUnsubscribe =
            null;

    }


    /* =================================================
       INITIAL STATE
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
       LOAD INITIAL DATA
    ================================================= */

    loadLikeCount();

    loadCommentCount();

    loadComments();


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
                    "Sorry, something went wrong with the like."
                );

            }


            likeButton.disabled =
                false;

        }
    );


    /* =================================================
       COMMENT BUTTON
    ================================================= */

    commentButton.addEventListener(
        "click",
        () => {

            if (!currentUser) {

                alert(
                    "Please log in to view and write comments."
                );

                return;

            }


            if (
                commentsSection
            ) {

                commentsSection.classList.toggle(
                    "comments-open"
                );


                if (
                    commentsSection.classList.contains(
                        "comments-open"
                    )
                ) {

                    commentInput.focus();

                }

            }

        }
    );


    /* =================================================
       SUBMIT COMMENT
    ================================================= */

    submitComment.addEventListener(
        "click",
        async () => {

            if (!currentUser) {

                alert(
                    "Please log in to comment."
                );

                return;

            }


            const text =
                commentInput.value.trim();


            if (!text) {

                alert(
                    "Please write something first."
                );

                return;

            }


            if (text.length > 1000) {

                alert(
                    "Your comment is too long. Please keep it under 1000 characters."
                );

                return;

            }


            submitComment.disabled =
                true;


            try {

                const commentRef =
                    doc(
                        collection(
                            db,
                            "comments"
                        )
                    );


                await setDoc(
                    commentRef,
                    {

                        userId:
                            currentUser.uid,

                        userEmail:
                            currentUser.email,

                        contentId:
                            contentId,

                        contentType:
                            contentType,

                        text:
                            text,

                        createdAt:
                            serverTimestamp()

                    }
                );


                console.log(
                    "Comment posted:",
                    commentRef.id
                );


                commentInput.value =
                    "";


                await loadComments();

                await loadCommentCount();


            } catch (error) {

                console.error(
                    "Comment error:",
                    error
                );


                alert(
                    "Sorry, your comment could not be posted."
                );

            }


            submitComment.disabled =
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
        currentContentId,
        currentContentType
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
                        currentContentId
                    ),

                    where(
                        "contentType",
                        "==",
                        currentContentType
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


    /* =================================================
       LOAD COMMENT COUNT
    ================================================= */

    async function loadCommentCount() {

        try {

            const commentsRef =
                collection(
                    db,
                    "comments"
                );


            const commentsQuery =
                query(

                    commentsRef,

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
                    commentsQuery
                );


            commentCount.textContent =
                snapshot.size;


        } catch (error) {

            console.error(
                "Could not load comment count:",
                error
            );

        }

    }


    /* =================================================
       LOAD COMMENTS
    ================================================= */

    async function loadComments() {

        try {

            commentList.innerHTML = "";


            const commentsRef =
                collection(
                    db,
                    "comments"
                );


            const commentsQuery =
                query(

                    commentsRef,

                    where(
                        "contentId",
                        "==",
                        contentId
                    ),

                    where(
                        "contentType",
                        "==",
                        contentType
                    ),

                    orderBy(
                        "createdAt",
                        "asc"
                    )

                );


            const snapshot =
                await getDocs(
                    commentsQuery
                );


            if (
                snapshot.empty
            ) {

                commentList.innerHTML = `

                    <p class="no-comments">
                        No comments yet. Be the first to say something! ☕
                    </p>

                `;


                return;

            }


            snapshot.forEach(
                (commentDoc) => {

                    const data =
                        commentDoc.data();


                    const commentElement =
                        createCommentElement(
                            commentDoc.id,
                            data
                        );


                    commentList.appendChild(
                        commentElement
                    );

                }
            );


        } catch (error) {

            console.error(
                "Could not load comments:",
                error
            );


            commentList.innerHTML = `

                <p class="comment-error">
                    Comments could not be loaded right now.
                </p>

            `;

        }

    }


    /* =================================================
       CREATE COMMENT ELEMENT
    ================================================= */

    function createCommentElement(
        commentId,
        data
    ) {

        const wrapper =
            document.createElement(
                "article"
            );


        wrapper.className =
            "comment-item";


        /* =============================================
           USER
        ============================================= */

        const user =
            document.createElement(
                "strong"
            );


        user.className =
            "comment-user";


        user.textContent =
            data.userEmail ||
            "DigiCafe Guest";


        /* =============================================
           COMMENT TEXT
        ============================================= */

        const text =
            document.createElement(
                "p"
            );


        text.className =
            "comment-text";


        text.textContent =
            data.text ||
            "";


        /* =============================================
           COMMENT DATE
        ============================================= */

        const date =
            document.createElement(
                "small"
            );


        date.className =
            "comment-date";


        if (
            data.createdAt &&
            data.createdAt.toDate
        ) {

            date.textContent =
                formatCommentDate(
                    data.createdAt.toDate()
                );

        }

        else {

            date.textContent =
                "Just now";

        }


        /* =============================================
           DELETE BUTTON
        ============================================= */

        const deleteButton =
            document.createElement(
                "button"
            );


        deleteButton.type =
            "button";


        deleteButton.className =
            "comment-delete";


        deleteButton.textContent =
            "Delete";


        if (
            !currentUser ||
            currentUser.uid !==
            data.userId
        ) {

            deleteButton.style.display =
                "none";

        }


        deleteButton.addEventListener(
            "click",
            async () => {

                if (!currentUser) {

                    return;

                }


                if (
                    currentUser.uid !==
                    data.userId
                ) {

                    return;

                }


                const confirmed =
                    confirm(
                        "Delete this comment?"
                    );


                if (!confirmed) {

                    return;

                }


                try {

                    await deleteDoc(
                        doc(
                            db,
                            "comments",
                            commentId
                        )
                    );


                    await loadComments();

                    await loadCommentCount();


                } catch (error) {

                    console.error(
                        "Could not delete comment:",
                        error
                    );


                    alert(
                        "Sorry, the comment could not be deleted."
                    );

                }

            }
        );


        /* =============================================
           BUILD COMMENT
        ============================================= */

        const header =
            document.createElement(
                "div"
            );


        header.className =
            "comment-header";


        header.appendChild(
            user
        );


        header.appendChild(
            date
        );


        const footer =
            document.createElement(
                "div"
            );


        footer.className =
            "comment-footer";


        footer.appendChild(
            deleteButton
        );


        wrapper.appendChild(
            header
        );


        wrapper.appendChild(
            text
        );


        wrapper.appendChild(
            footer
        );


        return wrapper;

    }


    /* =================================================
       FORMAT COMMENT DATE
    ================================================= */

    function formatCommentDate(
        date
    ) {

        return date.toLocaleString(
            undefined,
            {

                year:
                    "numeric",

                month:
                    "short",

                day:
                    "numeric",

                hour:
                    "2-digit",

                minute:
                    "2-digit"

            }
        );

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
