/* =====================================================
   DIGICAFE READER
   -----------------------------------------------------
   Reader is now a ROOM inside index.html.

   It does NOT:
   - load navbar
   - load footer
   - load Beshy
   - create the global music player
   - redirect to reader.html

   It DOES:
   - load novels
   - load blog/discussion content
   - render PDF files
   - play chapter audio
   - save reading progress
   - handle chapters
   - handle PDF zoom
   - handle PDF page navigation
   - load DigiCafe interactions
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
   GLOBAL READER INITIALIZER
===================================================== */

window.initReader = async function (
    suppliedStoryKey = null,
    suppliedChapter = null
) {

    console.log("📖 DigiCafe Reader initializing");


    /* =====================================================
       GET STORY / CHAPTER
    ===================================================== */

    const urlParams =
        new URLSearchParams(
            window.location.search
        );


    const storyKey =
        suppliedStoryKey ||
        urlParams.get("story");


    let chapterParam =
        suppliedChapter;


    if (
        chapterParam === null ||
        chapterParam === undefined
    ) {

        const urlChapter =
            parseInt(
                urlParams.get("chapter")
            );


        chapterParam =
            Number.isInteger(
                urlChapter
            )
                ? urlChapter
                : null;

    }


    console.log(
        "📚 Reader story:",
        storyKey
    );


    console.log(
        "📖 Reader chapter:",
        chapterParam
    );


    /* =====================================================
       GET STORY
    ===================================================== */

    const story =
        window.STORIES?.[storyKey];


    /* =====================================================
       ELEMENTS
    ===================================================== */

    const titleEl =
        document.getElementById(
            "chapterTitle"
        );


    const chapterSelector =
        document.getElementById(
            "chapterSelector"
        );


    const chapterSelect =
        document.getElementById(
            "chapterSelect"
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


    /* =====================================================
       CONTENT NOT FOUND
    ===================================================== */

    if (!story) {

        console.error(
            "❌ Reader content not found:",
            storyKey
        );


        if (titleEl) {

            titleEl.textContent =
                "Content not found";

        }


        if (chapterSelector) {

            chapterSelector.style.display =
                "none";

        }


        if (contentEl) {

            contentEl.innerHTML = `

                <div class="page-error">

                    <h2>
                        📚 Content not found
                    </h2>

                    <p>
                        DigiCafe couldn't find this story.
                    </p>

                </div>

            `;

        }


        return;

    }


    /* =====================================================
       CONTENT TYPE
    ===================================================== */

    const contentType =
        story.type || "novel";


    console.log(
        "📚 Content type:",
        contentType
    );


    /* =====================================================
       CONTENT TYPE UI
    ===================================================== */

    if (
        contentType === "blog" ||
        contentType === "discussion"
    ) {

        if (chapterSelector) {

            chapterSelector.style.display =
                "none";

        }


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


    /* =====================================================
       NOVEL UI
    ===================================================== */

    if (
        contentType === "novel"
    ) {

        if (chapterSelector) {

            chapterSelector.style.display =
                "block";

        }

    }


    /* =====================================================
       LOAD DIGICAFE INTERACTIONS
    ===================================================== */

    async function loadInteractions() {

        if (!interactionContainer) {

            console.warn(
                "⚠️ Interaction container not found."
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


            interactionContainer.innerHTML =
                await response.text();


            console.log(
                "☕ DigiCafe interaction loaded."
            );


        } catch (error) {

            console.error(
                "❌ Interaction loading error:",
                error
            );

        }

    }


    /* =====================================================
       CREATE PDF VIEWER
    ===================================================== */

    if (!contentEl) {

        console.error(
            "❌ #chapterContent was not found."
        );

        return;

    }


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
                        type="button"
                        aria-label="Previous PDF page">
                        ‹
                    </button>


                    <span id="pdfPageNumber">
                        1 / 1
                    </span>


                    <button
                        id="nextPdfPage"
                        type="button"
                        aria-label="Next PDF page">
                        ›
                    </button>

                </div>


                <div class="pdf-zoom-controls">

                    <button
                        id="zoomOut"
                        type="button"
                        aria-label="Zoom out">
                        −
                    </button>


                    <button
                        id="zoomReset"
                        type="button"
                        aria-label="Reset zoom">
                        100%
                    </button>


                    <button
                        id="zoomIn"
                        type="button"
                        aria-label="Zoom in">
                        +
                    </button>

                </div>

            </div>

        </div>

    `;


    /* =====================================================
       PDF ELEMENTS
    ===================================================== */

    const canvas =
        document.getElementById(
            "pdfCanvas"
        );


    const canvasContext =
        canvas?.getContext("2d");


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


    if (
        !canvas ||
        !canvasContext
    ) {

        console.error(
            "❌ PDF canvas could not be created."
        );

        return;

    }


    /* =====================================================
       CHAPTER DATA
    ===================================================== */

    let chapters = [];


    if (
        contentType === "novel"
    ) {

        chapters =
            Array.from(
                {
                    length:
                        Number(
                            story.chapters
                        ) || 0
                },
                (_, index) => {

                    const number =
                        index + 1;


                    return {

                        number,

                        title:
                            `${story.title}: Chapter ${number}`,

                        pdf:
                            `./Asset/NovelFiles/${storyKey}/${storyKey}_pdf/ch${number}.pdf`,

                        audio:
                            `./Asset/NovelFiles/${storyKey}/${storyKey}_mp3/ch${number}.mp3`

                    };

                }
            );

    }


    /* =====================================================
       READING PROGRESS
    ===================================================== */

    const storageKey =
        "progress_" +
        storyKey;


    let currentChapter = 0;


    if (
        contentType === "novel"
    ) {

        if (
            Number.isInteger(
                chapterParam
            ) &&
            chapterParam >= 1 &&
            chapterParam <= chapters.length
        ) {

            currentChapter =
                chapterParam - 1;

        } else {

            const savedProgress =
                parseInt(
                    localStorage.getItem(
                        storageKey
                    )
                );


            if (
                Number.isInteger(
                    savedProgress
                ) &&
                savedProgress >= 0 &&
                savedProgress < chapters.length
            ) {

                currentChapter =
                    savedProgress;

            }

        }

    }


    /* =====================================================
       CHAPTER DROPDOWN
    ===================================================== */

    if (
        contentType === "novel" &&
        chapterSelect
    ) {

        chapterSelect.innerHTML =
            "";


        chapters.forEach(
            chapter => {

                const option =
                    document.createElement(
                        "option"
                    );


                option.value =
                    chapter.number;


                option.textContent =
                    `Chapter ${chapter.number}`;


                chapterSelect.appendChild(
                    option
                );

            }
        );


        chapterSelect.value =
            String(
                currentChapter + 1
            );


        chapterSelect.addEventListener(
            "change",
            () => {

                const selectedChapter =
                    parseInt(
                        chapterSelect.value
                    );


                if (
                    !Number.isInteger(
                        selectedChapter
                    )
                ) {

                    return;

                }


                if (
                    selectedChapter < 1 ||
                    selectedChapter > chapters.length
                ) {

                    return;

                }


                openChapter(
                    selectedChapter - 1
                );

            }
        );

    }


    /* =====================================================
       PDF STATE
    ===================================================== */

    let currentPDF =
        null;


    let currentPDFPage =
        1;


    let rendering =
        false;


    let pendingPage =
        null;


    /* =====================================================
       PDF ZOOM
    ===================================================== */

    let zoomLevel =
        1;


    const zoomStep =
        0.15;


    const minZoom =
        0.7;


    const maxZoom =
        3;


    function updateZoomDisplay() {

        if (!zoomReset) {

            return;

        }


        zoomReset.textContent =
            `${Math.round(
                zoomLevel * 100
            )}%`;

    }


    /* =====================================================
       UPDATE INTERACTION CONTENT
    ===================================================== */

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

            return;

        }


        let contentId =
            storyKey;


        if (
            contentType === "novel"
        ) {

            contentId =
                `${storyKey}-chapter-${chapterIndex + 1}`;

        }


        interaction.dataset.contentId =
            contentId;


        interaction.dataset.contentType =
            contentType;


        console.log(
            "💬 Interaction content:",
            contentId
        );

    }


    /* =====================================================
       RENDER PDF PAGE
    ===================================================== */

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


            if (!viewer) {

                return;

            }


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

                canvasContext,

                viewport

            }).promise;


            currentPDFPage =
                pageNumber;


            if (pdfPageNumber) {

                pdfPageNumber.textContent =
                    `${currentPDFPage} / ${currentPDF.numPages}`;

            }


            if (prevPdfPage) {

                prevPdfPage.disabled =
                    currentPDFPage <= 1;

            }


            if (nextPdfPage) {

                nextPdfPage.disabled =
                    currentPDFPage >=
                    currentPDF.numPages;

            }

        } catch (error) {

            console.error(
                "❌ PDF page rendering error:",
                error
            );

        } finally {

            rendering =
                false;

        }


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


    /* =====================================================
       LOAD PDF
    ===================================================== */

    async function loadPDF(
        pdfPath
    ) {

        try {

            console.log(
                "📄 Loading PDF:",
                pdfPath
            );


            currentPDF =
                await getDocument({
                    url: pdfPath
                }).promise;


            console.log(
                `📄 PDF loaded: ${currentPDF.numPages} page(s)`
            );


            currentPDFPage =
                1;


            if (pdfPageNumber) {

                pdfPageNumber.textContent =
                    `1 / ${currentPDF.numPages}`;

            }


            await renderPDFPage(
                1
            );

        } catch (error) {

            console.error(
                "❌ PDF loading error:",
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


    /* =====================================================
       UPDATE READER URL
       -----------------------------------------------------
       IMPORTANT:

       We now stay inside index.html.
    ===================================================== */

    function updateReaderURL(
        chapterNumber
    ) {

        const params =
            new URLSearchParams();


        params.set(
            "page",
            "reader"
        );


        params.set(
            "story",
            storyKey
        );


        if (
            contentType === "novel"
        ) {

            params.set(
                "chapter",
                String(
                    chapterNumber
                )
            );

        }


        const newUrl =
            `index.html?${params.toString()}`;


        window.history.replaceState(
            {
                page: "reader",

                story: storyKey,

                chapter:
                    chapterNumber
            },
            "",
            newUrl
        );

    }


    /* =====================================================
       OPEN CHAPTER
    ===================================================== */

    async function openChapter(
        chapterIndex,
        updateURL = true
    ) {

        if (
            contentType !== "novel"
        ) {

            return;

        }


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
           CHAPTER SELECTOR
        --------------------------------------------- */

        if (chapterSelect) {

            chapterSelect.value =
                String(
                    currentChapter + 1
                );

        }


        /* ---------------------------------------------
           TITLE
        --------------------------------------------- */

        if (titleEl) {

            titleEl.textContent =
                chapter.title;

        }


        /* ---------------------------------------------
           RESET ZOOM
        --------------------------------------------- */

        zoomLevel =
            1;


        updateZoomDisplay();


        /* ---------------------------------------------
           INTERACTION
        --------------------------------------------- */

        updateInteractionContent(
            currentChapter
        );


        initializeInteractions();


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
                "🎧 Loading chapter audio:",
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
            String(
                currentChapter
            )
        );


        /* ---------------------------------------------
           BUTTON STATES
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
           URL
        --------------------------------------------- */

        if (updateURL) {

            updateReaderURL(
                currentChapter + 1
            );

        }


        /* ---------------------------------------------
           SCROLL
        --------------------------------------------- */

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

    }


    /* =====================================================
       LOAD BLOG / DISCUSSION
    ===================================================== */

    async function loadSingleContent() {

        if (titleEl) {

            titleEl.textContent =
                story.title;

        }


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


    /* =====================================================
       PDF PREVIOUS PAGE
    ===================================================== */

    prevPdfPage?.addEventListener(
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


    /* =====================================================
       PDF NEXT PAGE
    ===================================================== */

    nextPdfPage?.addEventListener(
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


    /* =====================================================
       ZOOM OUT
    ===================================================== */

    zoomOut?.addEventListener(
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


    /* =====================================================
       ZOOM IN
    ===================================================== */

    zoomIn?.addEventListener(
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


    /* =====================================================
       ZOOM RESET
    ===================================================== */

    zoomReset?.addEventListener(
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


    /* =====================================================
       PREVIOUS CHAPTER
    ===================================================== */

    prevChapterBtn?.addEventListener(
        "click",
        () => {

            if (
                currentChapter > 0
            ) {

                openChapter(
                    currentChapter - 1
                );

            }

        }
    );


    /* =====================================================
       NEXT CHAPTER
    ===================================================== */

    nextChapterBtn?.addEventListener(
        "click",
        () => {

            if (
                contentType === "novel" &&
                currentChapter <
                chapters.length - 1
            ) {

                openChapter(
                    currentChapter + 1
                );

            }

        }
    );


    /* =====================================================
       INITIALIZE
    ===================================================== */

    await loadInteractions();


    if (
        contentType === "novel"
    ) {

        await openChapter(
            currentChapter,
            false
        );


        updateReaderURL(
            currentChapter + 1
        );

    } else {

        await loadSingleContent();

    }


    console.log(
        "☕ DigiCafe Reader ready."
    );

};
