const video = document.getElementById("video");
const expressionDisplay = document.getElementById("expression");
const canvas = document.getElementById("overlayCanvas");
const ctx = canvas.getContext("2d");

const emojiOverlay = document.createElement("div");
emojiOverlay.id = "emojiOverlay";
document.body.appendChild(emojiOverlay);

const rainContainer = document.createElement("div");
rainContainer.id = "rainContainer";
document.body.appendChild(rainContainer);

const emojiMap = {
    happy: "😊",
    sad: "😢",
    angry: "😡",
    surprised: "😲",
    fearful: "😨",
    disgusted: "🤢",
    neutral: "😐"
};

async function startVideo() {
    try {
        const constraints = {
            video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } }
        };

        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        video.srcObject = stream;
        video.play();

    } catch (err) {
        console.error("❌ Error accessing webcam:", err);
        alert("Please allow camera access in your browser settings.");
    }
}

document.addEventListener("click", function () {
    if (!video.srcObject) {
        startVideo();
    }
});

function adjustVideoSize() {
    const screenHeight = window.innerHeight;
    const screenWidth = window.innerWidth;

    if (screenWidth < 768) {
        video.style.height = `${screenHeight * 0.7}px`;
        canvas.style.height = `${screenHeight * 0.7}px`;
    } else {
        video.style.height = "auto";
        canvas.style.height = "auto";
    }
}

function showEmoji(expression) {
    emojiOverlay.innerText = emojiMap[expression] || "❓";
    emojiOverlay.style.display = "block";
    emojiOverlay.style.animation = "fadeInOut 1.5s ease-in-out";

    setTimeout(() => { emojiOverlay.style.display = "none"; }, 1500);
}

function createRain(expression) {
    for (let i = 0; i < 15; i++) {
        let drop = document.createElement("div");
        drop.classList.add("rainDrop");
        drop.innerText = emojiMap[expression] || "❓";

        drop.style.left = `${Math.random() * 100}%`;
        drop.style.top = `${Math.random() * 10 - 10}vh`;
        drop.style.animationDuration = `${Math.random() * 1.5 + 1}s`;
        drop.style.fontSize = `${Math.random() * 20 + 20}px`;

        rainContainer.appendChild(drop);

        setTimeout(() => drop.remove(), 2000);
    }
}

async function loadModels() {
    try {
        await faceapi.nets.tinyFaceDetector.loadFromUri("models");
        await faceapi.nets.faceExpressionNet.loadFromUri("models");
        console.log("✅ Models Loaded Successfully");
        detectExpressions();
    } catch (error) {
        console.error("❌ Error loading models:", error);
    }
}

async function detectExpressions() {
    console.log("🔍 Starting expression detection...");
    const displaySize = { width: video.videoWidth, height: video.videoHeight };
    faceapi.matchDimensions(video, displaySize);

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    setInterval(async () => {
        const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
            .withFaceExpressions();

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (detections.length > 0) {
            let expressions = detections[0].expressions;
            let maxExpression = Object.keys(expressions).reduce((a, b) => expressions[a] > expressions[b] ? a : b);

            expressionDisplay.innerText = `Expression: ${maxExpression}`;

            ctx.setTransform(-1, 0, 0, 1, canvas.width, 0);

            const { x, y, width, height } = detections[0].detection.box;

            ctx.strokeStyle = "#00FF00";
            ctx.lineWidth = 3;
            ctx.strokeRect(x, y, width, height);

            ctx.fillStyle = "#00FF00";
            ctx.font = "25px Arial";
            ctx.fillText(maxExpression.toUpperCase(), x, y - 10);

            ctx.setTransform(1, 0, 0, 1, 0, 0);

            showEmoji(maxExpression);
            createRain(maxExpression);
        } else {
            console.log("❌ No face detected.");
        }
    }, 500);
}

startVideo().then(() => loadModels());
