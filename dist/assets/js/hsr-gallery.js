const GALLERY_JSON_URL = 'https://raw.githubusercontent.com/platformintegrityviolator/thepeoplesdrawings/refs/heads/main/output.json';
const ASSET_BASE_URL = 'https://raw.githubusercontent.com/platformintegrityviolator/thepeoplesdrawings/refs/heads/main/assets/';

const CHARACTER_NAMES = {
    "1001": "March 7th",
    "1002": "Dan Heng",
    "1003": "Himeko",
    "1004": "Welt",
    "1005": "Kafka",
    "1006": "Silver Wolf",
    "1008": "Arlan",
    "1009": "Asta",
    "1013": "Herta",
    "1014": "Saber",
    "1015": "Archer",
    "1101": "Bronya",
    "1102": "Seele",
    "1103": "Serval",
    "1104": "Gepard",
    "1105": "Natasha",
    "1106": "Pela",
    "1107": "Clara",
    "1108": "Sampo",
    "1109": "Hook",
    "1110": "Lynx",
    "1111": "Luka",
    "1112": "Topaz & Numby",
    "1201": "Qingque",
    "1202": "Tingyun",
    "1203": "Luocha",
    "1204": "Jing Yuan",
    "1205": "Blade",
    "1206": "Sushang",
    "1207": "Yukong",
    "1208": "Fu Xuan",
    "1209": "Yanqing",
    "1210": "Guinaifen",
    "1211": "Bailu",
    "1212": "Jingliu",
    "1213": "Dan Heng \u2022 Imbibitor Lunae",
    "1214": "Xueyi",
    "1215": "Hanya",
    "1217": "Huohuo",
    "1218": "Jiaoqiu",
    "1220": "Feixiao",
    "1221": "Yunli",
    "1222": "Lingsha",
    "1223": "Moze",
    "1224": "March 7th",
    "1225": "Fugue",
    "1301": "Gallagher",
    "1302": "Argenti",
    "1303": "Ruan Mei",
    "1304": "Aventurine",
    "1305": "Dr. Ratio",
    "1306": "Sparkle",
    "1307": "Black Swan",
    "1308": "Acheron",
    "1309": "Robin",
    "1310": "Firefly",
    "1312": "Misha",
    "1313": "Sunday",
    "1314": "Jade",
    "1315": "Boothill",
    "1317": "Rappa",
    "1321": "The Dahlia",
    "1401": "The Herta",
    "1402": "Aglaea",
    "1403": "Tribbie",
    "1404": "Mydei",
    "1405": "Anaxa",
    "1406": "Cipher",
    "1407": "Castorice",
    "1408": "Phainon",
    "1409": "Hyacine",
    "1410": "Hysilens",
    "1412": "Cerydra",
    "1413": "Evernight",
    "1414": "Dan Heng \u2022 Permansor Terrae",
    "1415": "Cyrene",
    "1501": "Sparxie",
    "1502": "Yao Guang",
    "1504": "Ashveil",
    "8001": "Trailblazer",
    "8002": "Trailblazer",
    "8003": "Trailblazer",
    "8004": "Trailblazer",
    "8005": "Trailblazer",
    "8006": "Trailblazer",
    "8007": "Trailblazer",
    "8008": "Trailblazer",
};

function artistCredit(credit) {
    return credit === "yuvlian" ? "rainxllis" : credit;
}

async function initGallery() {
    const loadingEl = document.getElementById('loading');
    const errorEl = document.getElementById('error');

    try {
        const response = await fetch(GALLERY_JSON_URL);
        if (!response.ok) throw new Error('Failed to fetch data');

        const galleryData = await response.json();
        loadingEl.hidden = true;

        const artworks = [];
        for (const [charId, images] of Object.entries(galleryData)) {
            const charName = CHARACTER_NAMES[charId] || `Character ${charId}`;

            for (const [order, info] of Object.entries(images)) {
                artworks.push({
                    charId,
                    charName,
                    order: parseInt(order),
                    filename: info.filename,
                    credit: artistCredit(info.credit_text || 'Unknown Artist'),
                    url: `${ASSET_BASE_URL}${charId}/${info.filename}`
                });
            }
        }

        artworks.sort((a, b) => {
            if (a.charId !== b.charId) return a.charId.localeCompare(b.charId);
            return a.order - b.order;
        });

        renderGallery(artworks);
    } catch (err) {
        console.error(err);
        loadingEl.hidden = true;
        errorEl.style.display = 'block';
    }
}

function renderGallery(artworks) {
    const galleryEl = document.getElementById('gallery');
    const frag = document.createDocumentFragment();

    for (const art of artworks) {
        const card = document.createElement('div');
        card.className = 'artwork-card';

        const wrapper = document.createElement('div');
        wrapper.className = 'image-wrapper';

        const img = document.createElement('img');
        img.src = art.url;
        img.alt = art.charName;
        // img.loading = 'lazy';
        img.width = 512;
        img.height = 512;
        wrapper.appendChild(img);

        const nameEl = document.createElement('div');
        nameEl.className = 'character-name';
        nameEl.textContent = art.charName;

        const artistEl = document.createElement('div');
        artistEl.className = 'artist-name';
        artistEl.textContent = `Artist: ${art.credit}`;

        card.appendChild(wrapper);
        card.appendChild(nameEl);
        card.appendChild(artistEl);
        frag.appendChild(card);
    }

    galleryEl.appendChild(frag);
    galleryEl.hidden = false;
}

document.addEventListener('DOMContentLoaded', initGallery);
