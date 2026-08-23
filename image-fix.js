(function () {
  const CDN = 'https://cdn.jsdelivr.net/gh/ramcharan291258-bot/Sri-vidya-school@main/';
  const RAW = 'https://raw.githubusercontent.com/ramcharan291258-bot/Sri-vidya-school/main/';

  function isLocalImage(src) {
    return typeof src === 'string' && /^\/images\//.test(src);
  }

  function fileName(src) {
    return src.replace(/^\/images\/(?:items\/)?/, '');
  }

  function fallback(img) {
    if (!img || img.dataset.imageFallbackApplied !== '1') {
      if (!img) return;
      img.dataset.imageFallbackApplied = '1';
      const src = img.getAttribute('src') || '';
      if (!isLocalImage(src)) return;

      const file = fileName(src);
      const cdnUrl = CDN + encodeURI(file);
      const rawUrl = RAW + encodeURI(file);

      img.addEventListener('error', function onCdnError() {
        img.removeEventListener('error', onCdnError);
        img.src = rawUrl;
      }, { once: true });

      img.src = cdnUrl;
    }
  }

  function protect(img) {
    if (!img || !isLocalImage(img.getAttribute('src'))) return;
    img.addEventListener('error', function onError() {
      img.removeEventListener('error', onError);
      fallback(img);
    }, { once: true });
  }

  function scan() {
    document.querySelectorAll('img').forEach(protect);
  }

  const observer = new MutationObserver(scan);
  observer.observe(document.documentElement, {
    subtree: true,
    childList: true,
    attributes: true,
    attributeFilter: ['src']
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', scan, { once: true });
  } else {
    scan();
  }
})();
