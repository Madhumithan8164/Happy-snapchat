gsap.registerPlugin(ScrollTrigger);

const audio = document.getElementById('bg-music');
let isAudioPlaying = false;

// --- Bitmoji Assets ---
const bitmojiImages = [
    "./bitmoji/Snapchat-1676698819-jukebox-bg-removed.png", "./bitmoji/Snapchat-1697531344-jukebox-bg-removed.png",
    "./bitmoji/Snapchat-1836453094-jukebox-bg-removed.png", "./bitmoji/Snapchat-1995222703-jukebox-bg-removed.png",
    "./bitmoji/Snapchat-2040797692-jukebox-bg-removed.png", "./bitmoji/Snapchat-20599618-jukebox-bg-removed.png",
    "./bitmoji/Snapchat-2131012712-jukebox-bg-removed.png", "./bitmoji/Snapchat-213594051-jukebox-bg-removed.png",
    "./bitmoji/Snapchat-249525451-jukebox-bg-removed.png", "./bitmoji/Snapchat-326674843-jukebox-bg-removed.png",
    "./bitmoji/Snapchat-368435613-jukebox-bg-removed.png", "./bitmoji/Snapchat-418628214-jukebox-bg-removed.png",
    "./bitmoji/Snapchat-472616263-jukebox-bg-removed.png", "./bitmoji/Snapchat-501420402-jukebox-bg-removed.png",
    "./bitmoji/Snapchat-514103204-jukebox-bg-removed.png", "./bitmoji/Snapchat-565912179-jukebox-bg-removed.png",
    "./bitmoji/Snapchat-56597769-jukebox-bg-removed.png", "./bitmoji/Snapchat-56632363-jukebox-bg-removed.png",
    "./bitmoji/Snapchat-58827514-jukebox-bg-removed.png", "./bitmoji/Snapchat-596161210-jukebox-bg-removed.png",
    "./bitmoji/Snapchat-632316220-jukebox-bg-removed.png", "./bitmoji/Snapchat-685437527-jukebox-bg-removed.png",
    "./bitmoji/Snapchat-694499648-jukebox-bg-removed.png", "./bitmoji/Snapchat-757712539-jukebox-bg-removed.png",
    "./bitmoji/Snapchat-908449829-jukebox-bg-removed.png", "./bitmoji/Snapchat-919080267-jukebox-bg-removed.png",
    "./bitmoji/Snapchat-937848846-jukebox-bg-removed.png", "./bitmoji/Snapchat-942776850-jukebox-bg-removed.png",
    "./bitmoji/Snapchat-942949081-jukebox-bg-removed.png", "./bitmoji/Snapchat-947641878-jukebox-bg-removed.png"
];

// --- Global Page Transition ---
window.addEventListener('load', () => {
    const transition = document.querySelector('.page-transition');
    
    gsap.to(transition, {
        y: '100%',
        duration: 1.2,
        ease: 'power4.inOut',
        onComplete: () => {
            transition.style.display = 'none';
            initHeroAnimations();
            
            // Show streak bar with delay
            setTimeout(() => {
                const streak = document.getElementById('streak-counter');
                if (streak) streak.classList.remove('hidden');
            }, 1000);
        }
    });

    initStreak();
});

// --- Audio Play on First Interaction ---
document.body.addEventListener('click', () => {
    if (!isAudioPlaying && audio) {
        audio.play().catch(e => console.log("Audio play failed"));
        isAudioPlaying = true;
    }
}, { once: true });


// --- Cursor Trail Canvas ---
const canvas = document.getElementById('cursor-trail');
const ctx = canvas ? canvas.getContext('2d') : null;
if (canvas) {
    document.body.classList.add("custom-cursor-active");
    let mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const dots = Array.from({length: 12}, () => ({ x: mouse.x, y: mouse.y }));

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    window.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });

    function animateCursor() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        let x = mouse.x;
        let y = mouse.y;

        dots.forEach((dot, index) => {
            const nextDot = dots[index + 1] || dots[0];
            dot.x = x;
            dot.y = y;
            ctx.beginPath();
            ctx.arc(dot.x, dot.y, 4, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${1 - index/12})`;
            ctx.fill();
            x += (nextDot.x - x) * 0.4;
            y += (nextDot.y - y) * 0.4;
        });
        requestAnimationFrame(animateCursor);
    }
    animateCursor();
}


// --- FEATURE 1: Hero Animations ---
function initHeroAnimations() {
    const title = document.getElementById('hero-title');
    if (!title) return;
    const content = title.innerHTML;
    title.innerHTML = '';
    
    const lines = content.split('<br>');
    lines.forEach((line, lineIdx) => {
        const lineContainer = document.createElement('div');
        lineContainer.style.display = 'block';
        
        line.split('').forEach(char => {
            const span = document.createElement('span');
            span.innerText = char === ' ' ? '\u00A0' : char;
            lineContainer.appendChild(span);
        });
        
        title.appendChild(lineContainer);
    });

    gsap.to('#hero-title span', {
        y: 0,
        opacity: 1,
        stagger: 0.05,
        duration: 0.8,
        ease: "back.out(1.7)"
    });

    const subtitle = document.getElementById('hero-subtitle');
    if (subtitle) {
        const subText = "Keep smiling, stay happy, and stay as my bestf forever! ✨";
        let i = 0;
        function type() {
            if (i < subText.length) {
                subtitle.innerHTML += subText.charAt(i);
                i++;
                setTimeout(type, 50);
            }
        }
        setTimeout(type, 1000);
    }

    // Bitmoji cycler
    let bitmojiIndex = 0;
    const heroBitmoji = document.getElementById('hero-bitmoji');
    if (heroBitmoji) {
        setInterval(() => {
            bitmojiIndex = (bitmojiIndex + 1) % bitmojiImages.length;
            heroBitmoji.src = bitmojiImages[bitmojiIndex];
        }, 800);
    }
}

const enterBtn = document.getElementById('enter-btn');
if (enterBtn) {
    enterBtn.addEventListener('click', () => {
        document.getElementById('gallery').scrollIntoView({ behavior: 'smooth' });
    });
}


// --- FEATURE 2: Friendship Streak Counter ---
function initStreak() {
    const FRIENDS_SINCE = new Date('2021-01-02'); 
    const days = Math.floor((Date.now() - FRIENDS_SINCE) / 86400000);
    const numEl = document.getElementById('streak-number');
    const chatNumEl = document.getElementById('chat-streak-number');
    if (!numEl && !chatNumEl) return;
    
    const obj = { val: 0 };
    gsap.to(obj, {
        val: days,
        duration: 1.5,
        ease: "power2.out",
        delay: 1.5,
        onUpdate: () => {
            const currentVal = Math.floor(obj.val);
            if (numEl) numEl.innerText = currentVal;
            if (chatNumEl) chatNumEl.innerText = currentVal;
        }
    });
}


// --- Memory Cloud Gallery ---
async function initMemoryCloud() {
    const cloudContainer = document.getElementById('photo-cloud');
    if (!cloudContainer) return;

    let allPhotos = [];
    try {
        const response = await fetch('./photos.json');
        if (response.ok) {
            const data = await response.json();
            const hiddenSnaps = JSON.parse(localStorage.getItem('hiddenSnaps') || '[]');
            Object.keys(data).forEach(year => {
                data[year].forEach(file => {
                    if (!hiddenSnaps.includes(file)) {
                        allPhotos.push(`./${year}/${file}`);
                    }
                });
            });
        }
    } catch (e) {
        console.error("Photos fetch failed, using fallback.");
    }

    // Fallback if no photos found
    if (allPhotos.length === 0) {
        allPhotos = Array.from({length: 20}, (_, i) => `https://picsum.photos/400/500?random=${i}`);
    }

    // Shuffle
    for (let i = allPhotos.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [allPhotos[i], allPhotos[j]] = [allPhotos[j], allPhotos[i]];
    }

    const count = 30;
    const displayPhotos = allPhotos.slice(0, count);

    displayPhotos.forEach((src, index) => {
        console.log(`Creating card ${index} with src: ${src}`);
        const randomBitmoji = bitmojiImages[Math.floor(Math.random() * bitmojiImages.length)];
        const card = document.createElement('div');
        card.className = 'cloud-card';
        card.innerHTML = `
            <div class="card-inner">
                <div class="card-front" style="background-image: url(${randomBitmoji})"></div>
                <div class="card-back" style="background-image: url(${src})"></div>
            </div>
        `;
        
        const sectionCount = 5;
        const band = index % sectionCount;
        const startY = (band * (100 / sectionCount)) + (Math.random() * 5);
        const startX = -200 - (Math.random() * 400); 
        const duration = 15 + Math.random() * 20; 
        const scale = 0.7 + Math.random() * 0.5;
        
        card.style.top = `${startY}%`;
        card.style.left = `${startX}px`;
        card.style.zIndex = 30 + Math.floor(Math.random() * 10);
        card.style.transform = `scale(${scale})`;

        cloudContainer.appendChild(card);

        gsap.to(card, {
            x: window.innerWidth + 800, 
            duration: duration,
            repeat: -1,
            ease: "none",
            delay: Math.random() * 5,
            onRepeat: () => {
                const newPhotoIdx = Math.floor(Math.random() * allPhotos.length);
                const newBitmojiIdx = Math.floor(Math.random() * bitmojiImages.length);
                const back = card.querySelector('.card-back');
                const front = card.querySelector('.card-front');
                if (back) back.style.backgroundImage = `url('${allPhotos[newPhotoIdx]}')`;
                if (front) front.style.backgroundImage = `url('${bitmojiImages[newBitmojiIdx]}')`;
            }
        });

        card.addEventListener('click', () => {
            card.classList.toggle('is-flipped');
        });
    });
}

initMemoryCloud();

// Section Title Slide In
gsap.utils.toArray('.section-title').forEach(title => {
    gsap.from(title, {
        scrollTrigger: {
            trigger: title,
            start: "top 80%",
        },
        y: 50,
        opacity: 0,
        duration: 1,
        ease: "power3.out"
    });
});

// --- FEATURE 5: Chat UI Animations ---
let chatTriggered = false;
ScrollTrigger.create({
    trigger: "#chat-ui",
    start: "top 50%",
    onEnter: () => {
        if (!chatTriggered) {
            chatTriggered = true;
            
            const messages = document.querySelectorAll('.message');
            const chatBody = document.querySelector('.chat-body');
            gsap.to(messages, {
                opacity: 1,
                y: 0,
                duration: 0.5,
                stagger: {
                    each: 0.8,
                    onStart: function() {
                        if (chatBody) {
                            chatBody.scrollTo({
                                top: chatBody.scrollHeight,
                                behavior: 'smooth'
                            });
                        }
                    }
                },
                ease: "back.out(1.5)",
                onComplete: () => {
                    setTimeout(() => {
                        const receipt = document.querySelector('.read-receipt');
                        if (receipt) receipt.classList.remove('hidden');
                        if (chatBody) chatBody.scrollTo({ top: chatBody.scrollHeight, behavior: 'smooth' });
                    }, 1000);
                }
            });
        }
    }
});

// Secret Vault Password trigger
const secretInput = document.getElementById('chat-secret-input');
if (secretInput) {
    secretInput.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') {
            if (secretInput.value.trim() === '69 & 96' || secretInput.value.trim() === '69&96') {
                document.body.classList.add('flash-effect');
                setTimeout(() => {
                    window.location.href = 'memories.html';
                }, 500);
            } else {
                secretInput.style.borderColor = 'red';
                setTimeout(() => secretInput.style.borderColor = '', 1000);
                secretInput.value = '';
            }
        }
    });
}
