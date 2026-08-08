/* =====================================================
   DIGICAFE PDF + AUDIO READER
===================================================== */

import {
    getDocument,
    GlobalWorkerOptions
} from "./pdfjs/build/pdf.mjs";


/* =====================================================
   PDF.JS WORKER
===================================================== */

GlobalWorkerOptions.workerSrc =
    "./pdfjs/build/pdf.worker.mjs";


/* =====================================================
   START READER
===================================================== */

document.addEventListener("DOMContentLoaded", () => {

    /* =================================================
       GET STORY
    ================================================= */

    const storyKey =
        new URLSearchParams(
            window.location.search
        ).get("story");


    const story =
        window.STORIES?.[storyKey];


    /* =================================================
       CHECK STORY
    ================================================= */

    if (!story) {

        const titleEl =
            document.getElementById(
                "chapterTitle"
            );

        if (titleEl) {

            titleEl.textContent =
                "Story not found";

        }

        console.error(
            "Missing story:",
            storyKey
        );

        return;
    }


    /* =================================================
       ELEMENTS
    ================================================= */

    const titleEl =
        document.getElementById(
            "chapterTitle"
        );

    const contentEl =
        document.getElementById(
            "chapterContent"
        );

    const audioEl =
        document.getElementById(
            "chapterAudio"
        );

    const prevBtn =
        document.getElementById(
            "prevChapter"
        );

    const nextBtn =
        document.getElementById(
            "nextChapter"
        );


    /* =================================================
       CREATE CHAPTER LIST
    ================================================= */

    const chapters =
        Array.from(
            {
                length: story.chapters
            },
            (_, i) => {

                const num = i + 1;

                return {

                    title:
                        `${story.title}: Chapter ${num}`,

                    pdf:
                        `./Asset/NovelFiles/${storyKey}/${storyKey}_pdf/ch${num}.pdf`,

                    audio:
                        `./Asset/NovelFiles/${storyKey}/${storyKey}_mp3/ch${num}.mp3`
                };

            }
        );


    /* =================================================
       SAVED PROGRESS
    ================================================= */

    const storageKey =
        "progress_" + storyKey;


    let current =
        parseInt(
            localStorage.getItem(
                storageKey
            )
        ) || 0;


    /* =================================================
       LOAD PDF
    ================================================= */

    async function loadPDF(pdfPath) {

        const viewer =
            document.getElementById(
                "pdfViewer"
            );


        if (!viewer) {

            console.error(
                "PDF viewer container missing."
            );

            return;
        }


        /* ---------------------------------------------
           CLEAR PREVIOUS PDF
        --------------------------------------------- */

        viewer.innerHTML = "";


        try {

            console.log(
                "Loading PDF:",
                pdfPath
            );


            /* -----------------------------------------
               LOAD DOCUMENT
            ----------------------------------------- */

            const pdf =
                await getDocument(
                    pdfPath
                ).promise;


            console.log(
                `PDF loaded: ${pdf.numPages} page(s)`
            );


            /* -----------------------------------------
               RENDER EACH PAGE
            ----------------------------------------- */

            for (
                let pageNumber = 1;
                pageNumber <= pdf.numPages;
                pageNumber++
            ) {

                const page =
                    await pdf.getPage(
                        pageNumber
                    );


                /* -------------------------------------
                   ORIGINAL PAGE SIZE
                ------------------------------------- */

                const baseViewport =
                    page.getViewport({
                        scale: 1
                    });


                /* -------------------------------------
                   AVAILABLE WIDTH
                ------------------------------------- */

                const viewerWidth =
                    viewer.clientWidth;


                /* -------------------------------------
                   SCALE PDF TO CONTAINER
                ------------------------------------- */

                const scale =
                    viewerWidth /
                    baseViewport.width;


                const viewport =
                    page.getViewport({
                        scale
                    });


                /* -------------------------------------
                   CREATE CANVAS
                ------------------------------------- */

                const canvas =
                    document.createElement(
                        "canvas"
                    );


                canvas.className =
                    "pdf-page";


                const context =
                    canvas.getContext(
                        "2d"
                    );


                /* -------------------------------------
                   HIGH-DPI DISPLAY
                ------------------------------------- */

                const pixelRatio =
                    window.devicePixelRatio ||
                    1;


                canvas.width =
                    Math.floor(
                        viewport.width *
                        pixelRatio
                    );


                canvas.height =
                    Math.floor(
                        viewport.height *
                        pixelRatio
                    );


                canvas.style.width =
                    `${viewport.width}px`;


                canvas.style.height =
                    `${viewport.height}px`;


                context.scale(
                    pixelRatio,
                    pixelRatio
                );


                /* -------------------------------------
                   ADD PAGE TO VIEWER
                ------------------------------------- */

                viewer.appendChild(
                    canvas
                );


                /* -------------------------------------
                   RENDER PAGE
                ------------------------------------- */

                await page.render({

                    canvasContext:
                        context,

                    viewport:
                        viewport

                }).promise;

            }


        } catch (error) {

            console.error(
                "PDF loading error:",
                error
            );


            viewer.innerHTML = `
                <div class="pdf-error">

                    <p>
                        Sorry, this chapter
                        could not be loaded.
                    </p>

                </div>
            `;
        }
    }


    /* =================================================
       LOAD CHAPTER
    ================================================= */

    async function loadChapter(i) {

        if (
            i < 0 ||
            i >= chapters.length
        ) {

            return;
        }


        const chapter =
            chapters[i];


        current = i;


        /* ---------------------------------------------
           TITLE
        --------------------------------------------- */

        titleEl.textContent =
            chapter.title;


        /* ---------------------------------------------
           LOAD PDF
        --------------------------------------------- */

        await loadPDF(
            chapter.pdf
        );


        /* ---------------------------------------------
           LOAD AUDIO
        --------------------------------------------- */

        if (audioEl) {

            console.log(
                "Loading audio:",
                chapter.audio
            );


            audioEl.src =
                chapter.audio;


            audioEl.load();
        }


        /* ---------------------------------------------
           SAVE PROGRESS
        --------------------------------------------- */

        localStorage.setItem(
            storageKey,
            current
        );


        /* ---------------------------------------------
           BUTTON STATE
        --------------------------------------------- */

        if (prevBtn) {

            prevBtn.disabled =
                current === 0;
        }


        if (nextBtn) {

            nextBtn.disabled =
                current ===
                chapters.length - 1;
        }


        /* ---------------------------------------------
           RETURN TO TOP
        --------------------------------------------- */

        window.scrollTo({

            top: 0,

            behavior: "smooth"

        });

    }


    /* =================================================
       PREVIOUS CHAPTER
    ================================================= */

    prevBtn?.addEventListener(
        "click",
        () => {

            loadChapter(
                current - 1
            );

        }
    );


    /* =================================================
       NEXT CHAPTER
    ================================================= */

    nextBtn?.addEventListener(
        "click",
        () => {

            loadChapter(
                current + 1
            );

        }
    );


    /* =================================================
       START CURRENT CHAPTER
    ================================================= */

    loadChapter(
        current
    );

});
