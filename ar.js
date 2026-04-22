const startArBtn = document.getElementById('start-ar-btn');
const arContainer = document.getElementById('ar-container');
const closeArBtn = document.getElementById('close-ar-btn');
const fallbackContainer = document.getElementById('fallback-container');
const closeFallbackBtn = document.getElementById('close-fallback-btn');
const fallbackVideo = document.getElementById('fallback-video');
const scanningIndicator = document.querySelector('.scanning-indicator');

// Setup targets
const targets = [
    {
        targetEl: document.getElementById('target1'),
        videoEl: document.getElementById('video1'),
        arVideoEl: document.getElementById('ar-video1'),
        arImageEl: document.getElementById('ar-image1')
    },
    {
        targetEl: document.getElementById('target2'),
        videoEl: document.getElementById('video2'),
        arVideoEl: document.getElementById('ar-video2'),
        arImageEl: document.getElementById('ar-image2')
    }
];

// Handle starting AR
startArBtn.addEventListener('click', () => {
    // Show AR UI
    arContainer.classList.remove('hidden');
    document.body.style.overflow = 'hidden'; // prevent scrolling
    
    // Start MindAR
    const sceneEl = document.querySelector('a-scene');
    if (sceneEl.systems.mindarimage) {
        try {
            sceneEl.systems.mindarimage.start();
        } catch (err) {
            console.warn("Error starting MindAR", err);
            // Fallback to plain video
            fallbackContainer.classList.remove('hidden');
            document.body.style.overflow = 'hidden';
        }
    } else {
        // Fallback
        fallbackContainer.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }
});

// Close AR
closeArBtn.addEventListener('click', () => {
    arContainer.classList.add('hidden');
    document.body.style.overflow = 'auto';
    
    // Stop MindAR
    const sceneEl = document.querySelector('a-scene');
    if (sceneEl.systems.mindarimage) {
        sceneEl.systems.mindarimage.stop();
    }
    
    // Pause all videos
    targets.forEach(t => {
        if (t.videoEl) t.videoEl.pause();
    });
});

// Close Fallback
closeFallbackBtn.addEventListener('click', () => {
    fallbackContainer.classList.add('hidden');
    document.body.style.overflow = 'auto';
    fallbackVideo.pause();
});

// Handle MindAR Target Found / Lost / Ended
targets.forEach(t => {
    if (t.targetEl && t.videoEl) {
        t.targetEl.addEventListener('targetFound', () => {
            console.log("Target found", t.targetEl.id);
            scanningIndicator.classList.add('hidden');
            
            // Show video, hide image
            if (t.arVideoEl) t.arVideoEl.setAttribute('visible', 'true');
            if (t.arImageEl) t.arImageEl.setAttribute('visible', 'false');
            
            t.videoEl.currentTime = 0;
            t.videoEl.play();
        });

        t.targetEl.addEventListener('targetLost', () => {
            console.log("Target lost", t.targetEl.id);
            scanningIndicator.classList.remove('hidden');
            t.videoEl.pause();
        });

        t.videoEl.addEventListener('ended', () => {
            console.log("Video ended", t.targetEl.id);
            // Hide video, show image
            if (t.arVideoEl) t.arVideoEl.setAttribute('visible', 'false');
            if (t.arImageEl) t.arImageEl.setAttribute('visible', 'true');
        });
    }
});
