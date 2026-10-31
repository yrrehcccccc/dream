(() => {
  const poster = document.querySelector('.directory-poster');
  if (!poster) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const settings = document.querySelector('#settingsPanel');
  let lastScroll = window.scrollY;
  let frame = 0;
  let bottomTimer = 0;
  let navigationTimer = 0;
  let leaving = false;
  let userScroll = false;
  let touchStartY = null;

  function atBottom() {
    return window.scrollY > 0 &&
      document.documentElement.scrollHeight - window.innerHeight - window.scrollY <= 2;
  }

  function canEnter() {
    return !leaving && !settings?.classList.contains('open') && !document.hidden;
  }

  function enterChapter() {
    if (!canEnter()) return;
    leaving = true;
    clearTimeout(bottomTimer);
    document.body.classList.add('chapter-leaving');
    navigationTimer = window.setTimeout(() => {
      try { sessionStorage.setItem('dream-chapter-entry', String(Date.now())); } catch {}
      window.location.assign('00.html');
    }, reducedMotion.matches ? 0 : 520);
  }

  function queueEntry() {
    clearTimeout(bottomTimer);
    if (atBottom() && canEnter()) {
      // Keep the bottom text fully visible for two seconds before dissolving; scrolling up cancels it.
      bottomTimer = window.setTimeout(() => {
        if (atBottom()) enterChapter();
      }, 2000);
    }
  }

  function drawLayers() {
    frame = 0;
    const scroll = Math.max(0, window.scrollY);
    const fadeDistance = Math.max(window.innerHeight, poster.clientWidth) * 1.2;
    // The document moves up by scroll px; +0.7 * scroll leaves 30% speed.
    poster.style.setProperty('--rear-offset', (reducedMotion.matches ? 0 : scroll * 0.7) + 'px');
    poster.style.setProperty('--rear-opacity', reducedMotion.matches ? '1' : String(Math.max(0, 1 - scroll / fadeDistance)));
    if (userScroll && scroll > lastScroll) queueEntry();
    else if (scroll < lastScroll) clearTimeout(bottomTimer);
    lastScroll = scroll;
  }

  function requestDraw() {
    if (!frame) frame = window.requestAnimationFrame(drawLayers);
  }

  window.addEventListener('scroll', requestDraw, { passive: true });
  window.addEventListener('resize', requestDraw, { passive: true });
  reducedMotion.addEventListener('change', requestDraw);
  // Also handle a deliberate further scroll when returning to the poster's end.
  window.addEventListener('wheel', event => {
    if (!poster.contains(event.target)) return;
    userScroll = true;
    if (event.deltaY > 0) queueEntry();
    else if (event.deltaY < 0) clearTimeout(bottomTimer);
  }, { passive: true });
  poster.addEventListener('touchstart', event => {
    userScroll = true;
    touchStartY = event.touches[0]?.clientY ?? null;
  }, { passive: true });
  window.addEventListener('keydown', event => {
    if (['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', 'End', 'Home', ' '].includes(event.key)) userScroll = true;
  });
  window.addEventListener('pointerdown', () => { userScroll = true; }, { passive: true });
  poster.addEventListener('touchend', event => {
    const endY = event.changedTouches[0]?.clientY;
    if (touchStartY !== null && endY !== undefined && touchStartY - endY > 20) queueEntry();
    touchStartY = null;
  }, { passive: true });
  poster.addEventListener('click', event => {
    const link = event.target.closest('a[href="00.html"]');
    if (!link || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    enterChapter();
  });
  window.addEventListener('pageshow', () => {
    // A history return must reveal the directory without sending the reader back.
    clearTimeout(bottomTimer);
    clearTimeout(navigationTimer);
    leaving = false;
    userScroll = false;
    document.body.classList.remove('chapter-leaving');
    lastScroll = window.scrollY;
    requestDraw();
  });
  drawLayers();
})();
