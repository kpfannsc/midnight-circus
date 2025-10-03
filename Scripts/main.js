// At the top of main.js
if (window.location.hash) {
  history.replaceState(null, '', window.location.pathname);
}

document.addEventListener("DOMContentLoaded", () => {
  // ===== FAQ accordion =====
  const questions = document.querySelectorAll(".faq-question");
  const answers = document.querySelectorAll(".faq-answer");
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function closeAll() {
    answers.forEach(ans => {
      ans.classList.remove("open");
      ans.style.maxHeight = null;
      ans.style.opacity = null;
    });
    questions.forEach(q => q.setAttribute("aria-expanded", "false"));
  }

  function openAnswer(btn, answer) {
    btn.setAttribute("aria-expanded", "true");
    answer.classList.add("open");
    answer.style.maxHeight = answer.scrollHeight + "px";
    if (prefersReduced) answer.style.maxHeight = "none";
  }

  questions.forEach((btn) => {
    const targetId = btn.getAttribute("aria-controls");
    const answer = document.getElementById(targetId) || btn.nextElementSibling;
    if (!answer) return;

    // Click toggles (single-open)
    btn.addEventListener("click", () => {
      const isOpen = btn.getAttribute("aria-expanded") === "true";
      closeAll();
      if (!isOpen) openAnswer(btn, answer);
    });

    // Keyboard support (Enter/Space)
    btn.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        btn.click();
      }
    });

    // Keep height correct if content wraps/reflows
    const ro = new ResizeObserver(() => {
      if (answer.classList.contains("open") && !prefersReduced) {
        answer.style.maxHeight = answer.scrollHeight + "px";
      }
    });
    ro.observe(answer);
  });

// ===== Fade-in on scroll (replay on every pass) =====
const faders = document.querySelectorAll(".fade-in");
if (!prefersReduced && "IntersectionObserver" in window) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
      } else {
        entry.target.classList.remove("visible");
      }
    });
  }, { threshold: 0.1, rootMargin: "0px 0px -15% 0px" });
  faders.forEach((el) => io.observe(el));
} else {
  faders.forEach((el) => el.classList.add("visible"));
}
// ===== Hero Parallax (translateY on .hero-bg) =====
(function () {
  const layer = document.querySelector('.hero .hero-bg');
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!layer || prefersReduced) return;

  const baseOffset = 0;    // image anchored at top
  const strength   = 0.2;  // adjust motion (0.12 subtle, 0.3 stronger)

  let ticking = false;

  function update() {
    const y = Math.round(window.scrollY * strength) + baseOffset;
    layer.style.transform = `translateY(${y}px)`;
    ticking = false;
  }

  function onScroll() {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(update);
    }
  }

  update();
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
})();


// ===== Nav active link on scroll =====
  const navLinks = Array.from(document.querySelectorAll('nav a[href^="#"]'));
  const sections = Array.from(document.querySelectorAll('main section[id]'));
  const linkById = new Map(navLinks.map(a => [a.getAttribute('href').slice(1), a]));
  function clearActive() { navLinks.forEach(a => a.classList.remove('active')); }
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        const id = entry.target.id;
        const link = linkById.get(id);
        if (!link) return;
        if (entry.isIntersecting) {
          clearActive();
          link.classList.add('active');
          history.replaceState(null, '', `#${id}`);
                    // Mark the section in view for background crossfade
          sections.forEach(s => s.classList.remove('inview'));
          entry.target.classList.add('inview');
        }
      });
    }, { rootMargin: '-40% 0px -55% 0px', threshold: 0.01 });
    sections.forEach(sec => io.observe(sec));
  }

  // ===== Back to Top (optional; leave if you added it) =====
  const backToTop = document.getElementById('backToTop');
  if (backToTop) {
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (window.scrollY > 400) backToTop.classList.add('show');
          else backToTop.classList.remove('show');
          ticking = false;
        });
        ticking = true;
      }
    });
    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }


});
// Countdown Timer
(function(){
  const eventDate = new Date("December 6, 2025 19:00:00"); // 7:00 PM local
  const timerElement = document.getElementById("timer");
  if (!timerElement) return;

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function pad(n){ return String(n).padStart(2, "0"); }

  function diffInMonthsAndDays(from, to){
    // Work from midnight for day math stability
    const start = new Date(from.getFullYear(), from.getMonth(), from.getDate());
    const end   = new Date(to.getFullYear(),   to.getMonth(),   to.getDate());

    let months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());

    // Anchor date = start + months
    let anchor = new Date(start);
    anchor.setMonth(anchor.getMonth() + months);

    // If we overshot (anchor after end), pull back one month
    if (anchor > end) {
      months--;
      anchor = new Date(start);
      anchor.setMonth(anchor.getMonth() + months);
    }

    // Days remainder between anchor and end
    const oneDay = 24 * 60 * 60 * 1000;
    const days = Math.max(0, Math.floor((end - anchor) / oneDay));
    return { months, days };
  }

  function render(){
    const now = new Date();
    const distance = +eventDate - +now;

    if (distance <= 0){
      timerElement.textContent = "The Midnight Circus has begun!";
      clearInterval(tick);
      return;
    }

    const { months, days } = diffInMonthsAndDays(now, eventDate);

    // Time remainder (under a day)
    const hours   = Math.floor((distance % (24*60*60*1000)) / (60*60*1000));
    const minutes = Math.floor((distance % (60*60*1000))   / (60*1000));
    const seconds = Math.floor((distance % (60*1000))      / 1000);

    timerElement.innerHTML = `
      <div class="segment live">
        <span class="value">${months}</span>
        <span class="label">Months</span>
      </div>
      <span class="sep">•</span>
      <div class="segment live">
        <span class="value">${days}</span>
        <span class="label">Days</span>
      </div>
      <span class="sep">|</span>
      <div class="segment">
        <span class="value">${pad(hours)}</span>
        <span class="label">Hours</span>
      </div>
      <div class="segment">
        <span class="value">${pad(minutes)}</span>
        <span class="label">Minutes</span>
      </div>
      <div class="segment">
        <span class="value">${pad(seconds)}</span>
        <span class="label">Seconds</span>
      </div>
    `;

    if (prefersReduced){
      // Remove the subtle lift animation if user prefers less motion
      document.querySelectorAll('#countdown .segment').forEach(el => el.classList.remove('live'));
    }
  }

  const tick = setInterval(render, 1000);
  render();
})();
/* === Style Guide Gallery Logic === */
(function initStyleGuideGallery() {
  const gallery = document.querySelector('.style-gallery');
  if (!gallery) return;

  const track = gallery.querySelector('.sg-track');
  const slides = [...gallery.querySelectorAll('.sg-slide')];
  const prevBtn = gallery.querySelector('.sg-nav.prev');
  const nextBtn = gallery.querySelector('.sg-nav.next');

  let activeIndex = 0;
  let scrollLock = false;

  // Core: set active slide nearest the center of the track viewport
  function updateActive() {
    const rect = track.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;

    let best = { i: 0, d: Infinity };
    slides.forEach((slide, i) => {
      const r = slide.getBoundingClientRect();
      const slideCenter = r.left + r.width / 2;
      const dist = Math.abs(slideCenter - centerX);
      if (dist < best.d) best = { i, d: dist };
    });

    setActive(best.i, false);
  }

  function setActive(i, scrollIntoView = true) {
    if (i < 0 || i >= slides.length) return;
    activeIndex = i;
    slides.forEach((s, idx) => s.classList.toggle('is-active', idx === i));

    // Enable/disable nav buttons at ends
    prevBtn.toggleAttribute('disabled', i === 0);
    nextBtn.toggleAttribute('disabled', i === slides.length - 1);

    if (scrollIntoView && !scrollLock) {
      scrollLock = true;
      slides[i].scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      // unlock after smooth scroll
      setTimeout(() => { scrollLock = false; }, 420);
    }
  }

  // Nav click handlers
  function move(dir) { setActive(activeIndex + dir, true); }
  prevBtn.addEventListener('click', () => move(-1));
  nextBtn.addEventListener('click', () => move(1));

  // Clicking a slide makes it active
  slides.forEach((s, i) => s.addEventListener('click', () => setActive(i, true)));

  // Track scroll -> recompute active (debounced-ish)
  let raf = null;
  track.addEventListener('scroll', () => {
    if (scrollLock) return; // don’t fight programmatic scroll
    if (raf) cancelAnimationFrame(raf);
    raf = requestAnimationFrame(updateActive);
  });

  // Keyboard support when track is focused
  track.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); move(1); }
    if (e.key === 'ArrowLeft')  { e.preventDefault(); move(-1); }
  });

  // Resize -> recalc which slide is centered
  window.addEventListener('resize', () => {
    if (raf) cancelAnimationFrame(raf);
    raf = requestAnimationFrame(updateActive);
  });

  // Initial state: center the first fully visible slide
  setTimeout(() => {
    setActive(0, true);
    // slight delay then recalc in case of fonts/layout shifts
    setTimeout(updateActive, 300);
  }, 0);
})();
window.addEventListener('load', () => {
  setTimeout(() => {
    window.scrollTo(0, 0);
  }, 10);
});

