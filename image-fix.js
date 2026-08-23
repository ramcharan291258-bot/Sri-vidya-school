(function(){
  const CDN='https://cdn.jsdelivr.net/gh/ramcharan291258-bot/Sri-vidya-school@main/';
  const RAW='https://raw.githubusercontent.com/ramcharan291258-bot/Sri-vidya-school/main/';
  const ALIASES={
    'principal-designed.png':'event-portrait.jpeg',
    'staff-group.png':'event-group-1.jpeg'
  };
  function fixUrl(value){
    if(!value || typeof value!=='string') return value;
    const v=value.trim();
    if(v.startsWith('data:') || v.startsWith('blob:')) return v;
    let path='';
    if(v.startsWith('/images/items/')) path=v.slice('/images/items/'.length);
    else if(v.startsWith('/images/')) path=v.slice('/images/'.length);
    else if(v.startsWith('/')) return v;
    else return v;
    const file=ALIASES[path]||path;
    return CDN+encodeURI(file);
  }
  function fixBackground(style){
    if(!style) return style;
    return style.replace(/url\(\s*(["']?)(\/images\/(?:items\/)?)?([^"')]+)\1\s*\)/gi,function(full,quote,prefix,file){
      if(!prefix) return full;
      const source='/images/'+(prefix.endsWith('items/')?'items/':'')+file;
      return 'url('+quote+fixUrl(source)+quote+')';
    });
  }
  function replaceImage(img){
    const src=img.getAttribute('src');
    const next=fixUrl(src);
    if(next && next!==src){
      img.setAttribute('src',next);
      img.onerror=function(){
        const current=img.getAttribute('src')||'';
        if(current.startsWith(CDN)){
          const file=current.slice(CDN.length);
          img.onerror=null;
          img.setAttribute('src',RAW+file);
        }
      };
    }
  }
  function fix(){
    document.querySelectorAll('img').forEach(replaceImage);
    document.querySelectorAll('[style]').forEach(function(el){
      const style=el.getAttribute('style'); const next=fixBackground(style);
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
  [100,500,1500,3000,6000].forEach(function(ms){setTimeout(fix,ms)});
})();
