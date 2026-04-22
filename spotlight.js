// spotlight.js

const feed = document.getElementById('spotlight-feed');

// ── 1. Load & shuffle photos from local json ──
async function loadPhotos() {
  let allPhotos = [];
  
  try {
    const response = await fetch('./photos.json');
    if (response.ok) {
      const yearsData = await response.json();
      
      Object.keys(yearsData).forEach(year => {
        yearsData[year].forEach(fileName => {
          allPhotos.push({
            id: fileName.replace(/[^a-zA-Z0-9]/g, ''),
            src: `./${year}/${fileName}`,
            year: year,
            caption: '',
            isVideo: fileName.toLowerCase().endsWith('.mp4') || fileName.toLowerCase().endsWith('.mov')
          });
        });
      });
    }
  } catch (err) {
    console.error("Error loading photos.json:", err);
  }

  // Fisher-Yates shuffle
  for (let i = allPhotos.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [allPhotos[i], allPhotos[j]] = [allPhotos[j], allPhotos[i]];
  }

  return allPhotos;
}

// ── 2. Build a single Spotlight card ──
function buildCard(photo) {
  const card = document.createElement('div');
  card.className = 'spotlight-card entering';
  card.dataset.photoId = photo.id;

  const reactions = [
    { emoji: '😂' },
    { emoji: '😭' },
    { emoji: '🔥' },
    { emoji: '👻' },
    { emoji: '❤️' },
  ];

  const reactionHTML = reactions.map(r => `
    <div class="emoji-picker-btn" data-emoji="${r.emoji}">
      <span class="emoji">${r.emoji}</span>
    </div>
  `).join('');

  const captionText = photo.caption
    ? `${photo.year} · ${photo.caption}`
    : `${photo.year} Memory`;

  const mediaHTML = photo.isVideo 
    ? `<video class="card-photo" src="${photo.src}" loop muted playsinline autoplay></video>`
    : `<img class="card-photo" src="${photo.src}" loading="lazy" alt="">`;

  card.innerHTML = `
    ${mediaHTML}
    <div class="card-gradient-top"></div>
    <div class="card-gradient-bottom"></div>

    <div class="circular-progress">
      <svg width="32" height="32" viewBox="0 0 32 32">
        <circle class="bg-circle" cx="16" cy="16" r="14"></circle>
        <circle class="progress-circle" cx="16" cy="16" r="14"></circle>
      </svg>
    </div>

    <div class="reaction-rail">
      <div class="emoji-picker hidden">
        ${reactionHTML}
      </div>
      <div class="reaction-btn more-btn">
        <span class="emoji">···</span>
      </div>
    </div>

    <div class="card-info">
      <div class="username-row">
        <div class="user-avatar">
            <img src="./bitmoji/WhatsApp Image 2026-043.32.38.jpeg" alt="Avatar" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">
        </div>
        <span class="username">@bestfriend</span>
      </div>
      <p class="card-caption">${captionText}</p>
    </div>
  `;

  // ── 3. Reaction click logic ──
  const moreBtn = card.querySelector('.more-btn');
  const emojiPicker = card.querySelector('.emoji-picker');

  moreBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    emojiPicker.classList.toggle('hidden');
  });

  card.querySelectorAll('.emoji-picker-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const emoji = btn.dataset.emoji;
      
      launchParticles(emoji, moreBtn);
      emojiPicker.classList.add('hidden');
    });
  });

  card.addEventListener('click', () => {
      emojiPicker.classList.add('hidden');
  });

  // ── Double-tap to heart burst ──
  let lastTap = 0;
  card.addEventListener('touchend', (e) => {
    const now = Date.now();
    if (now - lastTap < 300) {
      const touch = e.changedTouches[0];
      showHeartBurst(touch.clientX, touch.clientY);
    }
    lastTap = now;
  });

  // ── Auto-advance on progress end ──
  const progressCircle = card.querySelector('.progress-circle');
  progressCircle.addEventListener('animationend', () => {
    feed.scrollBy({ top: window.innerHeight, behavior: 'smooth' });
  });

  return card;
}

function showHeartBurst(x, y) {
  const heart = document.createElement('div');
  heart.textContent = '❤️';
  heart.style.cssText = `
    position:fixed;left:${x}px;top:${y}px;
    font-size:64px;pointer-events:none;z-index:9999;
    transform:translate(-50%,-50%) scale(0);
    animation: heartBurst 0.7s ease-out forwards;
  `;
  document.body.appendChild(heart);
  setTimeout(() => heart.remove(), 700);
}

// ── 4. Floating emoji particles ──
function launchParticles(emoji, sourceEl) {
  const rect = sourceEl.getBoundingClientRect();
  const count = 5;
  for (let i = 0; i < count; i++) {
    const p = document.createElement('div');
    p.className = 'float-particle';
    p.textContent = emoji;
    p.style.left = (rect.left + rect.width/2 + (Math.random()-0.5)*40) + 'px';
    p.style.top  = (rect.top  + rect.height/2 + (Math.random()-0.5)*20) + 'px';
    p.style.animationDelay = (i * 70) + 'ms';
    document.body.appendChild(p);
    setTimeout(() => p.remove(), 1400);
  }
}

// ── 5. Intersection Observer ──
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    const card = entry.target;
    if (entry.isIntersecting) {
      card.classList.remove('entering');
      card.classList.add('entered');
      card.classList.add('active-card');
    } else {
      card.classList.remove('entered');
      card.classList.remove('active-card');
      card.classList.add('entering');
    }
  });
}, { threshold: 0.7 });

// ── 6. Infinite scroll ──
let allPhotos = [];
let loadedCount = 0;
const BATCH = 5;

function loadNextBatch() {
  if (allPhotos.length === 0) return;
  
  for (let i = 0; i < BATCH; i++) {
    const photo = allPhotos[loadedCount % allPhotos.length];
    
    // Reshuffle logic
    if (loadedCount > 0 && loadedCount % allPhotos.length === 0) {
      for (let j = allPhotos.length - 1; j > 0; j--) {
        const k = Math.floor(Math.random() * (j + 1));
        [allPhotos[j], allPhotos[k]] = [allPhotos[k], allPhotos[j]];
      }
    }
    
    const card = buildCard(photo);
    feed.appendChild(card);
    observer.observe(card);
    loadedCount++;
  }
}

const endObserver = new IntersectionObserver((entries) => {
  if (entries[0].isIntersecting) loadNextBatch();
}, { rootMargin: '200px' });

// ── 7. Init ──
async function init() {
  allPhotos = await loadPhotos();
  if (allPhotos.length === 0) {
      feed.innerHTML = '<div style="color:white; text-align:center; padding-top:100px;">No memories found. Upload some photos!</div>';
      return;
  }
  
  loadNextBatch();

  const watchLast = () => {
    const cards = feed.querySelectorAll('.spotlight-card');
    if (cards.length > 0) {
      endObserver.disconnect();
      endObserver.observe(cards[cards.length - 1]);
    }
  };
  
  const feedObserver = new MutationObserver(watchLast);
  feedObserver.observe(feed, { childList: true });
  watchLast();
}

init();
