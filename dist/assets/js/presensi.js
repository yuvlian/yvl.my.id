import QrScanner from "/assets/js/vendor/qr-scanner/min.js";

let scanner;
let isSendingData = false;
let classId = "";

// this is just cloudflare's forward proxy for avoiding CORS issues
const PROXY_HOST = "proxy2.neonteam.dev";
const HOST_KAMPUS_KITA = "apikampuskita-mahasiswa.unair.ac.id";
const HOST_CYBER_CAMPUS = "apicybercampus.unair.ac.id";

function notify(level, msg) {
    const cont = document.getElementById("notify_container");
    const div = document.createElement("div");

    div.className = level === 0 ? "notify notify-ok" : "notify notify-error";
    div.textContent = msg;
    cont.innerHTML = "";
    cont.appendChild(div);
}

window.switchMode = function () {
    const mode = document.querySelector('#mode_list li[aria-selected="true"]').dataset.value;
    document.getElementById('userpass_box').style.display = mode === 'userpass' ? 'block' : 'none';
    document.getElementById('id_box').style.display = mode === 'id' ? 'block' : 'none';
};

function toggleModeList(list, btn, open) {
    list.hidden = !open;
    btn.setAttribute('aria-expanded', String(open));
}

function setupDropdown(selectId, buttonId, listId, labelId, onPick) {
    const wrap = document.getElementById(selectId);
    const btn = document.getElementById(buttonId);
    const list = document.getElementById(listId);
    if (labelId) {
        document.getElementById(labelId).textContent =
            document.querySelector(`#${listId} li[aria-selected="true"]`)?.textContent || '';
    }

    btn.addEventListener('click', () => toggleModeList(list, btn, list.hidden));

    list.addEventListener('click', e => {
        const li = e.target.closest('li');
        if (!li) return;
        list.querySelectorAll('li').forEach(opt => {
            opt.setAttribute('aria-selected', opt === li ? 'true' : 'false');
        });
        if (labelId) document.getElementById(labelId).textContent = li.textContent;
        toggleModeList(list, btn, false);
        onPick(li.dataset.value);
    });

    document.addEventListener('click', e => {
        if (!wrap.contains(e.target)) toggleModeList(list, btn, false);
    });

    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') toggleModeList(list, btn, false);
    });
}

function setupModeDropdown() {
    setupDropdown('mode_select', 'mode_button', 'mode_list', 'mode_label', window.switchMode);
}

function setupCameraDropdown() {
    setupDropdown('mode_select_cam', 'camera_button', 'camera_list', 'camera_label', value => {
        if (scanner) {
            scanner.setCamera(value).then(() => {
                setupZoomSlider();
            }).catch(err => {
                notify(2, `Failed to switch camera: ${err}`);
            });
        }
    });
}

function populateCameraList(cameras, activeId) {
    const list = document.getElementById('camera_list');
    list.innerHTML = '';
    cameras.forEach((camera, index) => {
        const li = document.createElement('li');
        li.role = 'option';
        li.tabIndex = -1;
        li.dataset.value = camera.id;
        li.textContent = camera.label || `Camera ${index + 1}`;
        li.setAttribute('aria-selected', camera.id === activeId ? 'true' : 'false');
        list.appendChild(li);
    });
    if (!list.querySelector('li[aria-selected="true"]') && list.firstElementChild) {
        list.firstElementChild.setAttribute('aria-selected', 'true');
    }
    const selected = list.querySelector('li[aria-selected="true"]');
    if (selected) document.getElementById('camera_label').textContent = selected.textContent;
}

function hideScanner() {
    if (scanner) {
        scanner.stop();
    }
    document.getElementById('video').style.display = 'none';
    document.getElementById('zoom_slider')?.remove();
    if (cameraInterface) cameraInterface.style.display = 'none';
    if (startQrButton) startQrButton.style.display = 'block';
}

async function setupZoomSlider() {
    if (!scanner || !scanner.$video) return;

    document.getElementById('zoom_slider')?.remove();

    const stream = scanner.$video.srcObject;
    if (!stream) return;

    const track = stream.getVideoTracks()[0];
    if (!track) return;

    const capabilities = track.getCapabilities();
    const zoom = capabilities.zoom || { min: 100, max: 400, step: 1 };

    const video = document.getElementById('video');
    const slider = document.createElement("input");
    slider.type = "range";
    slider.min = zoom.min;
    slider.max = zoom.max;
    slider.step = zoom.step || 0.01;
    slider.value = zoom.min;
    slider.id = "zoom_slider";
    video.insertAdjacentElement("afterend", slider);
    slider.oninput = async () => {
        try {
            await track.applyConstraints({
                advanced: [{ zoom: parseFloat(slider.value) }]
            });
        } catch (err) {
            notify(2, `Zoom failed: ${err}`);
        }
    };
}

window.startQR = async function () {
    document.getElementById("notify_container").innerHTML = "";

    if (startQrButton) startQrButton.style.display = 'none';
    if (cameraInterface) cameraInterface.style.display = 'block';

    const video = document.getElementById('video');

    if (scanner) {
        try {
            video.style.display = 'block';
            await scanner.start();
            await setupZoomSlider();
        } catch (err) {
            notify(2, `QR init error: ${err}`);
            hideScanner();
        }
        return;
    }

    video.style.display = 'block';

    let cameras = await QrScanner.listCameras(true).catch(() => []);

    const parseName = (label) => {
        const m = (label || "").match(/^Camera\s+(\d+),\s+facing\s+(front|back)$/i);
        return m ? { n: parseInt(m[1], 10), back: m[2].toLowerCase() === "back" } : null;
    };
    const cameraByName = new Map(cameras.map(c => [c.label || `Camera ${cameras.indexOf(c) + 1}`, c]));
    const ranked = [...cameraByName.entries()]
        .map(([name, cam]) => ({ cam, info: parseName(name) }))
        .filter(p => p.info)
        .sort((a, b) => (a.info.n - b.info.n) || (b.info.back - a.info.back));
    const defaultId = (ranked[0]?.cam || cameras[0])?.id;

    try {
        scanner = new QrScanner(
            video,
            result => {
                classId = result.data || result;
                scanner.stop();
                hideScanner();
                window.sendData();
            },
            {
                onDecodeError: err => {
                    if (!String(err).includes("No QR code found")) {
                        notify(2, `QR Decode error: ${err}`);
                    }
                },
                returnDetailedScanResult: true,
                maxScansPerSecond: 10,
                highlightScanRegion: true,
                ...(defaultId ? { preferredCamera: defaultId } : {}),
            }
        );

        await scanner.start();

        if (cameraList.children.length === 0) {
            if (cameras.length === 0) {
                cameras = await QrScanner.listCameras(true).catch(() => []);
            }

            if (cameras.length === 0) {
                notify(2, "No cameras found on this device.");
                hideScanner();
                return;
            }

            const activeTrack = video.srcObject instanceof MediaStream ? video.srcObject.getVideoTracks()[0] : null;
            const activeDeviceId = activeTrack ? activeTrack.getSettings().deviceId : null;
            populateCameraList(cameras, activeDeviceId);
        }

        await setupZoomSlider();
    } catch (err) {
        notify(2, `QR init error: ${err}`);
        hideScanner();
    }
};

window.scanImageQR = async function () {
    document.getElementById("notify_container").innerHTML = "";
    const imageInput = document.getElementById('qr_image_input');

    if (imageInput.files.length === 0) return;

    const file = imageInput.files[0];

    hideScanner();

    try {
        const result = await QrScanner.scanImage(file, {
            setAlsoTryWithoutScanRegion: true,
            returnDetailedScanResult: true
        });

        classId = result.data;
        window.sendData();
    } catch (error) {
        notify(2, `Failed to scan image: ${error}`);
    } finally {
        imageInput.value = '';
    }
};

async function fetchCyberToken() {
    const url = `https://${PROXY_HOST}/${HOST_CYBER_CAMPUS}/api/token/ambil-token-v2`;

    const body = new URLSearchParams({
        user: "apps",
        key: "aPiUntuKapps@4ndRo!D_20211210"
    });

    try {
        const resp = await fetch(url, {
            method: "POST",
            headers: {
                "content-type": "application/x-www-form-urlencoded;charset=UTF-8",
                "accept": "application/json"
            },
            body: body.toString()
        });
        return await resp.json();
    } catch {
        return null;
    }
}

window.sendData = async function () {
    if (isSendingData) {
        return;
    }

    isSendingData = true;

    try {
        document.getElementById("notify_container").innerHTML = "";

        hideScanner();

        const mode = document.querySelector('#mode_list li[aria-selected="true"]').dataset.value;
        let id_mhs = "";

        if (mode === "userpass") {
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;

            if (!username || !password) {
                return notify(2, "Username and password must not be empty.");
            }

            const loginUrl = `https://${PROXY_HOST}/${HOST_KAMPUS_KITA}/auth/login`;
            const formBody = new URLSearchParams({ email: username, password: password });

            let loginResp;
            try {
                loginResp = await fetch(loginUrl, {
                    method: "POST",
                    headers: {
                        "content-type": "application/x-www-form-urlencoded;charset=UTF-8",
                        "accept": "application/json"
                    },
                    body: formBody.toString()
                }).then(r => r.json());
            } catch {
                return notify(2, "Failed to login to Kampus Kita.");
            }

            id_mhs = loginResp?.data?.mahasiswa?.ID_MHS;
            if (!id_mhs) {
                return notify(2, "Login failed. Check your credentials.");
            }
        } else {
            id_mhs = document.getElementById('id_mhs').value;
            if (!id_mhs) {
                return notify(2, "ID_MHS must not be empty.");
            }
        }

        if (!classId) {
            return notify(2, "Scan a QR code first.");
        }
        const parts = classId.split("::");
        if (
            parts.length < 2 ||
            parts[0].trim() === "" ||
            parts[1].trim() === ""
        ) {
            return notify(2, "Invalid Class ID format. Expected something like: XXXX::YYYY...");
        }

        const tokenData = await fetchCyberToken();
        if (!tokenData) {
            return notify(2, "Failed to get CyberCampus token.");
        }

        const presensiUrl = `https://${PROXY_HOST}/${HOST_CYBER_CAMPUS}/api/mahasiswa/presensi`;

        const presensiBody = new URLSearchParams({
            token: tokenData,
            id_mhs: id_mhs,
            id_presensi_kelas: classId,
            lang: "",
            lat: ""
        });
        let result;
        try {
            result = await fetch(presensiUrl, {
                method: "POST",
                headers: {
                    "content-type": "application/x-www-form-urlencoded;charset=UTF-8",
                    "accept": "application/json"
                },
                body: presensiBody.toString()
            });
        } catch {
            return notify(2, "Failed to send attendance data.");
        }
        const resS = await result.text();

        notify(0, `Check-In done! API Response: ${resS}`);
    } finally {
        isSendingData = false;
    }
};

const startQrButton = document.getElementById('start-qr-button');
const cameraInterface = document.getElementById('qr-camera-interface');
const cameraList = document.getElementById('camera_list');

window.addEventListener("DOMContentLoaded", () => {
    setupModeDropdown();
    setupCameraDropdown();
    switchMode();
    document.getElementById('qr_image_input').addEventListener('change', scanImageQR);
});
