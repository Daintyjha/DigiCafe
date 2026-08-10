/* =====================================================
   DIGICAFE SINGLE-PAGE PDF + AUDIO READER
   Supports:
   - Novels
   - Blog
   - Discussion
===================================================== */

import {
    getDocument,
    GlobalWorkerOptions
} from "./build/pdf.mjs";

import {
    initializeInteractions
} from "./interaction.js";


/* =====================================================
   PDF.JS WORKER
===================================================== */

GlobalWorkerOptions.workerSrc =
    "./build/pdf.worker.mjs";


/* =====================================================
   START READER
===================================================== */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        /* =================================================
           GET CONTENT
        ================================================= */

        const storyKey =
            new URLSearchParams(
                window.location.search
            ).get("story");


        const story =
            window.STORIES?.[storyKey];


        /* =================================================
           CONTENT NOT FOUND
        ================================================= */

        if (!story) {

            const titleEl =
                document.getElementById(
                    "chapterTitle"
                );


            if (titleEl) {

                titleEl.textContent =
                    "Content not found";

            }


            console.error(
                "Missing content:",
                storyKey
            );


            return;

        }


        /* =================================================
           DETERMINE CONTENT TYPE
        ================================================= */

        const contentType =
            story.type || "novel";


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


        const audioContainer =
            document.getElementById(
                "audioContainer"
            );


        const readerNote =
            document.getElementById(
                "readerNote"
            );


        const interactionContainer =
            document.getElementById(
                "interactionContainer"
            );


        const publishedDate =
            document.getElementById(
                "publishedDate"
            );


        const chapterNavigation =
            document.getElementById(
                "chapterNavigation"
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
           CONTENT TYPE UI
        ================================================= */

        if (
            contentType === "blog" ||
            contentType === "discussion"
        ) {

            /* Hide novel-only elements */

            if (audioContainer) {

                audioContainer.style.display =
                    "none";

            }


            if (readerNote) {

                readerNote.style.display =
                    "none";

            }


            if (chapterNavigation) {

                chapterNavigation.style.display =
                    "none";

            }


            /* Show publication date */

            if (
                publishedDate &&
                story.published
            ) {

                const date =
                    new Date(
                        story.published +
                        "T00:00:00"
                    );


                publishedDate.textContent =
                    `Published ${date.toLocaleDateString(
                        "en-US",
                        {
                            year: "numeric",
                            month: "long",
                            day: "numeric"
                        }
                    )}`;


                publishedDate.style.display =
                    "block";

            }

        }


        /* =================================================
           LOAD DIGICAFE INTERACTIONS
        ================================================= */

        async function loadInteractions() {

            if (!interactionContainer) {

                console.warn(
                    "Interaction container not found."
                );


                return;

            }


            try {

                const response =
                    await fetch(
                        "./interaction.html"
                    );


                if (!response.ok) {

                    throw new Error(
                        `Could not load interaction.html: ${response.status}`
                    );

                }


                const html =
                    await response.text();


                interactionContainer.innerHTML =
                    html;


                console.log(
                    "DigiCafe interaction component loaded."
                );


            } catch (error) {

                console.error(
                    "Interaction loading error:",
                    error
                );

            }

        }


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

        let chapters = [];


        if (contentType === "novel") {

            chapters =
                Array.from(
                    {
                        length:
                            story.chapters
                    },

                    (_, i) => {

                        const num =
                            i + 1;


                        return {

                            number:
                                num,

                            title:
                                `${story.title}: Chapter ${num}`,

                            pdf:
                                `./Asset/NovelFiles/${storyKey}/${storyKey}_pdf/ch${num}.pdf`,

                            audio:
                                `./Asset/NovelFiles/${storyKey}/${storyKey}_mp3/ch${num}.mp3`

                        };

                    }
                );

        }


        /* =================================================
           READING PROGRESS
        ================================================= */

        const storageKey =
            "progress_" +
            storyKey;


        let currentChapter =
            parseInt(
                localStorage.getItem(
                    storageKey
                )
            ) || 0;


        /* =================================================
           PDF STATE
        ================================================= */

        let currentPDF =
            null;


        let currentPDFPage =
            1;


        let rendering =
            false;


        let pendingPage =
            null;


        /* =================================================
           PDF ZOOM
        ================================================= */

        let zoomLevel =
            1;


        const zoomStep =
            0.15;


        const minZoom =
            0.7;


        const maxZoom =
            3;


        /* =================================================
           UPDATE ZOOM DISPLAY
        ================================================= */

        function updateZoomDisplay() {

            zoomReset.textContent =
                `${Math.round(
                    zoomLevel * 100
                )}%`;

        }


        /* =================================================
           UPDATE INTERACTION CONTENT
        ================================================= */

        function updateInteractionContent(
            chapterIndex = 0
        ) {

            if (!interactionContainer) {

                return;

            }


            const interaction =
                interactionContainer.querySelector(
                    ".digi-interactions"
                );


            if (!interaction) {

                console.warn(
                    "Interaction component not found."
                );


                return;

            }


            let contentId =
                storyKey;


            if (contentType === "novel") {

                const chapterNumber =
                    chapterIndex + 1;


                contentId =
                    `${storyKey}-chapter-${chapterNumber}`;

            }


            interaction.dataset.contentId =
                contentId;


            interaction.dataset.contentType =
                contentType;


            console.log(
                "Interaction content ID:",
                contentId
            );

        }


        /* =================================================
           RENDER PDF PAGE
        ================================================= */

        async function renderPDFPage(
            pageNumber
        ) {

            if (!currentPDF) {

                return;

            }


            if (rendering) {

                pendingPage =
                    pageNumber;


                return;

            }


            rendering =
                true;


            try {

                const page =
                    await currentPDF.getPage(
                        pageNumber
                    );


                const viewer =
                    document.querySelector(
                        ".pdf-viewer"
                    );


                const availableWidth =
                    viewer.clientWidth;


                const baseViewport =
                    page.getViewport({
                        scale: 1
                    });


                const scale =
                    (
                        availableWidth /
                        baseViewport.width
                    ) *
                    zoomLevel;


                const viewport =
                    page.getViewport({
                        scale
                    });


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


                await page.render({

                    canvasContext:
                        canvasContext,

                    viewport:
                        viewport

                }).promise;


                currentPDFPage =
                    pageNumber;


                pdfPageNumber.textContent =
                    `${currentPDFPage} / ${currentPDF.numPages}`;


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


            rendering =
                false;


            if (
                pendingPage !== null
            ) {

                const nextPage =
                    pendingPage;


                pendingPage =
                    null;


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


                currentPDFPage =
                    1;


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


                currentPDF =
                    null;


                contentEl.innerHTML = `

                    <div class="pdf-error">

                        <p>
                            Sorry, this content
                            could not be loaded.
                        </p>

                    </div>

                `;

            }

        }


        /* =================================================
           LOAD NOVEL CHAPTER
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


            titleEl.textContent =
                chapter.title;


            zoomLevel =
                1;


            updateZoomDisplay();


            updateInteractionContent(
                currentChapter
            );


            initializeInteractions();


            await loadPDF(
                chapter.pdf
            );


            if (audioEl) {

                audioEl.src =
                    chapter.audio;


                audioEl.load();


            }


            localStorage.setItem(
                storageKey,
                currentChapter
            );


            if (prevChapterBtn) {

                prevChapterBtn.disabled =
                    currentChapter === 0;

            }


            if (nextChapterBtn) {

                nextChapterBtn.disabled =
                    currentChapter ===
                    chapters.length - 1;

            }


            window.scrollTo({

                top: 0,

                behavior: "smooth"

            });

        }


        /* =================================================
           LOAD BLOG / DISCUSSION
        ================================================= */

        async function loadSingleContent() {

            titleEl.textContent =
                story.title;


            updateZoomDisplay();


            updateInteractionContent();


            initializeInteractions();


            await loadPDF(
                story.pdf
            );


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

                zoomLevel =
                    Math.max(
                        minZoom,
                        zoomLevel -
                        zoomStep
                    );


                updateZoomDisplay();


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

                zoomLevel =
                    Math.min(
                        maxZoom,
                        zoomLevel +
                        zoomStep
                    );


                updateZoomDisplay();


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

                zoomLevel =
                    1;


                updateZoomDisplay();


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
           START READER
        ================================================= */

        loadInteractions()
            .then(
                () => {

                    if (
                        contentType === "novel"
                    ) {

                        loadChapter(
                            currentChapter
                        );

                    } else {

                        loadSingleContent();

                    }

                }
            );

    }
);
