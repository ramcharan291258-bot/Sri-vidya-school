(function(){
  const fallback={
    '/images/principal-designed.png':'/event-portrait.jpeg',
    '/principal-designed.png':'/event-portrait.jpeg',
    '/images/staff-group.png':'/event-group-1.jpeg',
    '/staff-group.png':'/event-group-1.jpeg'
  };

  function fixUrl(value){
    if(!value || typeof value!=='string') return value;
    let v=value.trim();
    if(fallback[v]) return fallback[v];
    // Assets in this repository are deployed at the site root, not under /images/.
    if(v.startsWith('/images/items/')) return '/'+v.slice('/images/items/'.length);
    if(v.startsWith('/images/')) return '/'+v.slice('/images/'.length);
    return v;
  }

  function fixBackground(style){
    if(!style) return style;
    return style.replace(/url\\(\\s*(["']?)(\\/images\\/(?:items\\/)?)?([^"')]+)\\1\\s*\\)/gi,function(_,quote,prefix,file){
      if(!prefix) return _;
      const source='/images/'+(prefix.endsWith('items/')?'items/':'')+file;
      const fixed=fixUrl(source);
      return 'url('+quote+fixed+quote+')';
    });
  }

  function fix(){
    document.querySelectorAll('img').forEach(function(img){
      const src=img.getAttribute('src');
      const next=fixUrl(src);
      if(next && next!==src) img.setAttribute('src',next);
    });

    document.querySelectorAll('[style]').forEach(function(el){
      const style=el.getAttribute('style');
      const next=fixBackground(style);
      if(next!==style) el.setAttribute('style',next);
    });

    document.querySelectorAll('*').forEach(function(el){
      if(el.style && el.style.backgroundImage){
        const next=fixBackground(el.style.backgroundImage);
        if(next!==el.style.backgroundImage) el.style.backgroundImage=next;
      }
    });
  }

  const observer=new MutationObserver(fix);
  observer.observe(document.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:['src','style']});
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',fix); else fix();
  setTimeout(fix,100); setTimeout(fix,500); setTimeout(fix,1500); setTimeout(fix,3000);
})();
