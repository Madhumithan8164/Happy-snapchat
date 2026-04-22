const storyPhotos = [
    { src: 'https://picsum.photos/400/800?random=1', caption: 'Our first trip' },
    { src: 'https://picsum.photos/400/800?random=2', caption: 'That crazy night out' },
    { src: 'https://picsum.photos/400/800?random=3', caption: 'Always matching' },
    { src: 'https://picsum.photos/400/800?random=4', caption: 'The End 🎂' }
];

const overlay = document.getElementById('stories-overlay');
const closeBtn = document.getElementById('close-stories-btn');
const progressContainer = document.querySelector('.stories-progress-container');
const imageEl = document.getElementById('story-image');
const captionEl = document.getElementById('story-caption');
const navLeft = document.getElementById('story-prev');
const navRight = document.getElementById('story-next');

let currentIndex = 0;
let progressFills = [];
let storyInterval;
let startTime;
let currentProgress = 0;
const DURATION = 4000; // 4 seconds per story
let isPaused = false;

function initStories() {
    progressContainer.innerHTML = '';
    progressFills = [];
    
    // Create progress bars
    storyPhotos.forEach((_, i) => {
        const bar = document.createElement('div');
        bar.className = 'story-progress-bar';
        const fill = document.createElement('div');
        fill.className = 'story-progress-fill';
        bar.appendChild(fill);
        progressContainer.appendChild(bar);
        progressFills.push(fill);
    });
}

function openStories() {
    overlay.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    currentIndex = 0;
    initStories();
    showStory(currentIndex);
}

function closeStories() {
    overlay.classList.add('hidden');
    document.body.style.overflow = 'auto';
    stopTimer();
    
    // Trigger confetti if closed after full view
    if (currentIndex === storyPhotos.length - 1) {
        confetti({ particleCount: 150, spread: 100 });
    }
}

function showStory(index) {
    if (index >= storyPhotos.length) {
        closeStories();
        return;
    }
    if (index < 0) index = 0;
    
    currentIndex = index;
    imageEl.src = storyPhotos[index].src;
    captionEl.innerText = storyPhotos[index].caption;
    
    // Update progress bars state
    progressFills.forEach((fill, i) => {
        if (i < index) fill.style.width = '100%';
        else fill.style.width = '0%';
    });
    
    startTimer();
}

function startTimer() {
    stopTimer();
    currentProgress = 0;
    startTime = Date.now();
    isPaused = false;
    
    storyInterval = requestAnimationFrame(updateTimer);
}

function stopTimer() {
    cancelAnimationFrame(storyInterval);
}

function updateTimer() {
    if (isPaused) {
        // adjust start time so it doesn't jump when unpaused
        startTime = Date.now() - (currentProgress * DURATION);
    } else {
        const elapsed = Date.now() - startTime;
        currentProgress = elapsed / DURATION;
        
        if (currentProgress >= 1) {
            showStory(currentIndex + 1);
            return;
        }
        
        if (progressFills[currentIndex]) {
            progressFills[currentIndex].style.width = `${currentProgress * 100}%`;
        }
    }
    storyInterval = requestAnimationFrame(updateTimer);
}

// Navigation Listeners
navLeft.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    showStory(currentIndex - 1);
});

navRight.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    isPaused = true;
});

navRight.addEventListener('pointerup', (e) => {
    e.preventDefault();
    // If it was a quick tap, advance. If it was a long hold, it just unpauses.
    const holdDuration = Date.now() - startTime - (currentProgress * DURATION);
    if (holdDuration < 200) { // arbitrary short threshold for tap
        showStory(currentIndex + 1);
    } else {
        isPaused = false;
    }
});

// Also handle mouse leave/up if held outside
window.addEventListener('pointerup', () => {
    if (isPaused) isPaused = false;
});

closeBtn.addEventListener('click', closeStories);

// Keyboard navigation
document.addEventListener('keydown', (e) => {
    if (overlay.classList.contains('hidden')) return;
    if (e.key === 'ArrowLeft') showStory(currentIndex - 1);
    if (e.key === 'ArrowRight') showStory(currentIndex + 1);
    if (e.key === 'Escape') closeStories();
});

// Expose open function to main.js
window.openStories = openStories;
