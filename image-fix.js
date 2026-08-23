(function () {
  'use strict';

  function normalizeLocalAsset(value) {
    if (typeof value !== 'string') return value;
    const v = value.trim();
    if (!v) return v;
    if (/^(https?:|data:|blob:|mailto:|tel:|#)/i.test(v)) return v;
    if (v.startsWith('/images/')) return v.slice('/images'.length);
    if (v.startsWith('images/')) return '/' + v.slice('images/'.length);
    return v;
  }

  function isValidSrc(value) {
    return typeof value === 'string' && value.trim() !== '';
  }

  function normalizeImage(img) {
    if (!img) return;
    const current = img.getAttribute('src') || '';
    const fixed = normalizeLocalAsset(current);

    if (isValidSrc(fixed)) {
      if (fixed !== current) img.setAttribute('src', fixed);
      img.dataset.imageFixLastGood = fixed;
      img.dataset.imageFixHadGood = '1';
    } else if (img.dataset.imageFixHadGood === '1' && img.dataset.imageFixLastGood) {
      const lastGood = img.dataset.imageFixLastGood;
      if (current !== lastGood) img.setAttribute('src', lastGood);
    }

    if (img.dataset.imageFixErrorBound === '1') return;
    img.dataset.imageFixErrorBound = '1';
    img.addEventListener('error', function () {
      const src = img.getAttribute('src') || img.currentSrc || '';
      const fixedSrc = normalizeLocalAsset(src);
      if (isValidSrc(fixedSrc) && fixedSrc !== src && !img.dataset.imageFixRetried) {
        img.dataset.imageFixRetried = '1';
        img.setAttribute('src', fixedSrc);
        return;
      }
      if (img.dataset.imageFixLastGood && img.dataset.imageFixLastGood !== src && !img.dataset.imageFixRestored) {
        img.dataset.imageFixRestored = '1';
        img.setAttribute('src', img.dataset.imageFixLastGood);
        return;
      }
      img.classList.add('image-load-error');
      console.warn('[Sri Vidya] Image failed to load:', img.currentSrc || img.src);
    });
  }

  function normalizeStyle(el) {
    if (!el || !el.getAttribute) return;
    const style = el.getAttribute('style');
    if (!style) return;
    const fixed = style.replace(/(['\"(])\\/images\\//g, '$1/');
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
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach(function (node) {
            if (node.nodeType === 1) scan(node);
          });
        }
        if (mutation.type === 'attributes' && mutation.attributeName === 'src') {
          normalizeImage(mutation.target);
        }
        if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
          normalizeStyle(mutation.target);
        }
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