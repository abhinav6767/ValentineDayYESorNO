// IndexedDB setup for storing files
const DB_NAME = 'ValentineStorage';
const DB_VERSION = 1;
let db;

// Initialize IndexedDB
function initDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
            db = request.result;
            resolve(db);
        };

        request.onupgradeneeded = (event) => {
            db = event.target.result;
            if (!db.objectStoreNames.contains('files')) {
                db.createObjectStore('files', { keyPath: 'name' });
            }
        };
    });
}

// Save file to IndexedDB
function saveFile(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            const transaction = db.transaction(['files'], 'readwrite');
            const store = transaction.objectStore('files');
            const fileData = {
                name: file.name,
                data: reader.result,
                type: file.type
            };
            const request = store.put(fileData);
            request.onsuccess = () => resolve(file.name);
            request.onerror = () => reject(request.error);
        };
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(file);
    });
}

// Update progress bar
function updateProgress(percent, message) {
    const progressBar = document.getElementById('progressBar');
    const progressFill = progressBar.querySelector('.progress-fill');
    const progressText = progressBar.querySelector('.progress-text');

    progressBar.style.display = 'block';
    progressFill.style.width = percent + '%';
    progressText.textContent = message;
}

// Handle form submission
document.getElementById('setupForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const submitBtn = document.querySelector('.btn-submit');
    submitBtn.disabled = true;
    submitBtn.style.opacity = '0.6';

    try {
        // Initialize database
        updateProgress(5, 'Initializing...');
        await initDB();

        //ield</ Get form data
        const recipientName = document.getElementById('recipientName').value;
        const senderName = document.getElementById('senderName').value || 'Your Valentine';
        const musicFile = document.getElementById('backgroundMusic').files[0];
        const photoFiles = Array.from(document.getElementById('photos').files);

        updateProgress(10, 'Preparing files...');

        // Store configuration
        const config = {
            recipientName: recipientName,
            senderName: senderName,
            backgroundMusic: './Video/Perfect.mp4',
            photos: [],
            setupComplete: true,
            useStoredFiles: true
        };

        // Handle music upload with progress
        if (musicFile) {
            updateProgress(20, `Uploading music: ${musicFile.name}...`);
            await saveFile(musicFile);
            config.backgroundMusic = `stored:${musicFile.name}`;
            updateProgress(40, 'Music uploaded!');
        } else {
            updateProgress(40, 'Using default music...');
        }

        // Handle photo uploads with progress
        if (photoFiles.length > 0) {
            const photoPromises = photoFiles.map(async (file, index) => {
                const progress = 40 + ((index + 1) / photoFiles.length) * 50;
                updateProgress(progress, `Uploading photo ${index + 1} of ${photoFiles.length}...`);
                await saveFile(file);
                return `stored:${file.name}`;
            });

            config.photos = await Promise.all(photoPromises);
            updateProgress(90, 'All photos uploaded!');
        } else {
            // Use default photos
            config.photos = [
                './photos/20250425_1107_Girl\'s Slimmer Face_remix_01jsnq4vzrefqvk4cayqbzzx1f.png',
                './photos/20250425_1111_Ghibli Art Stroll_remix_01jsnqcbvdenysb9jfb2bdpdwc.png',
                './photos/20250425_1114_Ghibli Style Reflection_remix_01jsnqhg94fk8b2mtwwqk2d6kk.png'
            ];
            updateProgress(90, 'Using default photos...');
        }

        // Save configuration
        localStorage.setItem('valentineConfig', JSON.stringify(config));

        updateProgress(100, 'Setup complete! Redirecting...');

        // Redirect after a short delay
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);

    } catch (error) {
        console.error('Setup error:', error);
        alert('There was an error during setup. Please try again.');
        submitBtn.disabled = false;
        submitBtn.style.opacity = '1';
        updateProgress(0, 'Error occurred');
    }
});

// Photo preview
document.getElementById('photos').addEventListener('change', function (e) {
    const preview = document.getElementById('photoPreview');
    preview.innerHTML = '';

    const files = e.target.files;
    for (let i = 0; i < Math.min(files.length, 12); i++) {
        const file = files[i];
        const reader = new FileReader();

        reader.onload = function (e) {
            const div = document.createElement('div');
            div.className = 'photo-preview-item';
            div.innerHTML = `<img src="${e.target.result}" alt="Photo ${i + 1}">`;
            preview.appendChild(div);
        };

        reader.readAsDataURL(file);
    }

    if (files.length > 12) {
        const extraText = document.createElement('p');
        extraText.className = 'hint';
        extraText.textContent = `+${files.length - 12} more photos`;
        preview.appendChild(extraText);
    }
});

// Auto-fill from existing config if any
window.addEventListener('load', function () {
    const existingConfig = localStorage.getItem('valentineConfig');
    if (existingConfig) {
        const config = JSON.parse(existingConfig);
        document.getElementById('recipientName').value = config.recipientName || '';
        document.getElementById('senderName').value = config.senderName || '';
    }
});
