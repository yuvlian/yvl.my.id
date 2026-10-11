const TYPE_DELAY = 180;
const DELETE_DELAY = 35;
const WORD_PAUSE = 1800;
const DELETE_PAUSE = 500;

// shitcode <3
const titleFrames = [
    ["cg==", TYPE_DELAY],
    ["cmE=", TYPE_DELAY],
    ["cmFp", TYPE_DELAY],
    ["cmFpbg==", WORD_PAUSE],

    ["cmFp", DELETE_DELAY],
    ["cmE=", DELETE_DELAY],
    ["cg==", DELETE_PAUSE],

    ["RQ==", TYPE_DELAY],
    ["RUw=", TYPE_DELAY],
    ["RUxM", TYPE_DELAY],
    ["RUxMSQ==", TYPE_DELAY],
    ["RUxMSVM=", WORD_PAUSE],

    ["RUxMSQ==", DELETE_DELAY],
    ["RUxM", DELETE_DELAY],
    ["RUw=", DELETE_DELAY],
    ["RQ==", DELETE_PAUSE],

    ["Ug==", TYPE_DELAY],
    ["UkE=", TYPE_DELAY],
    ["UkFJ", TYPE_DELAY],
    ["UkFJTg==", WORD_PAUSE],

    ["UkFJ", DELETE_DELAY],
    ["UkE=", DELETE_DELAY],
    ["Ug==", DELETE_PAUSE],

    ["ZQ==", TYPE_DELAY],
    ["ZWw=", TYPE_DELAY],
    ["ZWxs", TYPE_DELAY],
    ["ZWxsaQ==", TYPE_DELAY],
    ["ZWxsaXM=", WORD_PAUSE],

    ["ZWxsaQ==", DELETE_DELAY],
    ["ZWxs", DELETE_DELAY],
    ["ZWw=", DELETE_DELAY],
    ["ZQ==", DELETE_PAUSE],
];

async function animateTitle() {
    while (true) {
        for (const [k, delay] of titleFrames) {
            document.title = k;
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
}

animateTitle();
