// ========== INDEX DB FILE LOADING ==========
// Load files from IndexedDB that were uploaded via setup page
const DB_NAME = 'ValentineStorage';
const DB_VERSION = 1;

function openDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

async function getFileFromDB(fileName) {
    try {
        const db = await openDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(['files'], 'readonly');
            const store = transaction.objectStore('files');
            const request = store.get(fileName);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    } catch (error) {
        console.error('Error loading file from DB:', error);
        return null;
    }
}

// ========== LOAD CONFIGURATION ==========
// This loads your custom settings from localStorage (setup page) or config.js
async function applyConfiguration() {
    let config = null;

    // Check localStorage first (from setup page)
    const savedConfig = localStorage.getItem('valentineConfig');
    if (savedConfig) {
        config = JSON.parse(savedConfig);
    } else if (typeof CONFIG !== 'undefined') {
        // Fallback to config.js
        config = CONFIG;
    }

    if (config) {
        // Update recipient name
        const nameElement = document.getElementById('recipientName');
        if (nameElement && config.recipientName) {
            nameElement.textContent = config.recipientName + ',';
        }

        // Update background video/music
        const videoSource = document.getElementById('bgVideoSource');
        const video = document.getElementById('bgVideo');
        if (videoSource && config.backgroundMusic) {
            // Check if it's a stored file
            if (config.backgroundMusic.startsWith('stored:')) {
                const fileName = config.backgroundMusic.replace('stored:', '');
                const fileData = await getFileFromDB(fileName);
                if (fileData) {
                    videoSource.src = fileData.data; // Use data URL
                    if (video) video.load();
                }
            } else {
                videoSource.src = config.backgroundMusic;
                if (video) video.load();
            }
        }

        // Store config globally for photo gallery
        window.CURRENT_CONFIG = config;
    }
}

// Apply configuration when page loads
document.addEventListener('DOMContentLoaded', applyConfiguration);

// DOM Elements
const yesBtn = document.getElementById('yesBtn');
const noBtn = document.getElementById('noBtn');
const thinkAgainWrapper = document.getElementById('thinkAgainWrapper');
const thinkAgainBtn = document.getElementById('thinkAgainBtn');
const hint = document.getElementById('hint');
const questionPage = document.getElementById('questionPage');
const successPage = document.getElementById('successPage');
const heartsContainer = document.getElementById('heartsContainer');
const confettiContainer = document.getElementById('confettiContainer');

let noHoverCount = 0;
let isAnimating = false;

// Audio context for sound effects
let audioCtx = null;

function initAudio() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
}

// Create balloon inflate sound
function playInflateSound() {
    initAudio();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.frequency.setValueAtTime(150, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(300, audioCtx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.1);
}

// Create pop/burst sound - CELEBRATORY PARTY POPPER!
function playBurstSound() {
    initAudio();

    // Main pop
    const pop = audioCtx.createOscillator();
    const popGain = audioCtx.createGain();
    pop.connect(popGain);
    popGain.connect(audioCtx.destination);
    pop.frequency.setValueAtTime(800, audioCtx.currentTime);
    pop.frequency.exponentialRampToValueAtTime(200, audioCtx.currentTime + 0.15);
    popGain.gain.setValueAtTime(0.8, audioCtx.currentTime);
    popGain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);
    pop.start();
    pop.stop(audioCtx.currentTime + 0.15);

    // Sparkle sounds
    for (let i = 0; i < 5; i++) {
        setTimeout(() => {
            const sparkle = audioCtx.createOscillator();
            const sparkleGain = audioCtx.createGain();
            sparkle.type = 'sine';
            sparkle.connect(sparkleGain);
            sparkleGain.connect(audioCtx.destination);
            sparkle.frequency.setValueAtTime(1000 + Math.random() * 2000, audioCtx.currentTime);
            sparkle.frequency.exponentialRampToValueAtTime(500, audioCtx.currentTime + 0.1);
            sparkleGain.gain.setValueAtTime(0.25, audioCtx.currentTime);
            sparkleGain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
            sparkle.start();
            sparkle.stop(audioCtx.currentTime + 0.1);
        }, i * 50);
    }
}

// Whoosh/Scoop sound for button escape
function playWhooshSound() {
    initAudio();

    // Create a "whoosh" with frequency sweep
    const osc = audioCtx.createOscillator();
    const osc2 = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    const filter = audioCtx.createBiquadFilter();

    osc.type = 'sawtooth';
    osc2.type = 'sine';
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(2000, audioCtx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(200, audioCtx.currentTime + 0.15);

    osc.connect(filter);
    osc2.connect(filter);
    filter.connect(gain);
    gain.connect(audioCtx.destination);

    // Frequency sweep down (whoosh)
    osc.frequency.setValueAtTime(600, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime + 0.12);
    osc2.frequency.setValueAtTime(400, audioCtx.currentTime);
    osc2.frequency.exponentialRampToValueAtTime(80, audioCtx.currentTime + 0.15);

    gain.gain.setValueAtTime(0.4, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);

    osc.start();
    osc2.start();
    osc.stop(audioCtx.currentTime + 0.15);
    osc2.stop(audioCtx.currentTime + 0.15);
}

// Safe positions for No button
function getSafePositions() {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const centerX = vw / 2 - 50;
    const centerY = vh / 2 - 25;
    return [
        { x: centerX - 80, y: centerY - 60 },
        { x: centerX + 80, y: centerY - 60 },
        { x: centerX - 100, y: centerY },
        { x: centerX + 100, y: centerY },
        { x: centerX - 80, y: centerY + 60 },
        { x: centerX + 80, y: centerY + 60 },
        { x: centerX, y: centerY - 80 },
        { x: centerX, y: centerY + 80 }
    ];
}

let lastPositionIndex = -1;
function getNextSafePosition() {
    const positions = getSafePositions();
    let index;
    do {
        index = Math.floor(Math.random() * positions.length);
    } while (index === lastPositionIndex && positions.length > 1);
    lastPositionIndex = index;
    let pos = positions[index];
    pos.x = Math.max(50, Math.min(window.innerWidth - 150, pos.x));
    pos.y = Math.max(50, Math.min(window.innerHeight - 100, pos.y));
    return pos;
}

// Floating hearts
function createFloatingHearts() {
    const colors = ['#E91E63', '#FF6B9D', '#FF1493', '#FF69B4', '#FFB6C1'];
    setInterval(() => {
        const heart = document.createElement('div');
        heart.className = 'floating-heart';
        const size = Math.random() * 20 + 12;
        heart.innerHTML = `<svg width="${size}" height="${size}" viewBox="0 0 32 32"><path d="M16 28C16 28 3 18 3 10C3 5.58 6.58 2 11 2C13.5 2 15.5 3.5 16 4C16.5 3.5 18.5 2 21 2C25.42 2 29 5.58 29 10C29 18 16 28 16 28Z" fill="${colors[Math.floor(Math.random() * colors.length)]}"/></svg>`;
        heart.style.left = Math.random() * 100 + 'vw';
        heart.style.animationDuration = (Math.random() * 4 + 6) + 's';
        heartsContainer.appendChild(heart);
        setTimeout(() => heart.remove(), 11000);
    }, 600);
}

// Floating emojis - MORE of them!
function createFloatingEmojis() {
    const emojis = ['💕', '💖', '💗', '✨', '🌟', '💝', '🩷', '💓', '❤️', '💘', '🥰', '😍', '🌸', '🦋', '⭐', '💫'];
    setInterval(() => {
        const emoji = document.createElement('div');
        emoji.className = 'floating-emoji';
        emoji.textContent = emojis[Math.floor(Math.random() * emojis.length)];
        emoji.style.left = Math.random() * 100 + 'vw';
        emoji.style.fontSize = (18 + Math.random() * 20) + 'px';
        emoji.style.animationDuration = (Math.random() * 4 + 5) + 's';
        heartsContainer.appendChild(emoji);
        setTimeout(() => emoji.remove(), 10000);
    }, 400);
}

// Shooting stars - realistic
function createShootingStars() {
    setInterval(() => {
        const star = document.createElement('div');
        star.className = 'shooting-star';
        star.style.top = (Math.random() * 40) + '%';
        star.style.left = (50 + Math.random() * 50) + '%';
        star.style.animationDuration = (1.2 + Math.random() * 0.6) + 's';
        heartsContainer.appendChild(star);
        setTimeout(() => star.remove(), 3000);
    }, 1500);
}


// Sparkles
function createSparkles(x, y) {
    const colors = ['#FF6B9D', '#FFD700', '#FF69B4', '#FFC0CB'];
    for (let i = 0; i < 6; i++) {
        const s = document.createElement('div');
        s.className = 'sparkle';
        s.style.left = x + 'px';
        s.style.top = y + 'px';
        s.style.background = colors[Math.floor(Math.random() * colors.length)];
        const angle = (Math.PI * 2 * i) / 6;
        s.style.setProperty('--tx', Math.cos(angle) * 25 + 'px');
        s.style.setProperty('--ty', Math.sin(angle) * 25 + 'px');
        document.body.appendChild(s);
        setTimeout(() => s.remove(), 500);
    }
}

function moveButtonToSafeSpot(button) {
    const pos = getNextSafePosition();
    const rect = button.getBoundingClientRect();

    // Play whoosh sound!
    playWhooshSound();

    createSparkles(rect.left + rect.width / 2, rect.top + rect.height / 2);
    button.style.position = 'fixed';
    button.style.left = pos.x + 'px';
    button.style.top = pos.y + 'px';
    button.style.margin = '0';
    button.style.zIndex = '9999';
    setTimeout(() => createSparkles(pos.x + 50, pos.y + 25), 150);
}

function escapeButton(e) {
    unmuteVideo();
    e.preventDefault();
    e.stopPropagation();
    if (isAnimating) {
        moveButtonToSafeSpot(noBtn);
        return;
    }
    noHoverCount++;
    hint.classList.add('show');
    if (noHoverCount >= 5) {
        noBtn.style.display = 'none';
        thinkAgainWrapper.classList.add('show');
        const centerX = window.innerWidth / 2 - 60;
        const centerY = window.innerHeight / 2 + 50;
        thinkAgainBtn.style.position = 'fixed';
        thinkAgainBtn.style.left = Math.max(50, Math.min(window.innerWidth - 150, centerX)) + 'px';
        thinkAgainBtn.style.top = Math.max(50, Math.min(window.innerHeight - 100, centerY)) + 'px';
        thinkAgainBtn.style.margin = '0';
        thinkAgainBtn.style.zIndex = '9999';
        return;
    }
    isAnimating = true;
    noBtn.classList.add('escaping');
    moveButtonToSafeSpot(noBtn);
    setTimeout(() => isAnimating = false, 150);
}

// YES BUTTON - REALISTIC BALLOON ANIMATION WITH SOUND!
function handleYesClick() {
    unmuteVideo();
    const btnRect = yesBtn.getBoundingClientRect();

    // Create balloon
    const balloon = document.createElement('div');
    balloon.className = 'heart-balloon-container';
    balloon.innerHTML = `
        <div class="heart-balloon">
            <div class="heart-balloon-emojis"></div>
        </div>
    `;
    document.body.appendChild(balloon);

    const heartBalloon = balloon.querySelector('.heart-balloon');
    const emojiContainer = balloon.querySelector('.heart-balloon-emojis');

    // Start at button
    heartBalloon.style.left = btnRect.left + 'px';
    heartBalloon.style.top = btnRect.top + 'px';
    heartBalloon.style.width = btnRect.width + 'px';
    heartBalloon.style.height = btnRect.height + 'px';

    yesBtn.style.visibility = 'hidden';

    const valentineEmojis = ['❤️', '💕', '💖', '💗', '💓', '💝', '💘', '💞', '🌹', '💐', '🥰', '😍', '💑', '💏', '💋', '🫶', '💌', '🩷', '♥️', '😘'];

    let size = 0;
    let emojiCount = 0;
    let wobblePhase = 0;
    const maxSize = Math.max(window.innerWidth, window.innerHeight) * 1.3;

    // REALISTIC INFLATION with wobble
    const growInterval = setInterval(() => {
        size += 12;
        wobblePhase += 0.3;

        // Wobble effect - balloon stretches and squishes
        const wobbleX = Math.sin(wobblePhase) * 0.05 + 1;
        const wobbleY = Math.cos(wobblePhase) * 0.05 + 1;

        const baseWidth = btnRect.width + size;
        const baseHeight = btnRect.height + size * 1.1;

        const newWidth = baseWidth * wobbleX;
        const newHeight = baseHeight * wobbleY;

        heartBalloon.style.width = newWidth + 'px';
        heartBalloon.style.height = newHeight + 'px';
        heartBalloon.style.left = (window.innerWidth / 2 - newWidth / 2) + 'px';
        heartBalloon.style.top = (window.innerHeight / 2 - newHeight / 2) + 'px';

        // Play inflate sound periodically
        if (size % 60 === 0) {
            playInflateSound();
        }

        // Add LOTS of emojis
        if (size % 15 === 0 && emojiCount < 120) {
            for (let i = 0; i < 6; i++) {
                const emoji = document.createElement('span');
                emoji.className = 'balloon-emoji-inside';
                emoji.textContent = valentineEmojis[Math.floor(Math.random() * valentineEmojis.length)];
                emoji.style.left = (5 + Math.random() * 90) + '%';
                emoji.style.top = (5 + Math.random() * 90) + '%';
                emoji.style.fontSize = (12 + Math.random() * 28) + 'px';
                emoji.style.animationDelay = (Math.random() * 0.5) + 's';
                emojiContainer.appendChild(emoji);
                emojiCount++;
            }
        }

        // TIME TO BURST!
        if (size >= maxSize) {
            clearInterval(growInterval);

            // Intense shaking
            heartBalloon.classList.add('shake');

            setTimeout(() => {
                // BURST!
                playBurstSound();
                heartBalloon.classList.add('burst');
                createMassiveEmojiBurst();

                // Switch pages immediately when burst starts
                questionPage.classList.add('hidden');
                successPage.classList.remove('hidden');
                createConfetti();

                setTimeout(() => {
                    balloon.remove();
                }, 600);
            }, 500);
        }
    }, 20);
}

// MASSIVE BRUTAL BURST - 150 emojis flying EVERYWHERE!
function createMassiveEmojiBurst() {
    const emojis = ['❤️', '💕', '💖', '💗', '💓', '💝', '💘', '💞', '🌹', '💐', '🥰', '😍', '✨', '🎉', '💑', '💋', '🫶', '💌', '🩷', '♥️', '🎊', '💥'];
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;

    // 150 emojis in waves!
    for (let wave = 0; wave < 3; wave++) {
        for (let i = 0; i < 50; i++) {
            setTimeout(() => {
                const emoji = document.createElement('div');
                emoji.className = 'burst-emoji';
                emoji.textContent = emojis[Math.floor(Math.random() * emojis.length)];

                // Start from random point near center
                const startX = centerX + (Math.random() - 0.5) * 100;
                const startY = centerY + (Math.random() - 0.5) * 100;
                emoji.style.left = startX + 'px';
                emoji.style.top = startY + 'px';
                emoji.style.fontSize = (24 + Math.random() * 48) + 'px';

                // Fly to edges of screen and beyond!
                const angle = Math.random() * Math.PI * 2;
                const distance = 400 + Math.random() * 800;
                emoji.style.setProperty('--tx', Math.cos(angle) * distance + 'px');
                emoji.style.setProperty('--ty', Math.sin(angle) * distance + 'px');
                emoji.style.setProperty('--rot', (Math.random() * 1440 - 720) + 'deg');

                document.body.appendChild(emoji);
                setTimeout(() => emoji.remove(), 2500);
            }, wave * 100 + i * 8);
        }
    }
}

// Confetti on success page
function createConfetti() {
    const shapes = ['❤️', '💕', '💖', '✨', '🎉', '💝', '🌹', '💗', '🩷', '🎊'];
    for (let i = 0; i < 100; i++) {
        setTimeout(() => {
            const c = document.createElement('div');
            c.className = 'confetti';
            c.innerHTML = shapes[Math.floor(Math.random() * shapes.length)];
            c.style.fontSize = (Math.random() * 24 + 16) + 'px';
            c.style.left = Math.random() * 100 + '%';
            c.style.top = '-20px';
            c.style.animationDuration = (Math.random() * 2 + 2) + 's';
            confettiContainer.appendChild(c);
            setTimeout(() => c.remove(), 4000);
        }, i * 30);
    }

    // Create floating polaroid photos
    createPolaroidGallery();
}

// Floating Polaroid Photo Gallery
function createPolaroidGallery() {
    const polaroidContainer = document.getElementById('polaroidContainer');

    // All images - priority: localStorage config > config.js > defaults
    let photos = [];

    if (window.CURRENT_CONFIG && window.CURRENT_CONFIG.photos && window.CURRENT_CONFIG.photos.length > 0) {
        // From setup page (localStorage)
        photos = window.CURRENT_CONFIG.photos;
    } else if (typeof CONFIG !== 'undefined' && CONFIG.photos) {
        // From config.js
        photos = CONFIG.photos;
    } else {
        // Default photos
        photos = [
            './photos/20250425_1107_Girl\'s Slimmer Face_remix_01jsnq4vzrefqvk4cayqbzzx1f.png',
            './photos/20250425_1111_Ghibli Art Stroll_remix_01jsnqcbvdenysb9jfb2bdpdwc.png',
            './photos/20250425_1114_Ghibli Style Reflection_remix_01jsnqhg94fk8b2mtwwqk2d6kk.png',
            './photos/20250425_1135_Peaceful Sleep Animation_remix_01jsnrrr1kfxdtj0msakb2bnfe.png',
            './photos/20250425_1137_Ghibli-Style Wilderness_remix_01jsnrvahffspt7t1j7wr462wv.png',
            './photos/20250426_1130_Ghibli-Inspired Snowy Mountains_remix_01jsratmg7f53s8bz30semjbnq.png',
            './photos/20250426_1142_Ghibli Art Ride_remix_01jsrbh7fnepxvjzydd51rm4r4.png',
            './photos/20250426_1144_Ghibli-Inspired Companions_remix_01jsrbp2rve32v7x79cs2d6n2c.png',
            './photos/20250426_1146_Ghibli-Inspired Portrait_remix_01jsrbrvy5e79thbz6hzg0raqq.png',
            './photos/20250426_1152_Studio-Inspired Art_remix_01jsrc3wsseyms61fk6n3m5177.png',
            './photos/20250426_1156_Ghibli-Style Cozy Trio_remix_01jsrcay86fzjr0rfz08xqmcmp.png',
            './photos/20250426_1249_Cozy Ghibli Rest_remix_01jsrfca3kex194zcwx6mxpq4h (2).png',
            './photos/20250426_1253_Cozy Room Scene_remix_01jsrfk7adf3ptze4ajv03f1ar.png',
            './photos/20250426_1301_Ghibli-Inspired Dining Scene_remix_01jsrg19hvft487r8tk66vr1m2.png',
            './photos/20250426_1308_Ghibli-Style Night Scene_remix_01jsrgf8q7ekzbr71ktbkd6b60.png',
            './photos/20250427_1531_Ghibli Art Park_remix_01jsvb0zw8e01bxh6gfh0c95p3.png',
            './photos/20250503_1538_Ghibli-Inspired Scenic Landscape_remix_01jtast1a1ehes4ksxa28161qs.png',
            './photos/WhatsApp Image 2025-05-07 at 19.36.58_785c7d21.jpg',
            './photos/assets_task_01jsre40ccf90v62ex3zv7kk2w_1745650660_img_0.webp',
            './photos/assets_task_01jsrec34geen9zgqe2bdzacdh_1745650921_img_0.webp',
            './photos/assets_task_01jsreeky3ezfbhva3xbsdgeya_1745651002_img_0.webp',
            './photos/assets_task_01jsreh80aeg7tms8ws7hagcbj_1745651085_img_0.webp',
            './photos/assets_task_01jsrekv6ee7hvzchzpx67dprx_1745651180_img_0.webp',
            './photos/assets_task_01jsrg7tjse7886stya3y9d334_1745652912_img_0.webp',
            './photos/assets_task_01jsrgbdcbeffsjfj42mfa5jkc_1745653001_img_1.webp',
            './photos/assets_task_01jtasqa1zeensc750zrtnp7we_1746266806_img_0.webp',
            './photos/assets_task_01jtasx573eep86p447y5ne7qe_1746266993_img_0.webp',
            './photos/assets_task_01jtat91zwesbty8v5xrm6qtpg_1746267385_img_0.webp'
        ];
    }

    // Create floating polaroids
    let photoIndex = 0;

    async function createPolaroid() {
        if (photoIndex >= photos.length) photoIndex = 0;

        const polaroid = document.createElement('div');
        polaroid.className = 'polaroid';

        let photoSrc = photos[photoIndex];

        // Check  if it's a stored file
        if (photoSrc.startsWith('stored:')) {
            const fileName = photoSrc.replace('stored:', '');
            const fileData = await getFileFromDB(fileName);
            if (fileData) {
                photoSrc = fileData.data; // Use data URL
            } else {
                // Skip this photo if file not found
                photoIndex++;
                return;
            }
        }

        polaroid.innerHTML = `
            <div class="polaroid-photo">
                <img src="${photoSrc}" alt="Memory" loading="eager">
            </div>
            <div class="polaroid-caption">💕</div>
        `;

        // Random position and rotation
        polaroid.style.left = (5 + Math.random() * 90) + '%';
        polaroid.style.animationDuration = (12 + Math.random() * 4) + 's';
        polaroid.style.setProperty('--rot', ((Math.random() - 0.5) * 20) + 'deg');

        polaroidContainer.appendChild(polaroid);
        photoIndex++;

        // Remove after animation completes
        setTimeout(() => polaroid.remove(), 20000);
    }

    // Create initial batch immediately
    for (let i = 0; i < 10; i++) {
        setTimeout(() => createPolaroid(), i * 300);
    }

    // Keep creating polaroids
    setInterval(createPolaroid, 1000);
}

function handleThinkAgainEscape(e) {
    unmuteVideo();
    e.preventDefault();
    e.stopPropagation();
    if (isAnimating) {
        moveButtonToSafeSpot(thinkAgainBtn);
        return;
    }
    isAnimating = true;
    moveButtonToSafeSpot(thinkAgainBtn);
    setTimeout(() => isAnimating = false, 150);
}

window.addEventListener('resize', () => {
    const maxX = window.innerWidth - 150;
    const maxY = window.innerHeight - 100;
    if (noBtn.classList.contains('escaping')) {
        let x = parseFloat(noBtn.style.left) || 0;
        let y = parseFloat(noBtn.style.top) || 0;
        noBtn.style.left = Math.max(50, Math.min(maxX, x)) + 'px';
        noBtn.style.top = Math.max(50, Math.min(maxY, y)) + 'px';
    }
    if (thinkAgainBtn.style.position === 'fixed') {
        let x = parseFloat(thinkAgainBtn.style.left) || 0;
        let y = parseFloat(thinkAgainBtn.style.top) || 0;
        thinkAgainBtn.style.left = Math.max(50, Math.min(maxX, x)) + 'px';
        thinkAgainBtn.style.top = Math.max(50, Math.min(maxY, y)) + 'px';
    }
});

// Events
noBtn.addEventListener('mouseenter', escapeButton);
noBtn.addEventListener('mouseover', escapeButton);
noBtn.addEventListener('mousedown', escapeButton);
noBtn.addEventListener('click', escapeButton);
noBtn.addEventListener('touchstart', escapeButton);
noBtn.addEventListener('pointerdown', escapeButton);

thinkAgainBtn.addEventListener('mouseenter', handleThinkAgainEscape);
thinkAgainBtn.addEventListener('mouseover', handleThinkAgainEscape);
thinkAgainBtn.addEventListener('mousedown', handleThinkAgainEscape);
thinkAgainBtn.addEventListener('click', handleThinkAgainEscape);
thinkAgainBtn.addEventListener('touchstart', handleThinkAgainEscape);
thinkAgainBtn.addEventListener('pointerdown', handleThinkAgainEscape);

yesBtn.addEventListener('click', handleYesClick);

// Initialize all background animations
createFloatingHearts();
createFloatingEmojis();
createShootingStars();

// Loading Screen Logic
window.addEventListener('load', () => {
    const preloader = document.getElementById('preloader');
    const video = document.getElementById('bgVideo');

    const hidePreloader = () => {
        if (preloader) {
            preloader.classList.add('fade-out');
            // Remove from DOM after transition
            setTimeout(() => preloader.remove(), 800);
        }
    };

    if (video) {
        // If video is already ready
        if (video.readyState >= 3) {
            hidePreloader();
        } else {
            // Wait for video to be ready to play
            video.addEventListener('canplaythrough', hidePreloader, { once: true });

            // Safety timeout (5 seconds) so it doesn't get stuck forever
            setTimeout(hidePreloader, 5000);
        }
    } else {
        hidePreloader();
    }
});

document.addEventListener('contextmenu', (e) => {
    if (e.target === noBtn || e.target === thinkAgainBtn) e.preventDefault();
});

// Music toggle
let musicMuted = true; // Start muted to allow immediate background video autoplay
function toggleMusic() {
    const video = document.getElementById('bgVideo');
    const btn = document.getElementById('musicToggle');
    musicMuted = !musicMuted;

    video.muted = musicMuted;

    if (musicMuted) {
        btn.textContent = '🔇';
        btn.classList.add('muted');
    } else {
        btn.textContent = '🎵';
        btn.classList.remove('muted');
        // Ensure video is playing when unmuted
        video.play().catch(e => console.log("Video play failed:", e));
    }
}

// Auto-unmute on first user interaction with buttons
let hasUnmuted = false;
const unmuteVideo = () => {
    if (hasUnmuted) return;
    const video = document.getElementById('bgVideo');
    const btn = document.getElementById('musicToggle');
    if (video) {
        video.muted = false;
        musicMuted = false;
        btn.textContent = '🎵';
        btn.classList.remove('muted');
        video.play().catch(e => console.log("Video play failed:", e));
        hasUnmuted = true;
    }
};
