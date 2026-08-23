(function () {
  'use strict';

  // The production repository stores its bundled assets at the repository root
  // (for example /hero-campus.png and /campus-original.jpeg), while some of
  // the older CMS/default data still contains the legacy /images/... prefix.
  // Normalize that legacy prefix at the DOM boundary so CMS updates can never
  // make an otherwise valid local asset disappear.
  function normalizeLocalAsset(value) {
    if (typeof value !== 'string') return value;
    const v = value.trim();
    if (!v) return v;
    if (/^(https?:|data:|blob:|mailto:|tel:|#)/i.test(v)) return v;
    if (v.startsWith('/images/')) return v.slice('/images'.length);
    if (v.startsWith('images/')) return '/' + v.slice('images/'.length);
    return v;
  }

  function normalizeImage(img) {
    if (!img || img.dataset.imageFixChecked === '1') return;
    img.dataset.imageFixChecked = '1';

    const current = img.getAttribute('src');
    const fixed = normalizeLocalAsset(current);
    if (fixed && fixed !== current) img.setAttribute('src', fixed);

    img.addEventListener('error', function () {
      const src = img.getAttribute('src') || img.currentSrc || '';
      const fallback = normalizeLocalAsset(src);
      if (fallback && fallback !== src && !img.dataset.imageFixRetried) {
        img.dataset.imageFixRetried = '1';
        img.setAttribute('src', fallback);
        return;
      }
      img.classList.add('image-load-error');
      console.warn('[Sri Vidya] Image failed to load:', img.currentSrc || img.src);
    });
  }

  function normalizeStyle(el) {
    if (!el || !el.getAttribute) return;
    const style = el.getAttribute('style');
    if (!style || !style.includes('/images/')) return;
    const fixed = style.replace(/(['"(])\/images\//g, '$1/');
    if (fixed !== style) el.setAttribute('style', fixed);
  }

  function scan(root) {
    const scope = root && root.querySelectorAll ? root : document;
    scope.querySelectorAll('img').forEach(normalizeImage);
    scope.querySelectorAll('[style*="/images/"]').forEach(normalizeStyle);
    if (root && root.matches) {
      if (root.matches('img')) normalizeImage(root);
      if (root.getAttribute('style')?.includes('/images/')) normalizeStyle(root);
    }
  }

  function start() {
    scan(document);
    new MutationObserver(function (mutations) {
      for (const mutation of mutations) {
        if (mutation.type === 'childList') mutation.addedNodes.forEach(node => {
          if (node.nodeType === 1) scan(node);
        });
        if (mutation.type === 'attributes' && mutation.attributeName === 'src') normalizeImage(mutation.target);
        if (mutation.type === 'attributes' && mutation.attributeName === 'style') normalizeStyle(mutation.target);
      }
    }).observe(document.documentElement, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ['src', 'style']
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once: true });
  } else {
    start();
  }
})();
