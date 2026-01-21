const wait = (ms) => new Promise(r => setTimeout(r, ms));

const Sprites = {
    Idle: "yoshihide/idle.jpg",
    Sheathing: "yoshihide/sheathing.jpg",
    Sheathed: "yoshihide/sheathed.jpg",
    Thinking: "yoshihide/thinking.jpg",
    Shrugging: "yoshihide/shrugging.jpg",
    Explaining: "yoshihide/explaining.jpg",
    BuriedHand: "yoshihide/buriedhand.jpg",
    PointingSword: "yoshihide/pointingsword.jpg"
};

const Dialogues = {
    Welcome: "Yo. Welcome.",
    Me: "Me?",
    Dunno: "I dunno. I don't know myself that well.",
    LikeRust: "I like rust-lang and visual novels. Don't know how to explain myself beyond that.",
    YourFuneral: "Your funeral.",
    JustKidding: "Just kidding. It's just a portofolio website. I'm not that good at frontend so I thought I'd just make mine a visual novel, since I like those alot.",
    Projects: "Yeah. My CV is <a href='#' style='color: #8ab4f8; text-decoration: none;'>here</a> and list of projects that I'm proud of is <a href='#' style='color: #8ab4f8; text-decoration: none;'>here</a>. Of course, you can always browse my GitHub profile.",
    Contact: "If you stumble upon 'yuvlian' online—aside from LinkedIn—it's likely me. That's my username on <a href='https://github.com/yuvlian' target='_blank' style='color: #8ab4f8; text-decoration: none;'>GitHub</a> and <a href='https://discord.com/users/876725552474644490' target='_blank' style='color: #8ab4f8; text-decoration: none;'>Discord</a>. Or, feel free to drop me an <a href='mailto:yuvlian@naver.com' style='color: #8ab4f8; text-decoration: none;'>email</a>.",
    Prompt: "&lt;Ask Something&gt;",
    AskElse: "<Ask Something Else>",
    GithubProfile: "GitHub profile?"
};

const Labels = {
    WhoAreYou: "Who are you?",
    WhereAmI: "Where am I?",
    ShowProjects: "Do you have anything to show?",
    ContactOrFind: "Where can I find or contact you?"
};

const elements = {
    sprite: () => document.getElementById("vn-sprite"),
    dialogueBox: () => document.getElementById("vn-dialogue-box"),
    text: () => document.getElementById("vn-text"),
    options: () => document.getElementById("vn-options")
};

Object.values(Sprites).forEach(src => new Image().src = src);

let skipTyping = false;
const skipHandler = () => { skipTyping = true; };

async function typeWriter(html, element, speed = 30) {
    element.innerHTML = "";
    skipTyping = false;

    await wait(50);

    document.addEventListener("click", skipHandler, { once: true });

    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = html;

    const queue = Array.from(tempDiv.childNodes);

    for (const node of queue) {
        if (skipTyping) break;
        await processNode(node, element);
    }

    document.removeEventListener("click", skipHandler);
    element.innerHTML = html;

    async function processNode(node, parent) {
        if (skipTyping) return;

        if (node.nodeType === 3) {
            const text = node.nodeValue;
            const textNode = document.createTextNode("");
            parent.appendChild(textNode);

            for (let i = 0; i < text.length; i++) {
                if (skipTyping) return;
                textNode.nodeValue += text.charAt(i);
                await wait(speed);
            }
        } else if (node.nodeType === 1) {
            const newEl = document.createElement(node.tagName);
            Array.from(node.attributes).forEach(attr => {
                newEl.setAttribute(attr.name, attr.value);
            });
            parent.appendChild(newEl);

            const children = Array.from(node.childNodes);
            for (const child of children) {
                await processNode(child, newEl);
            }
        }
    }
}

async function setSprite(src) {
    elements.sprite().src = src;
}

function createButton(text, onClick) {
    const btn = document.createElement("button");
    btn.textContent = text;
    Object.assign(btn.style, {
        padding: "10px 20px",
        marginRight: "10px",
        border: "1px solid white",
        background: "transparent",
        color: "white",
        cursor: "pointer",
        borderRadius: "5px",
        fontFamily: "inherit",
        fontSize: "16px"
    });

    btn.onmouseover = () => {
        btn.style.background = "white";
        btn.style.color = "black";
    };
    btn.onmouseout = () => {
        btn.style.background = "transparent";
        btn.style.color = "white";
    };

    btn.onclick = onClick;
    return btn;
}

function clearOptions() {
    elements.options().innerHTML = "";
}

function showAskSomethingElse() {
    clearOptions();
    elements.options().appendChild(createButton(Dialogues.AskElse, startOptionsFlow));
}

async function sequenceWelcome() {
    await wait(3500);
    elements.sprite().style.opacity = "1";
    await wait(2000);
    elements.dialogueBox().style.display = "block";

    await typeWriter(Dialogues.Welcome, elements.text());
    await wait(1000);

    await setSprite(Sprites.Sheathing);
    await wait(500);
    await setSprite(Sprites.Sheathed);
    await wait(1000);
    await setSprite(Sprites.Idle);
    await wait(1000);

    startOptionsFlow();
}

async function sequenceWhoAreYou() {
    clearOptions();
    await setSprite(Sprites.Thinking);
    await typeWriter(Dialogues.Me, elements.text());
    await wait(500);

    await setSprite(Sprites.Shrugging);
    await typeWriter(Dialogues.Dunno, elements.text());
    await wait(500);

    await setSprite(Sprites.Explaining);
    await typeWriter(Dialogues.LikeRust, elements.text());

    await setSprite(Sprites.Idle);
    showAskSomethingElse();
}

async function sequenceWhereAmI() {
    clearOptions();
    await setSprite(Sprites.Sheathing);
    await wait(500);
    await setSprite(Sprites.PointingSword);

    await typeWriter(Dialogues.YourFuneral, elements.text());
    await wait(1000);

    await setSprite(Sprites.Sheathing);
    await wait(500);
    await setSprite(Sprites.BuriedHand);

    await typeWriter(Dialogues.JustKidding, elements.text());

    await setSprite(Sprites.Idle);
    showAskSomethingElse();
}

async function sequenceProjects() {
    clearOptions();
    await setSprite(Sprites.Explaining);
    await typeWriter(Dialogues.Projects, elements.text());

    elements.options().appendChild(createButton(Dialogues.GithubProfile, sequenceContact));
    elements.options().appendChild(createButton(Dialogues.AskElse, startOptionsFlow));
}

async function sequenceContact() {
    clearOptions();
    await setSprite(Sprites.BuriedHand);
    await typeWriter(Dialogues.Contact, elements.text());

    await setSprite(Sprites.Idle);
    showAskSomethingElse();
}

const routes = [
    { label: Labels.WhoAreYou, handler: sequenceWhoAreYou },
    { label: Labels.WhereAmI, handler: sequenceWhereAmI },
    { label: Labels.ShowProjects, handler: sequenceProjects },
    { label: Labels.ContactOrFind, handler: sequenceContact }
];

function startOptionsFlow() {
    clearOptions();
    elements.text().innerHTML = Dialogues.Prompt;

    routes.forEach(route => {
        elements.options().appendChild(createButton(route.label, route.handler));
    });
}

sequenceWelcome();
