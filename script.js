/**
 * Birthday Celebration Interactive Engine for Madhulu
 * Date: 03/11/2026
 * Theme: White and Pink Romantic Flow
 * Features:
 *   1. Cupid's Archery & Splitting Heart
 *   2. 3D Layered Birthday Cake with Flickering Candles
 *   3. 5 Floating Surprise Balloons with 5 Heartfelt Compliments
 *   4. Cherished Photo Memories (5 Real Photos) & Lightbox
 *   5. Love Letter to Madhulu & Grand "I LOVE YOU" Heartbeat Seal
 *   6. "I Wanna Be Yours" Audio Player & Falling Sakura Petals Background
 */

document.addEventListener('DOMContentLoaded', () => {
  // ================= STATE & REFS =================
  const state = {
    currentStage: 1,
    maxReachedStage: 1,
    heartShot: false,
    cakeStep: 0, // 0: none, 1: base, 2: middle, 3: top, 4: candles & topper, 5: blown
    candlesBlown: 0,
    totalCandles: 5,
    poppedBalloons: new Set(),
    activePhotoIndex: 0,
    photos: [
      {
        src: 'assets/images/photo1.jpg',
        title: 'Madhulu & Me, Always Together 💖',
        date: '03/11/2026',
        rotation: 0
      },
      {
        src: 'assets/images/photo2.jpg',
        title: 'Madhulu\'s Beautiful Butterfly Glow ✨',
        date: '03/11/2026',
        rotation: 0
      },
      {
        src: 'assets/images/photo3.jpg',
        title: 'The Cutest Smile in the World 🥰',
        date: '03/11/2026',
        rotation: 0
      },
      {
        src: 'assets/images/photo4.jpg',
        title: 'Sweetest Soul & Innocent Eyes 🌸',
        date: '03/11/2026',
        rotation: 0
      },
      {
        src: 'assets/images/photo5.jpg',
        title: 'Happy Birthday, My Entire World! 🎂',
        date: '03/11/2026 • Forever Yours',
        rotation: 0,
        isFeatured: true
      }
    ]
  };

  // Safe confetti helper with pure DOM particle fallback
  const fireConfetti = (opts = {}) => {
    if (typeof confetti === 'function') {
      confetti({
        origin: { y: 0.7 },
        spread: 70,
        ticks: 200,
        ...opts
      });
      return;
    }

    // Fallback: spawn celebratory colorful confetti DOM flakes
    const count = opts.particleCount || 40;
    const colors = opts.colors || ['#ff4071', '#f472b6', '#fbcfe8', '#fb7185', '#ffffff'];
    const originX = (opts.origin && opts.origin.x !== undefined ? opts.origin.x : 0.5) * window.innerWidth;
    const originY = (opts.origin && opts.origin.y !== undefined ? opts.origin.y : 0.6) * window.innerHeight;

    for (let i = 0; i < count; i++) {
      const piece = document.createElement('div');
      piece.style.position = 'fixed';
      piece.style.left = `${originX}px`;
      piece.style.top = `${originY}px`;
      piece.style.width = `${Math.random() * 8 + 6}px`;
      piece.style.height = `${Math.random() * 12 + 6}px`;
      piece.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      piece.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
      piece.style.pointerEvents = 'none';
      piece.style.zIndex = '9999';
      piece.style.transition = 'transform 1.2s cubic-bezier(0.1, 0.8, 0.3, 1), opacity 1.2s ease';
      document.body.appendChild(piece);

      const angle = Math.random() * Math.PI * 2;
      const velocity = Math.random() * 220 + 70;
      const destX = Math.cos(angle) * velocity;
      const destY = Math.sin(angle) * velocity + 130;
      const rot = (Math.random() - 0.5) * 720;

      requestAnimationFrame(() => {
        piece.style.transform = `translate(${destX}px, ${destY}px) rotate(${rot}deg) scale(${Math.random() * 0.5 + 0.5})`;
        piece.style.opacity = '0';
      });

      setTimeout(() => {
        piece.remove();
      }, 1300);
    }
  };

  // ================= STAGE NAVIGATION =================
  const stageSections = {
    1: document.getElementById('stage-1'),
    2: document.getElementById('stage-2'),
    3: document.getElementById('stage-3'),
    4: document.getElementById('stage-4')
  };

  const stepNavBtns = {
    1: document.getElementById('step-nav-1'),
    2: document.getElementById('step-nav-2'),
    3: document.getElementById('step-nav-3'),
    4: document.getElementById('step-nav-4')
  };

  function switchStage(targetStage) {
    if (targetStage < 1 || targetStage > 4) return;

    state.currentStage = targetStage;
    if (targetStage > state.maxReachedStage) {
      state.maxReachedStage = targetStage;
    }

    Object.keys(stageSections).forEach(s => {
      const num = parseInt(s);
      if (num === targetStage) {
        stageSections[num]?.classList.add('active');
      } else {
        stageSections[num]?.classList.remove('active');
      }
    });

    Object.keys(stepNavBtns).forEach(s => {
      const num = parseInt(s);
      const btn = stepNavBtns[num];
      if (!btn) return;
      if (num === targetStage) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }

      if (num < targetStage) {
        btn.classList.add('completed');
      }
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (window.birthdayAudio) {
      window.birthdayAudio.playSparkle();
    }
  }

  // Stepper clicks
  Object.keys(stepNavBtns).forEach(s => {
    const num = parseInt(s);
    stepNavBtns[num]?.addEventListener('click', () => {
      switchStage(num);
    });
  });

  // Stage transition buttons
  document.getElementById('to-stage-2-btn')?.addEventListener('click', () => switchStage(2));
  document.getElementById('to-stage-3-btn')?.addEventListener('click', () => switchStage(3));
  document.getElementById('to-stage-4-btn')?.addEventListener('click', () => switchStage(4));
  document.getElementById('replay-journey-btn')?.addEventListener('click', () => {
    resetHeartStage();
    switchStage(1);
  });

  // ================= MUSIC CONTROLS ("I WANNA BE YOURS") =================
  const musicPill = document.getElementById('music-pill');
  const musicPlayBtn = document.getElementById('music-play-btn');
  const musicPlayIcon = document.getElementById('music-play-icon');
  const musicTrackInfo = document.getElementById('music-track-info');
  const trackTitle = document.getElementById('track-title');
  const songFileInput = document.getElementById('song-file-input');
  const soundToggleBtn = document.getElementById('sound-toggle-btn');
  const soundIcon = document.getElementById('sound-icon');

  function updateMusicUI(isPlaying) {
    if (isPlaying) {
      musicPill?.classList.add('playing');
      if (musicPlayIcon) musicPlayIcon.textContent = '⏸';
      musicPlayBtn?.setAttribute('title', "Pause 'I Wanna Be Yours'");
    } else {
      musicPill?.classList.remove('playing');
      if (musicPlayIcon) musicPlayIcon.textContent = '▶';
      musicPlayBtn?.setAttribute('title', "Play 'I Wanna Be Yours'");
    }
  }

  // Toggle play/pause
  const toggleMusicAction = () => {
    if (!window.birthdayAudio) return;
    const isPlaying = window.birthdayAudio.toggleMusic();
    updateMusicUI(isPlaying);
  };

  musicPlayBtn?.addEventListener('click', toggleMusicAction);
  musicTrackInfo?.addEventListener('click', toggleMusicAction);

  // Listen to audio engine events
  window.addEventListener('bgPlayStateChanged', (e) => {
    updateMusicUI(e.detail.isPlaying);
  });

  window.addEventListener('bgSongChanged', (e) => {
    if (trackTitle && e.detail && e.detail.title) {
      trackTitle.textContent = e.detail.title;
    }
  });

  // Handle local song import
  songFileInput?.addEventListener('change', (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    if (window.birthdayAudio) {
      window.birthdayAudio.loadUserAudioFile(file);
      if (trackTitle) trackTitle.textContent = file.name;
      fireConfetti({ particleCount: 50, spread: 60 });
    }
  });

  // Toggle sound effects
  soundToggleBtn?.addEventListener('click', () => {
    if (!window.birthdayAudio) return;
    const soundOn = window.birthdayAudio.toggleSound();
    if (soundIcon) soundIcon.textContent = soundOn ? '🔊' : '🔇';
    soundToggleBtn.title = soundOn ? 'Sound FX: Enabled' : 'Sound FX: Muted';
  });

  // Autoplay music on first user interaction (browser policy)
  const startMusicOnFirstInteraction = () => {
    if (window.birthdayAudio && !window.birthdayAudio.isPlayingMusic) {
      window.birthdayAudio.playMusic();
    }
    document.removeEventListener('pointerdown', startMusicOnFirstInteraction);
  };
  document.addEventListener('pointerdown', startMusicOnFirstInteraction, { once: true });

  // ================= STAGE 1: ARCHERY & HEART LOGIC FOR MADHULU =================
  const arena = document.getElementById('archery-arena');
  const heartTarget = document.getElementById('heart-target');
  const bowRig = document.getElementById('bow-rig');
  const bowStringPath = document.getElementById('bow-string-path');
  const loadedArrow = document.getElementById('loaded-arrow');
  const arrowProjectile = document.getElementById('arrow-projectile');
  const unfoldedSecret = document.getElementById('unfolded-secret');
  const quickShootBtn = document.getElementById('quick-shoot-btn');

  let isDraggingBow = false;
  let dragStartY = 0;

  function resetHeartStage() {
    state.heartShot = false;
    heartTarget?.classList.remove('split');
    unfoldedSecret?.classList.remove('revealed');
    if (arrowProjectile) {
      arrowProjectile.classList.remove('flying');
      arrowProjectile.style.display = 'none';
    }
    if (loadedArrow) {
      loadedArrow.style.opacity = '1';
      loadedArrow.style.transform = 'translate(-50%, -50%) rotate(-90deg) translateY(0px)';
    }
    bowStringPath?.setAttribute('d', 'M 20 70 L 100 70 L 180 70');
  }

  // Execute Arrow Shot
  function shootArrowAtHeart() {
    if (state.heartShot || !arena || !bowRig || !heartTarget || !arrowProjectile || !loadedArrow) return;
    state.heartShot = true;

    if (window.birthdayAudio) {
      window.birthdayAudio.playArrowWhoosh();
    }

    loadedArrow.style.opacity = '0';

    const arenaRect = arena.getBoundingClientRect();
    const bowRect = bowRig.getBoundingClientRect();
    const targetRect = heartTarget.getBoundingClientRect();

    const startX = bowRect.left + bowRect.width / 2 - arenaRect.left;
    const startY = bowRect.top + bowRect.height / 2 - arenaRect.top;

    const targetX = targetRect.left + targetRect.width / 2 - arenaRect.left;
    const targetY = targetRect.top + targetRect.height / 2 - arenaRect.top;

    arrowProjectile.style.display = 'block';
    arrowProjectile.style.left = `${startX}px`;
    arrowProjectile.style.top = `${startY}px`;
    arrowProjectile.classList.add('flying');

    const flightDuration = 420;
    const startTime = performance.now();

    function stepFlight(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / flightDuration, 1);
      const easeProgress = Math.pow(progress, 1.8);

      const curX = startX + (targetX - startX) * progress;
      const curY = startY + (targetY - startY) * easeProgress;

      arrowProjectile.style.left = `${curX}px`;
      arrowProjectile.style.top = `${curY}px`;

      if (progress < 1) {
        requestAnimationFrame(stepFlight);
      } else {
        onHeartImpact(targetRect);
      }
    }

    requestAnimationFrame(stepFlight);
  }

  function onHeartImpact(targetRect) {
    if (arrowProjectile) arrowProjectile.style.display = 'none';

    if (window.birthdayAudio) {
      window.birthdayAudio.playHeartHit();
    }

    heartTarget?.classList.add('split');

    const xRatio = (targetRect.left + targetRect.width / 2) / window.innerWidth;
    const yRatio = (targetRect.top + targetRect.height / 2) / window.innerHeight;

    fireConfetti({
      particleCount: 90,
      spread: 90,
      origin: { x: xRatio, y: yRatio },
      colors: ['#ff4071', '#f472b6', '#ffe4e6', '#fb7185', '#ffffff']
    });

    setTimeout(() => {
      unfoldedSecret?.classList.add('revealed');
      fireConfetti({
        particleCount: 50,
        spread: 60,
        origin: { x: xRatio, y: yRatio - 0.1 }
      });
    }, 450);
  }

  quickShootBtn?.addEventListener('click', shootArrowAtHeart);

  heartTarget?.addEventListener('click', () => {
    if (!state.heartShot) shootArrowAtHeart();
  });

  bowRig?.addEventListener('pointerdown', (e) => {
    if (state.heartShot) return;
    isDraggingBow = true;
    dragStartY = e.clientY;
    bowRig.setPointerCapture(e.pointerId);
  });

  bowRig?.addEventListener('pointermove', (e) => {
    if (!isDraggingBow || state.heartShot || !bowStringPath || !loadedArrow) return;
    const deltaY = Math.max(0, Math.min(e.clientY - dragStartY, 40));
    bowStringPath.setAttribute('d', `M 20 70 L 100 ${70 + deltaY} L 180 70`);
    loadedArrow.style.transform = `translate(-50%, -50%) rotate(-90deg) translateY(${-deltaY}px)`;
  });

  const finishDrag = (e) => {
    if (!isDraggingBow || state.heartShot) return;
    isDraggingBow = false;
    const currentY = e.clientY !== undefined ? e.clientY : dragStartY;
    const deltaY = Math.max(0, Math.min(currentY - dragStartY, 40));
    if (deltaY > 15) {
      shootArrowAtHeart();
    } else {
      bowStringPath?.setAttribute('d', 'M 20 70 L 100 70 L 180 70');
      if (loadedArrow) {
        loadedArrow.style.transform = 'translate(-50%, -50%) rotate(-90deg) translateY(0px)';
      }
    }
  };

  bowRig?.addEventListener('pointerup', finishDrag);
  bowRig?.addEventListener('pointercancel', finishDrag);

  // ================= STAGE 2: ANIMATED LAYERED CAKE FOR MADHULU =================
  const cakeTier1 = document.getElementById('cake-tier-1');
  const cakeTier2 = document.getElementById('cake-tier-2');
  const cakeTier3 = document.getElementById('cake-tier-3');
  const cakeCandles = document.getElementById('cake-candles');
  const cakeTopperBanner = document.getElementById('cake-topper-banner');
  const nextLayerBtn = document.getElementById('next-layer-btn');
  const cakeBtnText = document.getElementById('cake-btn-text');
  const blowCandlesBtn = document.getElementById('blow-candles-btn');
  const wishRevealCard = document.getElementById('wish-reveal-card');
  const cakeStepDots = document.querySelectorAll('.cake-step-dot');
  const cakeInstructionText = document.getElementById('cake-instruction-text');
  const candleElements = document.querySelectorAll('.candle');

  function updateCakeStepIndicator(step) {
    cakeStepDots.forEach(dot => {
      const dStep = parseInt(dot.getAttribute('data-step'));
      if (dStep === step) {
        dot.classList.add('active');
        dot.classList.remove('done');
      } else if (dStep < step) {
        dot.classList.add('done');
        dot.classList.remove('active');
      } else {
        dot.classList.remove('active', 'done');
      }
    });
  }

  function advanceCakeStep() {
    state.cakeStep++;

    if (state.cakeStep === 1) {
      cakeTier1?.classList.add('dropped');
      if (window.birthdayAudio) window.birthdayAudio.playCakeLayer(1);
      updateCakeStepIndicator(2);
      if (cakeBtnText) cakeBtnText.textContent = 'Stack Layer 2 (Strawberry Velvet) 🍓';
      if (cakeInstructionText) cakeInstructionText.textContent = 'Rich Belgian truffle base placed! Stack the middle tier for Madhulu!';
    } else if (state.cakeStep === 2) {
      cakeTier2?.classList.add('dropped');
      if (window.birthdayAudio) window.birthdayAudio.playCakeLayer(2);
      updateCakeStepIndicator(3);
      if (cakeBtnText) cakeBtnText.textContent = 'Stack Layer 3 (Vanilla Dream) 🍥';
      if (cakeInstructionText) cakeInstructionText.textContent = 'Strawberry velvet cream added! Stack the top tier for Madhulu!';
    } else if (state.cakeStep === 3) {
      cakeTier3?.classList.add('dropped');
      if (window.birthdayAudio) window.birthdayAudio.playCakeLayer(3);
      updateCakeStepIndicator(4);
      if (cakeBtnText) cakeBtnText.textContent = 'Add Topper & Candles 🕯️';
      if (cakeInstructionText) cakeInstructionText.textContent = 'Top tier settled with fresh berries! Add topper and glowing candles!';
    } else if (state.cakeStep === 4) {
      cakeCandles?.classList.add('dropped');
      cakeTopperBanner?.classList.add('dropped');
      if (window.birthdayAudio) window.birthdayAudio.playSparkle();
      updateCakeStepIndicator(5);

      if (nextLayerBtn) nextLayerBtn.style.display = 'none';
      if (blowCandlesBtn) blowCandlesBtn.style.display = 'inline-flex';
      if (cakeInstructionText) cakeInstructionText.textContent = 'Candles are glowing! Tap the candles or click Blow Out to make a wish for Madhulu! 🌬️';

      fireConfetti({ particleCount: 40, spread: 60 });
    }
  }

  nextLayerBtn?.addEventListener('click', advanceCakeStep);

  candleElements.forEach(candle => {
    candle.addEventListener('click', () => {
      if (!candle.classList.contains('blown-out')) {
        candle.classList.add('blown-out');
        state.candlesBlown++;
        if (window.birthdayAudio) window.birthdayAudio.playCandleBlow();

        if (state.candlesBlown >= state.totalCandles) {
          triggerWishCelebration();
        }
      }
    });
  });

  blowCandlesBtn?.addEventListener('click', () => {
    candleElements.forEach((c, idx) => {
      setTimeout(() => {
        if (!c.classList.contains('blown-out')) {
          c.classList.add('blown-out');
          if (window.birthdayAudio) window.birthdayAudio.playCandleBlow();
        }
      }, idx * 120);
    });

    state.candlesBlown = state.totalCandles;
    setTimeout(() => {
      triggerWishCelebration();
    }, 650);
  });

  function triggerWishCelebration() {
    if (blowCandlesBtn) blowCandlesBtn.style.display = 'none';
    if (cakeInstructionText) cakeInstructionText.textContent = '✨ Madhulu\'s wish has been granted and sent to the heavens! ✨';

    if (window.birthdayAudio) {
      window.birthdayAudio.playFanfare();
    }

    fireConfetti({
      particleCount: 110,
      spread: 100,
      origin: { y: 0.6 },
      colors: ['#ff4071', '#f472b6', '#ffffff', '#fb7185', '#ffd166']
    });

    setTimeout(() => {
      wishRevealCard?.classList.add('revealed');
    }, 500);
  }

  // ================= STAGE 3: 5 BALLOONS WITH COMPLIMENTS FOR MADHULU =================
  const balloonItems = document.querySelectorAll('.balloon-item');
  const poppedCountSpan = document.getElementById('popped-count');
  const balloonProgressFill = document.getElementById('balloon-progress-fill');
  const unlockStatus = document.getElementById('unlock-status');
  const stage3FinishArea = document.getElementById('stage-3-finish-area');

  balloonItems.forEach(item => {
    const id = parseInt(item.getAttribute('data-id'));
    const color = item.style.getPropertyValue('--balloon-color') || '#ff4071';

    item.addEventListener('click', () => {
      if (state.poppedBalloons.has(id)) return;
      state.poppedBalloons.add(id);

      if (window.birthdayAudio) window.birthdayAudio.playBalloonPop();

      item.classList.add('popped');

      const rect = item.getBoundingClientRect();
      const x = (rect.left + rect.width / 2) / window.innerWidth;
      const y = (rect.top + rect.height / 2) / window.innerHeight;

      fireConfetti({
        particleCount: 50,
        spread: 60,
        origin: { x, y },
        colors: [color, '#ffffff', '#fbcfe8']
      });

      const compCard = document.getElementById(`compliment-${id}`);
      if (compCard) {
        compCard.classList.remove('locked');
        compCard.classList.add('unlocked');
        const badge = compCard.querySelector('.card-status-badge');
        if (badge) badge.textContent = 'Unlocked ✨';
      }

      const count = state.poppedBalloons.size;
      if (poppedCountSpan) poppedCountSpan.textContent = count;
      if (balloonProgressFill) balloonProgressFill.style.width = `${(count / 5) * 100}%`;

      if (count === 5) {
        if (unlockStatus) unlockStatus.textContent = '🎉 All 5 Sentences Unlocked for Madhulu!';
        if (window.birthdayAudio) window.birthdayAudio.playFanfare();

        fireConfetti({
          particleCount: 120,
          spread: 100,
          origin: { y: 0.5 },
          colors: ['#ff4071', '#f472b6', '#ffffff', '#fb7185', '#ffd166']
        });

        if (stage3FinishArea) {
          stage3FinishArea.style.display = 'flex';
          stage3FinishArea.scrollIntoView({ behavior: 'smooth' });
        }
      }
    });
  });

  // ================= STAGE 4: MEMORIES GALLERY & LETTER TO MADHULU =================
  const polaroidGrid = document.getElementById('polaroid-grid');
  const lightboxModal = document.getElementById('lightbox-modal');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxTitle = document.getElementById('lightbox-title');
  const lightboxDate = document.getElementById('lightbox-date');
  const lightboxCloseBtn = document.getElementById('lightbox-close-btn');
  const lightboxBackdrop = document.getElementById('lightbox-backdrop');
  const lightboxPrevBtn = document.getElementById('lightbox-prev-btn');
  const lightboxNextBtn = document.getElementById('lightbox-next-btn');
  const grandCelebrateBtn = document.getElementById('grand-celebrate-btn');
  const letterContent = document.getElementById('letter-content');
  const iLoveYouSealBtn = document.getElementById('i-love-you-seal-btn');

  // Load custom letter if present
  try {
    const savedLetter = localStorage.getItem('bday_custom_letter_madhulu');
    if (savedLetter && letterContent) {
      letterContent.innerHTML = savedLetter;
    }
  } catch (e) {}

  letterContent?.addEventListener('input', () => {
    try {
      localStorage.setItem('bday_custom_letter_madhulu', letterContent.innerHTML);
    } catch (e) {}
  });

  // Render the 5 Polaroid Memories
  function renderPolaroids() {
    if (!polaroidGrid) return;
    polaroidGrid.innerHTML = '';
    const rotations = [-2.5, 2.8, -1.8, 3.2, -1.2];

    state.photos.forEach((photo, idx) => {
      const rot = rotations[idx % rotations.length];
      const card = document.createElement('div');
      card.className = `polaroid-card ${photo.isFeatured ? 'polaroid-featured' : ''}`;
      card.setAttribute('data-index', idx);
      card.style.setProperty('--rotation', `${rot}deg`);

      const photoRot = photo.rotation || 0;
      const frameClass = photo.isFeatured ? 'polaroid-photo-frame frame-featured' : 'polaroid-photo-frame';

      card.innerHTML = `
        <div class="pin">📌</div>
        <div class="${frameClass}">
          <img src="${photo.src}" alt="${photo.title}" class="polaroid-img" style="transform: scale(1.02) rotate(${photoRot}deg);" loading="lazy">
        </div>
        <div class="polaroid-caption">
          <p class="caption-handwritten">${photo.title}</p>
          <span class="caption-date">${photo.date}</span>
        </div>
      `;

      card.addEventListener('click', () => {
        openLightbox(idx);
      });

      polaroidGrid.appendChild(card);
    });
  }

  renderPolaroids();

  // Lightbox Modal Logic
  function openLightbox(index) {
    state.activePhotoIndex = index;
    const photo = state.photos[index];
    if (!photo || !lightboxModal || !lightboxImg) return;

    lightboxImg.src = photo.src;
    lightboxImg.style.transform = `rotate(${photo.rotation || 0}deg)`;
    if (lightboxTitle) lightboxTitle.textContent = photo.title;
    if (lightboxDate) lightboxDate.textContent = photo.date;
    lightboxModal.classList.add('active');
    if (window.birthdayAudio) window.birthdayAudio.playSparkle();
  }

  function closeLightbox() {
    lightboxModal?.classList.remove('active');
  }

  function showNextPhoto() {
    let nextIdx = state.activePhotoIndex + 1;
    if (nextIdx >= state.photos.length) nextIdx = 0;
    openLightbox(nextIdx);
  }

  function showPrevPhoto() {
    let prevIdx = state.activePhotoIndex - 1;
    if (prevIdx < 0) prevIdx = state.photos.length - 1;
    openLightbox(prevIdx);
  }

  lightboxCloseBtn?.addEventListener('click', closeLightbox);
  lightboxBackdrop?.addEventListener('click', closeLightbox);
  lightboxNextBtn?.addEventListener('click', showNextPhoto);
  lightboxPrevBtn?.addEventListener('click', showPrevPhoto);

  window.addEventListener('keydown', (e) => {
    if (!lightboxModal?.classList.contains('active')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowRight') showNextPhoto();
    if (e.key === 'ArrowLeft') showPrevPhoto();
  });

  // ================= "I LOVE YOU, MADHULU" SEAL INTERACTION =================
  iLoveYouSealBtn?.addEventListener('click', () => {
    if (window.birthdayAudio) {
      window.birthdayAudio.playHeartHit();
      window.birthdayAudio.playSparkle();
    }

    const rect = iLoveYouSealBtn.getBoundingClientRect();
    const originX = (rect.left + rect.width / 2) / window.innerWidth;
    const originY = (rect.top + rect.height / 2) / window.innerHeight;

    // Shower of rose, blush, white, and gold confetti
    fireConfetti({
      particleCount: 100,
      spread: 90,
      origin: { x: originX, y: originY },
      colors: ['#ff4071', '#f472b6', '#ffffff', '#fb7185', '#ffd700']
    });

    // Spawn 20 floating love heart DOM particles rising up
    for (let i = 0; i < 22; i++) {
      const heart = document.createElement('div');
      heart.textContent = Math.random() > 0.4 ? '💖' : '🌸';
      heart.style.position = 'fixed';
      heart.style.left = `${rect.left + rect.width / 2 + (Math.random() - 0.5) * 100}px`;
      heart.style.top = `${rect.top}px`;
      heart.style.fontSize = `${Math.random() * 22 + 18}px`;
      heart.style.pointerEvents = 'none';
      heart.style.zIndex = '99999';
      heart.style.transition = 'transform 2.2s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 2.2s ease';
      document.body.appendChild(heart);

      const offsetX = (Math.random() - 0.5) * 280;
      const offsetY = -(Math.random() * 340 + 160);

      requestAnimationFrame(() => {
        heart.style.transform = `translate(${offsetX}px, ${offsetY}px) scale(${Math.random() * 0.8 + 0.8}) rotate(${(Math.random() - 0.5) * 60}deg)`;
        heart.style.opacity = '0';
      });

      setTimeout(() => heart.remove(), 2300);
    }
  });

  // Grand Celebration Fireworks Blast
  grandCelebrateBtn?.addEventListener('click', () => {
    if (window.birthdayAudio) {
      window.birthdayAudio.playFanfare();
      if (!window.birthdayAudio.isPlayingMusic) {
        window.birthdayAudio.playMusic();
      }
    }

    const duration = 5 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 1000 };

    function randomInRange(min, max) {
      return Math.random() * (max - min) + min;
    }

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();
      if (timeLeft <= 0) {
        return clearInterval(interval);
      }
      const particleCount = 50 * (timeLeft / duration);
      if (typeof confetti === 'function') {
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }, colors: ['#ff4071', '#f472b6', '#ffffff', '#ffd700'] });
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }, colors: ['#ff4071', '#f472b6', '#ffffff', '#ffd700'] });
      }
    }, 250);
  });

  // ================= AMBIENT CANVAS BACKGROUND (FALLING SAKURA & HEARTS) =================
  const canvas = document.getElementById('ambient-canvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    window.addEventListener('resize', () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    });

    const particles = [];
    const count = 48;

    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 9 + 6,
        alpha: Math.random() * 0.55 + 0.2,
        speedY: Math.random() * 0.65 + 0.25,
        speedX: Math.sin(Math.random() * Math.PI) * 0.35,
        angle: Math.random() * 360,
        spin: (Math.random() - 0.5) * 1.2,
        type: Math.random() > 0.4 ? 'petal' : (Math.random() > 0.5 ? 'heart' : 'sparkle'),
        color: Math.random() > 0.5 ? '#f472b6' : '#ff758c'
      });
    }

    function drawPetal(ctx, p) {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.angle * Math.PI) / 180);
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(p.size / 2, -p.size / 2, p.size, 0, 0, p.size * 1.3);
      ctx.bezierCurveTo(-p.size, 0, -p.size / 2, -p.size / 2, 0, 0);
      ctx.fill();
      ctx.restore();
    }

    function drawFaintHeart(ctx, p) {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.angle * 0.3 * Math.PI) / 180);
      ctx.globalAlpha = p.alpha * 0.7;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      const s = p.size * 0.75;
      ctx.moveTo(0, s * 0.3);
      ctx.bezierCurveTo(0, 0, -s / 2, 0, -s / 2, s * 0.3);
      ctx.bezierCurveTo(-s / 2, (s + s * 0.3) / 2, 0, s, 0, s);
      ctx.bezierCurveTo(0, s, s / 2, (s + s * 0.3) / 2, s / 2, s * 0.3);
      ctx.bezierCurveTo(s / 2, 0, 0, 0, 0, s * 0.3);
      ctx.fill();
      ctx.restore();
    }

    function drawSparkle(ctx, p) {
      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = 'rgba(255, 182, 193, 0.85)';
      ctx.shadowBlur = 6;
      ctx.shadowColor = 'rgba(244, 114, 182, 0.6)';
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * 0.22, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    function renderAmbient() {
      ctx.clearRect(0, 0, width, height);

      particles.forEach(p => {
        p.y += p.speedY;
        p.x += Math.sin((p.y + p.angle) * 0.012) * 0.5 + p.speedX;
        p.angle += p.spin;

        if (p.y > height + 25) {
          p.y = -20;
          p.x = Math.random() * width;
        }

        if (p.type === 'petal') {
          drawPetal(ctx, p);
        } else if (p.type === 'heart') {
          drawFaintHeart(ctx, p);
        } else {
          drawSparkle(ctx, p);
        }
      });

      requestAnimationFrame(renderAmbient);
    }

    renderAmbient();
  }
});
