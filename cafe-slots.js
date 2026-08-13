/* =========================================================
   DIGICAFE CAFÉ SLOTS
   ---------------------------------------------------------
   Fictional Café Points only.

   FEATURES
   ---------------------------------------------------------
   • 3 reels
   • DigiCafe symbols
   • Bet controls
   • Animated spinning
   • Automatic spin
   • 60% configured win chance
   • Multiple payouts
   • Jackpot
   • Balance persistence
   • 3 balance reloads
   • Best balance
   • Spin counter
   • Biggest win
   • Total won
   • Total lost
   • Reset
   • Mobile compatible
   • Room compatible
   • Future leaderboard ready
========================================================= */


/* =========================================================
   01. GAME CONFIGURATION
========================================================= */

const cafeSlotsConfig = {

    startingBalance: 1000,

    minimumBet: 10,

    maximumBet: 500,

    betStep: 10,

    spinDuration: 900,

    reelDelay: 180,


    winChance: 0.30,

    /*
        Maximum number of free
        balance reloads.
    */

    maximumReloads: 3,

    /*
        Each reload restores
        this amount of points.
    */

    reloadAmount: 10000,

    storageKey:
        "digicafe_cafe_slots"

};


/* =========================================================
   02. SYMBOLS
========================================================= */

const cafeSlotSymbols = [

    {
        symbol: "☕",
        name: "Coffee",
        multiplier: 25,
        weight: 5
    },

    {
        symbol: "💎",
        name: "Diamond",
        multiplier: 15,
        weight: 8
    },

    {
        symbol: "⭐",
        name: "Star",
        multiplier: 12,
        weight: 10
    },

    {
        symbol: "🌙",
        name: "Moon",
        multiplier: 10,
        weight: 12
    },

    {
        symbol: "🍰",
        name: "Cake",
        multiplier: 8,
        weight: 16
    },

    {
        symbol: "🧁",
        name: "Cupcake",
        multiplier: 6,
        weight: 19
    },

    {
        symbol: "🍪",
        name: "Cookie",
        multiplier: 5,
        weight: 30
    }

];


/* =========================================================
   03. GAME STATE
========================================================= */

const cafeSlots = {

    balance:
        cafeSlotsConfig.startingBalance,

    bestBalance:
        cafeSlotsConfig.startingBalance,

    bet:
        100,

    spins:
        0,

    biggestWin:
        0,

    totalWon:
        0,

    totalLost:
        0,

    reloadsUsed:
        0,

    spinning:
        false,

    autoSpin:
        false,

    initialized:
        false,

    reels: [

        cafeSlotSymbols[0],

        cafeSlotSymbols[4],

        cafeSlotSymbols[2]

    ]

};


/* =========================================================
   04. ELEMENTS
========================================================= */

let cafeSlotsElements = {};


/* =========================================================
   05. LOAD SAVED GAME
========================================================= */

function loadCafeSlotsState() {

    try {

        const saved =
            localStorage.getItem(
                cafeSlotsConfig.storageKey
            );


        if (!saved) {

            return;

        }


        const parsed =
            JSON.parse(saved);


        if (
            !parsed ||
            typeof parsed !== "object"
        ) {

            return;

        }


        if (
            Number.isFinite(
                parsed.balance
            )
        ) {

            cafeSlots.balance =
                Math.max(
                    0,
                    parsed.balance
                );

        }


        if (
            Number.isFinite(
                parsed.bestBalance
            )
        ) {

            cafeSlots.bestBalance =
                Math.max(
                    cafeSlots.balance,
                    parsed.bestBalance
                );

        }


        if (
            Number.isFinite(
                parsed.bet
            )
        ) {

            cafeSlots.bet =
                clampCafeSlotsBet(
                    parsed.bet
                );

        }


        if (
            Number.isFinite(
                parsed.spins
            )
        ) {

            cafeSlots.spins =
                Math.max(
                    0,
                    parsed.spins
                );

        }


        if (
            Number.isFinite(
                parsed.biggestWin
            )
        ) {

            cafeSlots.biggestWin =
                Math.max(
                    0,
                    parsed.biggestWin
                );

        }


        if (
            Number.isFinite(
                parsed.totalWon
            )
        ) {

            cafeSlots.totalWon =
                Math.max(
                    0,
                    parsed.totalWon
                );

        }


        if (
            Number.isFinite(
                parsed.totalLost
            )
        ) {

            cafeSlots.totalLost =
                Math.max(
                    0,
                    parsed.totalLost
                );

        }


        if (
            Number.isFinite(
                parsed.reloadsUsed
            )
        ) {

            cafeSlots.reloadsUsed =
                Math.min(
                    cafeSlotsConfig.maximumReloads,
                    Math.max(
                        0,
                        parsed.reloadsUsed
                    )
                );

        }

    }

    catch (error) {

        console.warn(
            "☕ Café Slots could not load saved state.",
            error
        );

    }

}


/* =========================================================
   06. SAVE GAME
========================================================= */

function saveCafeSlotsState() {

    try {

        localStorage.setItem(

            cafeSlotsConfig.storageKey,

            JSON.stringify({

                balance:
                    cafeSlots.balance,

                bestBalance:
                    cafeSlots.bestBalance,

                bet:
                    cafeSlots.bet,

                spins:
                    cafeSlots.spins,

                biggestWin:
                    cafeSlots.biggestWin,

                totalWon:
                    cafeSlots.totalWon,

                totalLost:
                    cafeSlots.totalLost,

                reloadsUsed:
                    cafeSlots.reloadsUsed

            })

        );

    }

    catch (error) {

        console.warn(
            "☕ Café Slots could not save state.",
            error
        );

    }

}


/* =========================================================
   07. CLAMP BET
========================================================= */

function clampCafeSlotsBet(
    bet
) {

    return Math.min(

        cafeSlotsConfig.maximumBet,

        Math.max(

            cafeSlotsConfig.minimumBet,

            Math.round(
                bet /
                cafeSlotsConfig.betStep
            ) *
            cafeSlotsConfig.betStep

        )

    );

}


/* =========================================================
   08. FORMAT NUMBER
========================================================= */

function formatCafeSlotsNumber(
    value
) {

    return Number(
        value || 0
    ).toLocaleString(
        "en-US"
    );

}


/* =========================================================
   09. RANDOM SYMBOL
========================================================= */

function randomCafeSlotSymbol() {

    const totalWeight =
        cafeSlotSymbols.reduce(

            (
                total,
                item
            ) =>
                total +
                item.weight,

            0

        );


    let random =
        Math.random() *
        totalWeight;


    for (
        const item of cafeSlotSymbols
    ) {

        random -=
            item.weight;


        if (
            random <= 0
        ) {

            return item;

        }

    }


    return cafeSlotSymbols[
        cafeSlotSymbols.length - 1
    ];

}


/* =========================================================
   10. UPDATE UI
========================================================= */

function updateCafeSlotsUI() {

    if (
        !cafeSlotsElements.balance
    ) {

        return;

    }


    cafeSlotsElements.balance.textContent =
        formatCafeSlotsNumber(
            cafeSlots.balance
        );


    cafeSlotsElements.best.textContent =
        formatCafeSlotsNumber(
            cafeSlots.bestBalance
        );


    cafeSlotsElements.bet.textContent =
        formatCafeSlotsNumber(
            cafeSlots.bet
        );


    cafeSlotsElements.spins.textContent =
        formatCafeSlotsNumber(
            cafeSlots.spins
        );


    cafeSlotsElements.biggestWin.textContent =
        formatCafeSlotsNumber(
            cafeSlots.biggestWin
        );


    cafeSlotsElements.totalWon.textContent =
        formatCafeSlotsNumber(
            cafeSlots.totalWon
        );


    cafeSlotsElements.totalLost.textContent =
        formatCafeSlotsNumber(
            cafeSlots.totalLost
        );


    /*
        Reload UI
    */

    if (
        cafeSlotsElements.reload
    ) {

        const reloadsLeft =
            cafeSlotsConfig.maximumReloads -
            cafeSlots.reloadsUsed;


        cafeSlotsElements.reload.textContent =
            reloadsLeft > 0
                ? `Reload ☕ (${reloadsLeft})`
                : "No Reloads Left";


        cafeSlotsElements.reload.disabled =
            cafeSlots.spinning ||
            reloadsLeft <= 0 ||
            cafeSlots.balance > 0;

    }


    /*
        Auto-spin button
    */

  if (
    cafeSlotsElements.autoSpin
) {

    cafeSlotsElements.autoSpin.innerHTML =
        cafeSlots.autoSpin
            ? "<span>⏹</span><span>STOP</span>"
            : "<span>↻</span><span>AUTO</span>";


    cafeSlotsElements.autoSpin.classList.toggle(
        "active",
        cafeSlots.autoSpin
    );


    cafeSlotsElements.autoSpin.setAttribute(
        "aria-pressed",
        String(
            cafeSlots.autoSpin
        )
    );

}


    /*
        Bet buttons
    */

    if (
        cafeSlotsElements.betDown
    ) {

        cafeSlotsElements.betDown.disabled =
            cafeSlots.spinning ||
            cafeSlots.bet <=
            cafeSlotsConfig.minimumBet;

    }


    if (
        cafeSlotsElements.betUp
    ) {

        cafeSlotsElements.betUp.disabled =
            cafeSlots.spinning ||
            cafeSlots.bet >=
            cafeSlotsConfig.maximumBet;

    }


    /*
        Spin button
    */

    if (
        cafeSlotsElements.spin
    ) {

        cafeSlotsElements.spin.disabled =
            cafeSlots.spinning ||
            cafeSlots.balance <
            cafeSlots.bet;

    }

}


/* =========================================================
   11. RESULT MESSAGE
========================================================= */

function setCafeSlotsResult(
    message,
    type = ""
) {

    const result =
        cafeSlotsElements.result;


    if (!result) {

        return;

    }


    result.textContent =
        message;


    result.className =
        "slots-result";


    if (type) {

        result.classList.add(
            type
        );

    }

}


/* =========================================================
   12. UPDATE REEL
========================================================= */

function updateCafeSlotReel(
    reelIndex,
    symbol
) {

    const reel =
        cafeSlotsElements.reels[
            reelIndex
        ];


    if (!reel) {

        return;

    }


    const symbolElement =
        reel.querySelector(
            ".slot-symbol"
        );


    if (!symbolElement) {

        return;

    }


    symbolElement.textContent =
        symbol.symbol;

}


/* =========================================================
   13. CLEAR WINNERS
========================================================= */

function clearCafeSlotWinners() {

    cafeSlotsElements.reels.forEach(
        reel => {

            if (!reel) {

                return;

            }


            reel.classList.remove(
                "winner"
            );

        }
    );


    if (
        cafeSlotsElements.machine
    ) {

        cafeSlotsElements.machine.classList.remove(
            "jackpot"
        );

    }

}


/* =========================================================
   14. HIGHLIGHT WIN
========================================================= */

function highlightCafeSlotWin() {

    cafeSlotsElements.reels.forEach(
        reel => {

            if (reel) {

                reel.classList.add(
                    "winner"
                );

            }

        }
    );

}


/* =========================================================
   15. CHANGE BET
========================================================= */

function changeCafeSlotsBet(
    direction
) {

    if (
        cafeSlots.spinning
    ) {

        return;

    }


    const nextBet =
        cafeSlots.bet +
        (
            direction *
            cafeSlotsConfig.betStep
        );


    cafeSlots.bet =
        clampCafeSlotsBet(
            nextBet
        );


    updateCafeSlotsUI();

    saveCafeSlotsState();

}


/* =========================================================
   16. GENERATE WINNING RESULT
========================================================= */

function generateCafeSlotsWin() {

    /*
        Pick one symbol and make
        all three reels match.
    */

    const winningSymbol =
        randomCafeSlotSymbol();


    return [

        winningSymbol,

        winningSymbol,

        winningSymbol

    ];

}


/* =========================================================
   17. GENERATE LOSING RESULT
========================================================= */

function generateCafeSlotsLoss() {

    let results;

    do {

        results = [

            randomCafeSlotSymbol(),

            randomCafeSlotSymbol(),

            randomCafeSlotSymbol()

        ];

    }

    /*
        A losing result must contain
        NO pair and NO triple.
    */

    while (

        results[0].symbol === results[1].symbol ||

        results[0].symbol === results[2].symbol ||

        results[1].symbol === results[2].symbol

    );


    return results;

}


/* =========================================================
   18. GENERATE RESULT
========================================================= */

function generateCafeSlotsResult() {

    /*
        TRUE 30% OVERALL WIN CHANCE.

        30% = winning result
        70% = complete loss

        Winning results can be:
        • Triple match
        • Pair match
    */

    const shouldWin =
        Math.random() <
        cafeSlotsConfig.winChance;


    if (!shouldWin) {

        return generateCafeSlotsLoss();

    }


    /*
        For a winning spin:

        70% of winning spins
        = triple

        30% of winning spins
        = pair

        This keeps the big wins rarer.
    */

    if (
        Math.random() < 0.70
    ) {

        return generateCafeSlotsWin();

    }


    /*
        Generate a pair.
    */

    const winningSymbol =
        randomCafeSlotSymbol();


    let otherSymbol;

    do {

        otherSymbol =
            randomCafeSlotSymbol();

    }

    while (
        otherSymbol.symbol ===
        winningSymbol.symbol
    );


    const pairPosition =
        Math.floor(
            Math.random() * 3
        );


    const results = [
        otherSymbol,
        otherSymbol,
        otherSymbol
    ];


    results[pairPosition] =
        winningSymbol;


    return results;

}

/* =========================================================
   19. SPIN REEL
========================================================= */

function spinCafeSlotReel(
    reelIndex,
    finalSymbol,
    duration
) {

    return new Promise(
        resolve => {

            const reel =
                cafeSlotsElements.reels[
                    reelIndex
                ];


            if (!reel) {

                resolve();

                return;

            }


            reel.classList.add(
                "spinning"
            );


            const symbolElement =
                reel.querySelector(
                    ".slot-symbol"
                );


            const interval =
                setInterval(
                    () => {

                        if (
                            symbolElement
                        ) {

                            symbolElement.textContent =
                                randomCafeSlotSymbol().symbol;

                        }

                    },
                    85
                );


            setTimeout(
                () => {

                    clearInterval(
                        interval
                    );


                    reel.classList.remove(
                        "spinning"
                    );


                    updateCafeSlotReel(
                        reelIndex,
                        finalSymbol
                    );


                    resolve();

                },
                duration
            );

        }
    );

}


/* =========================================================
   20. CALCULATE PAYOUT
========================================================= */

function calculateCafeSlotsPayout(
    results
) {

    if (
        !results ||
        results.length !== 3
    ) {

        return {

            payout: 0,

            symbol: null

        };

    }


    const first =
        results[0];


    /*
        Three matching symbols.
    */

    const allMatch =
        results.every(
            item =>
                item.symbol ===
                first.symbol
        );


    if (
        allMatch
    ) {

        return {

            payout:
                cafeSlots.bet *
                first.multiplier,

            symbol:
                first,

            type:
                "triple"

        };

    }


    /*
        Two matching symbols.
    */

    const counts = {};


    results.forEach(
        item => {

            counts[item.symbol] =
                (
                    counts[item.symbol] ||
                    0
                ) + 1;

        }
    );


    const pair =
        Object.keys(
            counts
        ).find(
            key =>
                counts[key] >= 2
        );


    if (
        pair
    ) {

        const matchingSymbol =
            cafeSlotSymbols.find(
                item =>
                    item.symbol ===
                    pair
            );


        return {

            payout:
                Math.floor(

                    cafeSlots.bet *

                    Math.max(
                        1,
                        matchingSymbol.multiplier / 5
                    )

                ),

            symbol:
                matchingSymbol,

            type:
                "pair"

        };

    }


    return {

        payout: 0,

        symbol: null,

        type: "loss"

    };

}


/* =========================================================
   21. RELOAD BALANCE
========================================================= */

function reloadCafeSlotsBalance(
    automatic = false
) {

    if (
        cafeSlots.spinning
    ) {

        return false;

    }


    /*
        Can only reload when broke.
    */

    if (
        cafeSlots.balance > 0
    ) {

        return false;

    }


    if (
        cafeSlots.reloadsUsed >=
        cafeSlotsConfig.maximumReloads
    ) {

        setCafeSlotsResult(
            "☕ No reloads left. Your café wallet is officially empty.",
            "lose"
        );

        cafeSlots.autoSpin =
            false;


        updateCafeSlotsUI();

        return false;

    }


    cafeSlots.reloadsUsed++;


    cafeSlots.balance =
        cafeSlotsConfig.reloadAmount;


    cafeSlots.bestBalance =
        Math.max(
            cafeSlots.bestBalance,
            cafeSlots.balance
        );


    saveCafeSlotsState();

    updateCafeSlotsUI();


    const reloadsLeft =
        cafeSlotsConfig.maximumReloads -
        cafeSlots.reloadsUsed;


    if (
        automatic
    ) {

        setCafeSlotsResult(
            `☕ Auto Reload! +${formatCafeSlotsNumber(cafeSlotsConfig.reloadAmount)} points. ${reloadsLeft} reload${reloadsLeft === 1 ? "" : "s"} left.`,
            "win"
        );

    }

    else {

        setCafeSlotsResult(
            `☕ Reloaded +${formatCafeSlotsNumber(cafeSlotsConfig.reloadAmount)} Café Points!`,
            "win"
        );

    }


    return true;

}


/* =========================================================
   22. SPIN
========================================================= */

async function spinCafeSlots(
    automatic = false
) {

    if (
        cafeSlots.spinning
    ) {

        return;

    }


    /*
        If there isn't enough balance,
        try a reload.
    */

    if (
        cafeSlots.balance <
        cafeSlots.bet
    ) {

        if (
            cafeSlots.balance === 0 &&
            cafeSlots.reloadsUsed <
            cafeSlotsConfig.maximumReloads
        ) {

            const reloaded =
                reloadCafeSlotsBalance(
                    automatic
                );


            if (
                !reloaded
            ) {

                return;

            }

        }

        else {

            setCafeSlotsResult(
                "☕ Not enough Café Points.",
                "lose"
            );

            cafeSlots.autoSpin =
                false;


            updateCafeSlotsUI();

            return;

        }

    }


    cafeSlots.spinning =
        true;


    clearCafeSlotWinners();


    setCafeSlotsResult(
        automatic
            ? "Auto spinning... ☕"
            : "Spinning... ☕"
    );


    /*
        Pay bet.
    */

    cafeSlots.balance -=
        cafeSlots.bet;


    cafeSlots.totalLost +=
        cafeSlots.bet;


    cafeSlots.spins++;


    updateCafeSlotsUI();


    /*
        Generate final result.

        This is where the 60%
        win probability is applied.
    */

    const results =
        generateCafeSlotsResult();


    /*
        Animate reels.
    */

    await Promise.all([

        spinCafeSlotReel(
            0,
            results[0],
            cafeSlotsConfig.spinDuration
        ),

        spinCafeSlotReel(
            1,
            results[1],
            cafeSlotsConfig.spinDuration +
            cafeSlotsConfig.reelDelay
        ),

        spinCafeSlotReel(
            2,
            results[2],
            cafeSlotsConfig.spinDuration +
            (
                cafeSlotsConfig.reelDelay *
                2
            )
        )

    ]);


    /*
        Calculate payout.
    */

    const result =
        calculateCafeSlotsPayout(
            results
        );


    const payout =
        result.payout;


    if (
        payout > 0
    ) {

        cafeSlots.balance +=
            payout;


        cafeSlots.totalWon +=
            payout;


        cafeSlots.totalLost =
            Math.max(
                0,
                cafeSlots.totalLost -
                Math.min(
                    payout,
                    cafeSlots.bet
                )
            );


        cafeSlots.biggestWin =
            Math.max(
                cafeSlots.biggestWin,
                payout
            );


        cafeSlots.bestBalance =
            Math.max(
                cafeSlots.bestBalance,
                cafeSlots.balance
            );


        highlightCafeSlotWin();


        /*
            Coffee = Jackpot
        */

        if (
            result.symbol &&
            result.symbol.symbol ===
            "☕" &&
            result.type ===
            "triple"
        ) {

            if (
                cafeSlotsElements.machine
            ) {

                cafeSlotsElements.machine.classList.add(
                    "jackpot"
                );

            }


            setCafeSlotsResult(

                `☕ CAFÉ JACKPOT! +${formatCafeSlotsNumber(payout)} points! ✨`,

                "jackpot"

            );

        }

        else if (
            result.type ===
            "pair"
        ) {

            setCafeSlotsResult(

                `✨ Pair! +${formatCafeSlotsNumber(payout)} Café Points!`,

                "win"

            );

        }

        else {

            setCafeSlotsResult(

                `✨ You won ${formatCafeSlotsNumber(payout)} Café Points!`,

                "win"

            );

        }

    }

    else {

        setCafeSlotsResult(

            automatic
                ? "No match... spinning again. 😂"
                : "No match this time... the coffee machine is judging you. 😂",

            "lose"

        );

    }


    cafeSlots.spinning =
        false;


    cafeSlots.bestBalance =
        Math.max(
            cafeSlots.bestBalance,
            cafeSlots.balance
        );


    saveCafeSlotsState();

    updateCafeSlotsUI();


    /*
        Future universal leaderboard.
    */

    if (
        typeof window.digiCafeGameScoreHook ===
        "function"
    ) {

        window.digiCafeGameScoreHook({

            gameId:
                "cafe-slots",

            balance:
                cafeSlots.balance,

            spins:
                cafeSlots.spins,

            biggestWin:
                cafeSlots.biggestWin,

            totalWon:
                cafeSlots.totalWon,

            reloadsUsed:
                cafeSlots.reloadsUsed

        });

    }


    /*
        Continue Auto Spin.
    */

    if (
        cafeSlots.autoSpin
    ) {

        /*
            If completely broke,
            automatically reload if possible.
        */

        if (
            cafeSlots.balance === 0
        ) {

            if (
                cafeSlots.reloadsUsed <
                cafeSlotsConfig.maximumReloads
            ) {

                await new Promise(
                    resolve =>
                        setTimeout(
                            resolve,
                            700
                        )
                );


                reloadCafeSlotsBalance(
                    true
                );

            }

            else {

                cafeSlots.autoSpin =
                    false;


                setCafeSlotsResult(
                    "☕ Auto Spin stopped — all 3 reloads have been used.",
                    "lose"
                );


                updateCafeSlotsUI();

                return;

            }

        }


        /*
            Small pause between spins.
        */

        if (
            cafeSlots.autoSpin
        ) {

            await new Promise(
                resolve =>
                    setTimeout(
                        resolve,
                        500
                    )
            );


            if (
                cafeSlots.autoSpin
            ) {

                spinCafeSlots(
                    true
                );

            }

        }

    }


    /*
        If manually broke,
        tell player to reload.
    */

    if (
        !cafeSlots.autoSpin &&
        cafeSlots.balance === 0
    ) {

        setCafeSlotsResult(

            cafeSlots.reloadsUsed <
            cafeSlotsConfig.maximumReloads

                ? "☕ You're out of points. Use Reload to refill the machine."

                : "☕ You're out of Café Points and all 3 reloads are gone.",

            "lose"

        );

    }

}


/* =========================================================
   23. TOGGLE AUTO SPIN
========================================================= */

function toggleCafeSlotsAutoSpin() {

    if (
        cafeSlots.spinning
    ) {

        return;

    }


    /*
        Stop.
    */

    if (
        cafeSlots.autoSpin
    ) {

        cafeSlots.autoSpin =
            false;


        setCafeSlotsResult(
            "⏹ Auto Spin stopped."
        );


        updateCafeSlotsUI();

        return;

    }


    /*
        Need enough money or
        an available reload.
    */

    if (
        cafeSlots.balance <
        cafeSlots.bet
    ) {

        if (
            cafeSlots.balance === 0 &&
            cafeSlots.reloadsUsed <
            cafeSlotsConfig.maximumReloads
        ) {

            reloadCafeSlotsBalance(
                true
            );

        }

        else {

            setCafeSlotsResult(
                "☕ Not enough Café Points to start Auto Spin.",
                "lose"
            );

            return;

        }

    }


    cafeSlots.autoSpin =
        true;


    updateCafeSlotsUI();


    setCafeSlotsResult(
        "▶ Auto Spin started... good luck, besh! ☕"
    );


    spinCafeSlots(
        true
    );

}


/* =========================================================
   24. RESET GAME
========================================================= */

function resetCafeSlots() {

    if (
        cafeSlots.spinning
    ) {

        return;

    }


    cafeSlots.autoSpin =
        false;


    cafeSlots.balance =
        cafeSlotsConfig.startingBalance;


    cafeSlots.bestBalance =
        cafeSlotsConfig.startingBalance;


    cafeSlots.bet =
        100;


    cafeSlots.spins =
        0;


    cafeSlots.biggestWin =
        0;


    cafeSlots.totalWon =
        0;


    cafeSlots.totalLost =
        0;


    cafeSlots.reloadsUsed =
        0;


    cafeSlots.reels = [

        cafeSlotSymbols[0],

        cafeSlotSymbols[4],

        cafeSlotSymbols[2]

    ];


    cafeSlots.reels.forEach(
        (
            symbol,
            index
        ) => {

            updateCafeSlotReel(
                index,
                symbol
            );

        }
    );


    clearCafeSlotWinners();


    setCafeSlotsResult(
        "Fresh coffee. Fresh luck. ☕"
    );


    updateCafeSlotsUI();

    saveCafeSlotsState();

}


/* =========================================================
   25. SETUP ELEMENTS
========================================================= */

function setupCafeSlotsElements() {

    cafeSlotsElements = {

        machine:
            document.getElementById(
                "cafeSlotMachine"
            ),

        balance:
            document.getElementById(
                "slotsBalance"
            ),

        best:
            document.getElementById(
                "slotsBest"
            ),

        bet:
            document.getElementById(
                "slotsBet"
            ),

        spins:
            document.getElementById(
                "slotsSpins"
            ),

        biggestWin:
            document.getElementById(
                "slotsBiggestWin"
            ),

        totalWon:
            document.getElementById(
                "slotsTotalWon"
            ),

        totalLost:
            document.getElementById(
                "slotsTotalLost"
            ),

        result:
            document.getElementById(
                "slotsResult"
            ),

        betDown:
            document.getElementById(
                "slotsBetDown"
            ),

        betUp:
            document.getElementById(
                "slotsBetUp"
            ),

        spin:
            document.getElementById(
                "slotsSpin"
            ),

        reset:
            document.getElementById(
                "slotsReset"
            ),

        /*
            These two are optional.

            They can be added to the HTML
            without breaking anything.
        */

        reload:
            document.getElementById(
                "slotsReload"
            ),

        autoSpin:
            document.getElementById(
                "slotsAutoSpin"
            ),

        reels:
            Array.from(
                document.querySelectorAll(
                    "#cafeSlots .slot-reel"
                )
            )

    };

}


/* =========================================================
   26. SETUP EVENTS
========================================================= */

function setupCafeSlotsEvents() {

    const {

        betDown,

        betUp,

        spin,

        reset,

        reload,

        autoSpin

    } = cafeSlotsElements;


    /*
        BET DOWN
    */

    if (
        betDown &&
        !betDown.dataset.bound
    ) {

        betDown.dataset.bound =
            "true";


        betDown.addEventListener(
            "click",
            () =>
                changeCafeSlotsBet(-1)
        );

    }


    /*
        BET UP
    */

    if (
        betUp &&
        !betUp.dataset.bound
    ) {

        betUp.dataset.bound =
            "true";


        betUp.addEventListener(
            "click",
            () =>
                changeCafeSlotsBet(1)
        );

    }


    /*
        SPIN
    */

    if (
        spin &&
        !spin.dataset.bound
    ) {

        spin.dataset.bound =
            "true";


        spin.addEventListener(
            "click",
            () =>
                spinCafeSlots(false)
        );

    }


    /*
        RESET
    */

    if (
        reset &&
        !reset.dataset.bound
    ) {

        reset.dataset.bound =
            "true";


        reset.addEventListener(
            "click",
            resetCafeSlots
        );

    }


    /*
        RELOAD
    */

    if (
        reload &&
        !reload.dataset.bound
    ) {

        reload.dataset.bound =
            "true";


        reload.addEventListener(
            "click",
            () =>
                reloadCafeSlotsBalance(false)
        );

    }


    /*
        AUTO SPIN
    */

    if (
        autoSpin &&
        !autoSpin.dataset.bound
    ) {

        autoSpin.dataset.bound =
            "true";


        autoSpin.addEventListener(
            "click",
            toggleCafeSlotsAutoSpin
        );

    }

}


/* =========================================================
   27. INITIALIZE
========================================================= */

function initCafeSlots() {

    const game =
        document.getElementById(
            "cafeSlots"
        );


    if (!game) {

        console.log(
            "☕ Café Slots waiting for Playroom..."
        );

        return false;

    }


    /*
        Prevent duplicate initialization.
    */

    if (
        cafeSlots.initialized
    ) {

        updateCafeSlotsUI();

        return true;

    }


    console.log(
        "☕🎰 Initializing DigiCafe Café Slots..."
    );


    setupCafeSlotsElements();


    loadCafeSlotsState();


    /*
        Make sure exactly three
        reels have starting symbols.
    */

    cafeSlots.reels =
        cafeSlots.reels.map(
            (
                symbol,
                index
            ) =>
                symbol ||
                cafeSlotSymbols[index]
        );


    cafeSlots.reels.forEach(
        (
            symbol,
            index
        ) => {

            updateCafeSlotReel(
                index,
                symbol
            );

        }
    );


    setupCafeSlotsEvents();


    updateCafeSlotsUI();


    cafeSlots.initialized =
        true;


    console.log(
        "☕🎰 Café Slots ready."
    );


    return true;

}


/* =========================================================
   28. ROOM RESET
========================================================= */

function resetCafeSlotsInitialization() {

    cafeSlots.initialized =
        false;

    cafeSlots.spinning =
        false;

    cafeSlots.autoSpin =
        false;

}


/* =========================================================
   29. GLOBAL ACCESS
========================================================= */

window.cafeSlots =
    cafeSlots;


window.initCafeSlots =
    initCafeSlots;


window.spinCafeSlots =
    spinCafeSlots;


window.toggleCafeSlotsAutoSpin =
    toggleCafeSlotsAutoSpin;


window.reloadCafeSlotsBalance =
    reloadCafeSlotsBalance;


window.resetCafeSlots =
    resetCafeSlots;


window.resetCafeSlotsInitialization =
    resetCafeSlotsInitialization;


console.log(
    "☕🎰 DigiCafe Café Slots engine loaded."
);
