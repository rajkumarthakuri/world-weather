// ─────────────────────────────────────────────
// THEME TOGGLE
// ─────────────────────────────────────────────
const body = document.body;
const btn = document.getElementById("themeToggle");

// Apply saved theme on load
if (localStorage.getItem("theme") === "light") {
    body.classList.add("light");
    btn.textContent = "🌙";
} else {
    body.classList.remove("light");
    btn.textContent = "☀️";
}

btn.addEventListener("click", () => {
    body.classList.toggle("light");

    if (body.classList.contains("light")) {
        localStorage.setItem("theme", "light");
        btn.textContent = "🌙";
    } else {
        localStorage.setItem("theme", "dark");
        btn.textContent = "☀️";
    }

    // Re-apply weather background after toggling
    const weatherMain = document.body.getAttribute("data-weather");
    if (weatherMain) setTheme(weatherMain);
});


// ─────────────────────────────────────────────
// AUTO LOCATION ON PAGE LOAD
// ─────────────────────────────────────────────
window.addEventListener("load", () => {
    const loader = document.getElementById("loading-screen");
    const permUI = document.getElementById("permission-ui");

    const params = new URLSearchParams(window.location.search);

    // If the URL already has coordinates or a city, skip the permission prompt
    if (params.get("lat") || params.get("lon") || params.get("city")) {
        loader.style.display = "none";
        permUI.style.display = "none";
        return;
    }

    // First visit — show permission UI
    permUI.style.display = "flex";
});


// ─────────────────────────────────────────────
// PERMISSION UI BUTTONS
// ─────────────────────────────────────────────
function startLocation() {
    const loader = document.getElementById("loading-screen");
    const permUI = document.getElementById("permission-ui");

    permUI.style.display = "none";
    loader.style.display = "flex";

    if (!navigator.geolocation) {
        loader.style.display = "none";
        alert("Geolocation is not supported by your browser.");
        window.location.href = "/weather?city=Kathmandu";
        return;
    }

    navigator.geolocation.getCurrentPosition(
        (pos) => {
            const lat = pos.coords.latitude;
            const lon = pos.coords.longitude;
            window.location.href = `/weather?lat=${lat}&lon=${lon}`;
        },
        (err) => {
            loader.style.display = "none";
            console.error("Geolocation error:", err.code, err.message);
            alert("Location permission denied. Showing default city.");
            window.location.href = "/weather?city=Kathmandu";
        },
        { timeout: 10000, enableHighAccuracy: false }
    );
}

function skipLocation() {
    document.getElementById("permission-ui").style.display = "none";
    window.location.href = "/weather?city=Kathmandu";
}


// ─────────────────────────────────────────────
// MANUAL LOCATION BUTTON
// ─────────────────────────────────────────────
function getLocationWeather() {
    if (!navigator.geolocation) {
        alert("Geolocation not supported by your browser.");
        return;
    }

    // Show a brief visual feedback on the button
    const locBtn = document.querySelector(".location-btn");
    if (locBtn) {
        locBtn.style.opacity = "0.5";
        locBtn.style.pointerEvents = "none";
    }

    navigator.geolocation.getCurrentPosition(
        (position) => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            window.location.href = `/weather?lat=${lat}&lon=${lon}`;
        },
        (err) => {
            if (locBtn) {
                locBtn.style.opacity = "1";
                locBtn.style.pointerEvents = "auto";
            }
            console.error("Location error:", err.code, err.message);

            if (err.code === 1) {
                alert("Location access denied. Please allow location in your browser settings.");
            } else if (err.code === 2) {
                alert("Location unavailable. Please try searching for your city instead.");
            } else if (err.code === 3) {
                alert("Location request timed out. Please try again.");
            } else {
                alert("Could not get your location. Please search manually.");
            }
        },
        { timeout: 10000, enableHighAccuracy: false }
    );
}


// ─────────────────────────────────────────────
// DYNAMIC BACKGROUND THEME
// Covers all OWM weather condition groups:
// Thunderstorm (2xx), Drizzle (3xx), Rain (5xx),
// Snow (6xx), Atmosphere (7xx), Clear (800), Clouds (80x)
// ─────────────────────────────────────────────
const themes = {
    Thunderstorm: {
        dark:  "linear-gradient(160deg, #0a0a0f 0%, #1a1025 40%, #0d1a2e 100%)",
        light: "linear-gradient(160deg, #2c2c3e 0%, #3b2d4a 50%, #2a3a50 100%)",
        text:  { dark: "#e0d0ff", light: "#f0e8ff" },
        animation: "thunder"
    },
    Drizzle: {
        dark:  "linear-gradient(160deg, #0d1b2a 0%, #1b3a4b 50%, #0f2535 100%)",
        light: "linear-gradient(160deg, #b0c8d8 0%, #8ab4cc 50%, #a0bece 100%)",
        text:  { dark: "#cce8f4", light: "#0d2535" },
        animation: "rain"
    },
    Rain: {
        dark:  "linear-gradient(160deg, #0b1d2a 0%, #0e2a3d 50%, #091520 100%)",
        light: "linear-gradient(160deg, #8aafc0 0%, #6a96b0 50%, #7aa8be 100%)",
        text:  { dark: "#b8ddf0", light: "#091828" },
        animation: "rain"
    },
    Snow: {
        dark:  "linear-gradient(160deg, #1a2a3a 0%, #2a3f55 50%, #1e3048 100%)",
        light: "linear-gradient(160deg, #dce8f5 0%, #c8dff0 50%, #d8e8f8 100%)",
        text:  { dark: "#dff0ff", light: "#1a2a3a" },
        animation: "snow"
    },
    Mist: {
        dark:  "linear-gradient(160deg, #1a1e24 0%, #2a3040 50%, #1e2530 100%)",
        light: "linear-gradient(160deg, #c0c8d0 0%, #b0bcc8 50%, #bcc8d4 100%)",
        text:  { dark: "#ccd8e0", light: "#1a2028" },
        animation: "fog"
    },
    Smoke: {
        dark:  "linear-gradient(160deg, #1a1a1a 0%, #2a2a2a 50%, #1e1e1e 100%)",
        light: "linear-gradient(160deg, #b0b0b0 0%, #a0a0a0 50%, #aaaaaa 100%)",
        text:  { dark: "#d0d0d0", light: "#1a1a1a" },
        animation: "fog"
    },
    Haze: {
        dark:  "linear-gradient(160deg, #1e1a10 0%, #2e2818 50%, #241e12 100%)",
        light: "linear-gradient(160deg, #d8c898 0%, #c8b888 50%, #d0c090 100%)",
        text:  { dark: "#e8d8a0", light: "#1e1a10" },
        animation: "fog"
    },
    Dust: {
        dark:  "linear-gradient(160deg, #2a1a08 0%, #3a2810 50%, #2e2008 100%)",
        light: "linear-gradient(160deg, #d8b878 0%, #c8a860 50%, #d0b068 100%)",
        text:  { dark: "#f0c878", light: "#2a1808" },
        animation: "fog"
    },
    Sand: {
        dark:  "linear-gradient(160deg, #2e1e08 0%, #3e2c10 50%, #321e08 100%)",
        light: "linear-gradient(160deg, #e0c080 0%, #d0b060 50%, #d8b870 100%)",
        text:  { dark: "#f0d090", light: "#2e1e08" },
        animation: "fog"
    },
    Ash: {
        dark:  "linear-gradient(160deg, #1e1e1e 0%, #2e2828 50%, #222020 100%)",
        light: "linear-gradient(160deg, #b8b0b0 0%, #a8a0a0 50%, #b0a8a8 100%)",
        text:  { dark: "#d8d0d0", light: "#1e1a1a" },
        animation: "fog"
    },
    Squall: {
        dark:  "linear-gradient(160deg, #0a1520 0%, #152030 50%, #0e1a28 100%)",
        light: "linear-gradient(160deg, #8090a8 0%, #708098 50%, #788898 100%)",
        text:  { dark: "#c0d0e0", light: "#0a1520" },
        animation: "thunder"
    },
    Tornado: {
        dark:  "linear-gradient(160deg, #100a18 0%, #201530 50%, #180e28 100%)",
        light: "linear-gradient(160deg, #706080 0%, #605070 50%, #686078 100%)",
        text:  { dark: "#d0b8f0", light: "#100a18" },
        animation: "thunder"
    },
    Clear: {
        dark:  "linear-gradient(160deg, #0a1628 0%, #1a3050 50%, #0e2040 100%)",
        light: "linear-gradient(160deg, #ffe08a 0%, #ffb347 50%, #ff9020 100%)",
        text:  { dark: "#a8d8ff", light: "#2a1400" },
        animation: "clear"
    },
    Clouds: {
        dark:  "linear-gradient(160deg, #1a2030 0%, #2a3040 50%, #1e2838 100%)",
        light: "linear-gradient(160deg, #b0bcc8 0%, #98aabb 50%, #a8b8c8 100%)",
        text:  { dark: "#c8d8e8", light: "#1a2030" },
        animation: "clouds"
    }
};

function setTheme(weather) {
    const isLight = document.body.classList.contains("light");
    const theme = themes[weather] || themes["Clouds"];

    // Set body gradient background
    body.style.background = isLight ? theme.light : theme.dark;
    body.style.color = isLight ? theme.text.light : theme.text.dark;
    body.style.backgroundAttachment = "fixed";
    body.style.backgroundSize = "400% 400%";

    // Remove existing animation class, add new one
    body.classList.remove("anim-thunder", "anim-rain", "anim-snow", "anim-fog", "anim-clear", "anim-clouds");
    if (theme.animation) {
        body.classList.add(`anim-${theme.animation}`);
    }
}

// Auto-apply theme on load
const weatherMain = document.body.getAttribute("data-weather");
if (weatherMain) setTheme(weatherMain);