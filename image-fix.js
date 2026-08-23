(function () {
  function markBroken(img) {
    if (!img || img.dataset.imageFixChecked) return;
    img.dataset.imageFixChecked = '1';
    img.addEventListener('error', function () {
      img.classList.add('image-load-error');
      console.warn('[Sri Vidya] Image failed to load:', img.currentSrc || img.src);
    }, { once: true });
  }
  function scan() { document.querySelectorAll('img').forEach(markBroken); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', scan, { once: true });
  else scan();
  new MutationObserver(scan).observe(document.documentElement, {subtree:true, childList:true});
})();
