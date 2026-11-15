
// ==========================================
// GTA VI — INTERACTIVE EXPERIENCE
// ==========================================


// ==========================================
// 1. CUSTOM CURSOR GLOW
// ==========================================

const cursorGlow = document.querySelector(".cursor-glow");

if (cursorGlow) {

    if (window.matchMedia("(pointer: fine)").matches) {

        window.addEventListener("mousemove", (e) => {

            cursorGlow.style.left = `${e.clientX}px`;
            cursorGlow.style.top = `${e.clientY}px`;

        });

    } else {

        cursorGlow.style.display = "none";

    }

}


// ==========================================
// 2. SCROLL CONTROLLED VIDEO
// ==========================================

const cinematic = document.querySelector(".cinematic");
const video = document.querySelector("#scrollVideo");
const progressFill = document.querySelector("#progressFill");


// بازه زمانی ویدیو
// اگر از فایل کوتاه‌شده استفاده می‌کنی، این دو مقدار را صفر و 20 بگذار.

const VIDEO_START = 12;
const VIDEO_END = 32;

let videoReady = false;
let isSeeking = false;

let targetTime = VIDEO_START;
let lastSeekTime = -1;
let frameRequest = null;


// توقف ویدیو در شروع
if (video) {

    video.pause();

    video.addEventListener("loadedmetadata", () => {

        videoReady = true;

        if (VIDEO_END > video.duration) {

            console.warn(
                "VIDEO_END is longer than the actual video duration."
            );

        }

        updateVideoFromScroll();

    });

}


function updateVideoFromScroll() {

    if (!cinematic || !video || !videoReady) return;

    const rect = cinematic.getBoundingClientRect();

    const scrollableDistance =
        cinematic.offsetHeight - window.innerHeight;

    if (scrollableDistance <= 0) return;

    const scrolled = Math.max(
        0,
        Math.min(scrollableDistance, -rect.top)
    );

    const progress = scrolled / scrollableDistance;

    const start = Math.max(0, VIDEO_START);

    const end = Math.min(
        VIDEO_END,
        video.duration
    );

    targetTime = start + progress * (end - start);

    if (progressFill) {

        progressFill.style.width =
            `${progress * 100}%`;

    }

    if (!frameRequest) {

        frameRequest = requestAnimationFrame(syncVideo);

    }

}


function syncVideo() {

    frameRequest = null;

    if (!video || !videoReady || isSeeking) return;

    const difference = Math.abs(
        video.currentTime - targetTime
    );

    if (difference < 0.045) return;

    if (Math.abs(targetTime - lastSeekTime) < 0.025) return;

    isSeeking = true;

    lastSeekTime = targetTime;

    try {

        video.currentTime = targetTime;

    } catch (error) {

        isSeeking = false;

        console.warn("Video seeking failed:", error);

    }

}


// بعد از پایان هر جست‌وجوی فریم، اگر اسکرول تغییر کرده باشد
// ویدیو خودش را به موقعیت جدید می‌رساند.

if (video) {

    video.addEventListener("seeked", () => {

        isSeeking = false;

        if (
            Math.abs(video.currentTime - targetTime) > 0.06 &&
            !frameRequest
        ) {

            frameRequest = requestAnimationFrame(syncVideo);

        }

    });

}


window.addEventListener(
    "scroll",
    updateVideoFromScroll,
    { passive: true }
);

window.addEventListener(
    "resize",
    updateVideoFromScroll
);


// ==========================================
// 3. CINEMATIC STORY TEXT — PERSIAN
// ==========================================

const storyContent = document.querySelector("#storyContent");
const storyTitle = document.querySelector("#storyTitle");
const storyText = document.querySelector("#storyText");


const storyScenes = [

    {
        progress: 0,

        title: "به <span>وایس سیتی</span><br>خوش آمدید.",

        text:
            "پشت نورهای رنگارنگ شهر، هر رؤیایی بهایی دارد و هر انتخاب، سرنوشتی به دنبال خواهد داشت."
    },

    {
        progress: 0.25,

        title: "دو زندگی،<br><span>یک سرنوشت.</span>",

        text:
            "دو انسان، دو مسیر متفاوت و داستانی که قرار است همه چیز را تغییر دهد."
    },

    {
        progress: 0.50,

        title: "بدون قانون،<br><span>بدون محدودیت.</span>",

        text:
            "شهری که همیشه زنده است؛ هر خیابان رازی دارد و هر لحظه می‌تواند آغاز یک ماجرای تازه باشد."
    },

    {
        progress: 0.75,

        title: "این دنیا،<br><span>از آن توست.</span>",

        text:
            "خورشید غروب می‌کند، شهر بیدار می‌شود و داستان تو تازه آغاز شده است."
    }

];


let currentScene = -1;
let storyTimeout = null;


function updateStoryText() {

    if (
        !cinematic ||
        !storyContent ||
        !storyTitle ||
        !storyText
    ) return;


    const rect = cinematic.getBoundingClientRect();

    const maxScroll =
        cinematic.offsetHeight - window.innerHeight;

    if (maxScroll <= 0) return;


    const progress = Math.max(
        0,
        Math.min(1, -rect.top / maxScroll)
    );


    let nextScene = 0;

    storyScenes.forEach((scene, index) => {

        if (progress >= scene.progress) {

            nextScene = index;

        }

    });


    if (nextScene === currentScene) return;

    currentScene = nextScene;


    if (storyTimeout) {

        clearTimeout(storyTimeout);

    }


    storyContent.classList.add("changing");


    storyTimeout = setTimeout(() => {

        const scene = storyScenes[currentScene];

        if (!scene) return;

        storyTitle.innerHTML = scene.title;

        storyText.textContent = scene.text;

        storyContent.classList.remove("changing");

    }, 200);

}


window.addEventListener(
    "scroll",
    updateStoryText,
    { passive: true }
);


// ==========================================
// 4. 3D CHARACTER CARDS
// ==========================================

const cards = document.querySelectorAll(".tilt-card");

const finePointer = window.matchMedia("(pointer: fine)").matches;


if (finePointer) {

    cards.forEach(card => {

        card.addEventListener("mousemove", (e) => {

            if (window.innerWidth <= 768) return;


            const rect = card.getBoundingClientRect();

            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const centerX = rect.width / 2;
            const centerY = rect.height / 2;


            const rotateX =
                ((y - centerY) / centerY) * -7;

            const rotateY =
                ((x - centerX) / centerX) * 7;


            card.style.transform = `
                perspective(1000px)
                rotateX(${rotateX}deg)
                rotateY(${rotateY}deg)
                scale3d(1.02, 1.02, 1.02)
            `;

        });


        card.addEventListener("mouseleave", () => {

            card.style.transform = `
                perspective(1000px)
                rotateX(0deg)
                rotateY(0deg)
                scale3d(1, 1, 1)
            `;

        });

    });

}


// ==========================================
// 5. SCROLL REVEAL
// ==========================================

const revealElements = document.querySelectorAll(`

    .section-heading,
    .city-visual,
    .city-description,
    .character-card,
    .world-content,
    .final-section > *:not(.final-bg),
    .about-intro,
    .stat-box,
    .feature-card,
    .timeline-item

`);


if ("IntersectionObserver" in window) {

    const observer = new IntersectionObserver(

        (entries) => {

            entries.forEach(entry => {

                if (entry.isIntersecting) {

                    entry.target.classList.add("visible");

                    observer.unobserve(entry.target);

                }

            });

        },

        {
            threshold: 0.12
        }

    );


    revealElements.forEach(element => {

        element.classList.add("reveal");

        observer.observe(element);

    });

} else {

    revealElements.forEach(element => {

        element.classList.add("visible");

    });

}


// ==========================================
// 6. INITIALIZE
// ==========================================

function initializeExperience() {

    updateVideoFromScroll();

    updateStoryText();

}


window.addEventListener("load", () => {

    initializeExperience();

});


// اگر اسکریپت بعد از بارگذاری صفحه اجرا شود
if (document.readyState === "complete") {

    initializeExperience();

}


console.log("GTA VI Experience initialized successfully.");
