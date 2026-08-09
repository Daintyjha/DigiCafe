/* =====================================================
   DIGICAFE SINGLE-PAGE PDF + AUDIO READER
===================================================== */

import {
    getDocument,
    GlobalWorkerOptions
} from "./build/pdf.mjs";


/* =====================================================
   PDF.JS WORKER
===================================================== */

GlobalWorkerOptions.workerSrc =
    "./build/pdf.worker.mjs";


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
       STORY NOT FOUND
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

    const prevChapterBtn =
        document.getElementById(
            "prevChapter"
        );

    const nextChapterBtn =
        document.getElementById(
            "nextChapter"
        );


    /* =================================================
   CREATE PDF VIEWER
================================================= */

contentEl.innerHTML = `

    <div class="pdf-viewer">

        <canvas
            id="pdfCanvas"
            class="pdf-page">
        </canvas>


        <div class="pdf-controls">

            <!-- PDF PAGE NAVIGATION -->

            <div class="pdf-page-controls">

                <button
                    id="prevPdfPage"
                    aria-label="Previous PDF page">
                    ‹
                </button>

                <span id="pdfPageNumber">
                    1 / 1
                </span>

                <button
                    id="nextPdfPage"
                    aria-label="Next PDF page">
                    ›
                </button>

            </div>


            <!-- PDF ZOOM -->

            <div class="pdf-zoom-controls">

                <button
                    id="zoomOut"
                    aria-label="Zoom out">
                    −
                </button>

                <button
                    id="zoomReset"
                    aria-label="Reset zoom">
                    100%
                </button>

                <button
                    id="zoomIn"
                    aria-label="Zoom in">
                    +
                </button>

            </div>

        </div>

    </div>

`;

    /* =================================================
       PDF ELEMENTS
    ================================================= */

    const canvas =
        document.getElementById(
            "pdfCanvas"
        );

    const canvasContext =
        canvas.getContext("2d");


    const prevPdfPage =
        document.getElementById(
            "prevPdfPage"
        );

    const nextPdfPage =
        document.getElementById(
            "nextPdfPage"
        );

    const pdfPageNumber =
        document.getElementById(
            "pdfPageNumber"
        );
const zoomOut =
    document.getElementById(
        "zoomOut"
    );

const zoomReset =
    document.getElementById(
        "zoomReset"
    );

const zoomIn =
    document.getElementById(
        "zoomIn"
    );

    /* =================================================
       CHAPTER DATA
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
       READING PROGRESS
    ================================================= */

    const storageKey =
        "progress_" + storyKey;


    let currentChapter =
        parseInt(
            localStorage.getItem(
                storageKey
            )
        ) || 0;


    /* =================================================
       PDF STATE
    ================================================= */

    let currentPDF = null;

let currentPDFPage = 1;

let rendering = false;

let pendingPage = null;


/* =================================================
   PDF ZOOM
================================================= */

let zoomLevel = 1;

const zoomStep = 0.15;

const minZoom = 0.7;

const maxZoom = 3;

    /* =================================================
       RENDER PDF PAGE
    ================================================= */

    async function renderPDFPage(
        pageNumber
    ) {

        if (!currentPDF) {
            return;
        }


        /* ---------------------------------------------
           PREVENT DOUBLE RENDER
        --------------------------------------------- */

        if (rendering) {

            pendingPage =
                pageNumber;

            return;
        }


        rendering = true;


        try {

            const page =
                await currentPDF.getPage(
                    pageNumber
                );


            /* -----------------------------------------
               VIEWER WIDTH
            ----------------------------------------- */

            const viewer =
                document.querySelector(
                    ".pdf-viewer"
                );


            const availableWidth =
                viewer.clientWidth;


            /* -----------------------------------------
               PAGE SIZE
            ----------------------------------------- */

            const baseViewport =
                page.getViewport({
                    scale: 1
                });


            const scale =
    (availableWidth /
        baseViewport.width) *
    zoomLevel;


            const viewport =
                page.getViewport({
                    scale
                });


            /* -----------------------------------------
               HIGH DPI
            ----------------------------------------- */

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


            canvasContext.setTransform(
                pixelRatio,
                0,
                0,
                pixelRatio,
                0,
                0
            );


            /* -----------------------------------------
               RENDER
            ----------------------------------------- */

            await page.render({

                canvasContext:
                    canvasContext,

                viewport:
                    viewport

            }).promise;


            /* -----------------------------------------
               UPDATE PAGE NUMBER
            ----------------------------------------- */

            currentPDFPage =
                pageNumber;


            pdfPageNumber.textContent =
                `${currentPDFPage} / ${currentPDF.numPages}`;


            /* -----------------------------------------
               BUTTON STATES
            ----------------------------------------- */

            prevPdfPage.disabled =
                currentPDFPage <= 1;


            nextPdfPage.disabled =
                currentPDFPage >=
                currentPDF.numPages;


        } catch (error) {

            console.error(
                "PDF page rendering error:",
                error
            );

        }


        rendering = false;


        /* ---------------------------------------------
           RENDER PENDING PAGE
        --------------------------------------------- */

        if (pendingPage !== null) {

            const nextPage =
                pendingPage;

            pendingPage = null;

            renderPDFPage(
                nextPage
            );
        }

    }


    /* =================================================
       LOAD PDF
    ================================================= */

    async function loadPDF(
        pdfPath
    ) {

        try {

            console.log(
                "Loading PDF:",
                pdfPath
            );


            currentPDF =
                await getDocument({

                    url:
                        pdfPath

                }).promise;


            console.log(
                `PDF loaded: ${currentPDF.numPages} page(s)`
            );


            currentPDFPage = 1;


            pdfPageNumber.textContent =
                `1 / ${currentPDF.numPages}`;


            await renderPDFPage(
                1
            );


        } catch (error) {

            console.error(
                "PDF loading error:",
                error
            );


            currentPDF = null;


            contentEl.innerHTML = `

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

    async function loadChapter(
        chapterIndex
    ) {

        if (
            chapterIndex < 0 ||
            chapterIndex >= chapters.length
        ) {

            return;
        }


        const chapter =
            chapters[
                chapterIndex
            ];


        currentChapter =
            chapterIndex;


        /* ---------------------------------------------
           TITLE
        --------------------------------------------- */

        titleEl.textContent =
            chapter.title;

zoomLevel = 1;

zoomReset.textContent = "100%";
        /* ---------------------------------------------
           PDF
        --------------------------------------------- */

        await loadPDF(
            chapter.pdf
        );


        /* ---------------------------------------------
           AUDIO
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
            currentChapter
        );


        /* ---------------------------------------------
           CHAPTER BUTTONS
        --------------------------------------------- */

        if (prevChapterBtn) {

            prevChapterBtn.disabled =
                currentChapter === 0;

        }


        if (nextChapterBtn) {

            nextChapterBtn.disabled =
                currentChapter ===
                chapters.length - 1;

        }


        /* ---------------------------------------------
           SCROLL TO READER
        --------------------------------------------- */

        window.scrollTo({

            top: 0,

            behavior: "smooth"

        });

    }


    /* =================================================
       PDF PREVIOUS PAGE
    ================================================= */

    prevPdfPage.addEventListener(
        "click",
        () => {

            if (
                currentPDFPage > 1
            ) {

                renderPDFPage(
                    currentPDFPage - 1
                );

            }

        }
    );


    /* =================================================
       PDF NEXT PAGE
    ================================================= */

    nextPdfPage.addEventListener(
        "click",
        () => {

            if (
                currentPDF &&
                currentPDFPage <
                currentPDF.numPages
            ) {

                renderPDFPage(
                    currentPDFPage + 1
                );

            }

        }
    );

/* =================================================
   PDF ZOOM OUT
================================================= */

zoomOut.addEventListener(
    "click",
    () => {

        zoomLevel = Math.max(
            minZoom,
            zoomLevel - zoomStep
        );

        zoomReset.textContent =
            `${Math.round(zoomLevel * 100)}%`;

        renderPDFPage(
            currentPDFPage
        );

    }
);


/* =================================================
   PDF ZOOM IN
================================================= */

zoomIn.addEventListener(
    "click",
    () => {

        zoomLevel = Math.min(
            maxZoom,
            zoomLevel + zoomStep
        );

        zoomReset.textContent =
            `${Math.round(zoomLevel * 100)}%`;

        renderPDFPage(
            currentPDFPage
        );

    }
);


/* =================================================
   PDF ZOOM RESET
================================================= */

zoomReset.addEventListener(
    "click",
    () => {

        zoomLevel = 1;

        zoomReset.textContent =
            "100%";

        renderPDFPage(
            currentPDFPage
        );

    }
);
    /* =================================================
       PREVIOUS CHAPTER
    ================================================= */

    prevChapterBtn?.addEventListener(
        "click",
        () => {

            loadChapter(
                currentChapter - 1
            );

        }
    );


    /* =================================================
       NEXT CHAPTER
    ================================================= */

    nextChapterBtn?.addEventListener(
        "click",
        () => {

            loadChapter(
                currentChapter + 1
            );

        }
    );


    /* =================================================
       START CURRENT CHAPTER
    ================================================= */

    loadChapter(
        currentChapter
    );

});
