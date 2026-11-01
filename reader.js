const themes = [['黑白','#f8f7f3','#171714'],['暖棕','#eee8da','#332a22'],['灰黑','#dfe1dc','#252825'],['暖黑','#111923','#e9e3d7'],['咖啡','#ead6bd','#5a2923']];
const fonts = {serif:'"Noto Serif SC","Songti SC","STSong",serif',sans:'"Noto Sans SC","PingFang SC","Hiragino Sans GB",sans-serif',light:'"PingFang SC","Noto Sans SC","Hiragino Sans GB","Microsoft YaHei",sans-serif',system:'system-ui,"PingFang SC","Microsoft YaHei",sans-serif'};
const root = document.documentElement;
const panel = document.querySelector('#settingsPanel');
const trigger = document.querySelector('#settingsButton');
const read = key => { try { return localStorage.getItem('dream-reader-' + key); } catch { return null; } };
const save = (key, value) => { try { localStorage.setItem('dream-reader-' + key, value); } catch {} };
const select = (key, value) => document.querySelectorAll('[data-' + key + ']').forEach(button => {
  const active = button.dataset[key] === String(value);
  button.classList.toggle('active', active);
  button.setAttribute('aria-pressed', String(active));
});
function setOpen(open, restoreFocus = false) {
  panel.inert = !open;
  panel.classList.toggle('open', open);
  trigger.setAttribute('aria-expanded', String(open));
  if (open) panel.querySelector('[data-close]').focus();
  else if (restoreFocus) trigger.focus();
}
trigger.onclick = () => setOpen(!panel.classList.contains('open'));
panel.querySelector('[data-close]').onclick = () => setOpen(false, true);
document.addEventListener('keydown', event => { if (event.key === 'Escape' && panel.classList.contains('open')) setOpen(false, true); });
document.addEventListener('click', event => { if (!panel.contains(event.target) && !trigger.contains(event.target)) setOpen(false); });
themes.forEach(([name, bg, ink], index) => {
  const button = document.createElement('button');
  button.className = 'palette';
  button.dataset.theme = index;
  const swatch = document.createElement('span');
  swatch.className = 'swatch';
  swatch.style.setProperty('--a', bg);
  swatch.style.setProperty('--b', ink);
  swatch.setAttribute('aria-hidden', 'true');
  button.append(swatch, name);
  button.onclick = () => {
    root.dataset.theme = String(index);
    root.style.setProperty('--bg', bg);
    root.style.setProperty('--ink', ink);
    select('theme', index);
    save('theme', index);
  };
  document.querySelector('#palettes').append(button);
});
document.querySelectorAll('[data-font]').forEach(button => button.onclick = () => {
  const font = button.dataset.font;
  root.style.setProperty('--body', fonts[font]);
  root.style.setProperty('--weight', font === 'light' ? 300 : 400);
  select('font', font);
  save('font', font);
});
document.querySelectorAll('[data-size]').forEach(button => button.onclick = () => {
  root.style.setProperty('--size', button.dataset.size + 'px');
  select('size', button.dataset.size);
  save('size', button.dataset.size);
});
const savedTheme = read('theme');
if (read('theme-default-version') !== '2') { if (savedTheme === null || savedTheme === '0') save('theme', 1); save('theme-default-version', '2'); }
const theme = Number(read('theme') ?? 1);
document.querySelector('[data-theme="' + (Number.isInteger(theme) && themes[theme] ? theme : 1) + '"]').click();
const font = read('font');
document.querySelector('[data-font="' + (Object.hasOwn(fonts, font) ? font : 'serif') + '"]').click();
const size = read('size');
document.querySelector('[data-size="' + (['12','14','16','18','20','23'].includes(size) ? size : '16') + '"]').click();

document.querySelectorAll('.toc-dropdown').forEach(details=>{
  details.addEventListener('toggle',()=>{
    if(!details.open)return;
    document.querySelectorAll('.toc-dropdown').forEach(other=>{if(other!==details)other.open=false;});
    const menu=details.querySelector('.toc-menu');
    const current=menu.querySelector('[aria-current="page"]');
    if(current)menu.scrollTop=Math.max(0,current.offsetTop-menu.offsetTop-menu.clientHeight/2);
  });
});
document.addEventListener('click',event=>document.querySelectorAll('.toc-dropdown[open]').forEach(menu=>{if(!menu.contains(event.target))menu.open=false;}));
document.addEventListener('keydown',event=>{if(event.key==='Escape')document.querySelectorAll('.toc-dropdown[open]').forEach(menu=>{menu.open=false;menu.querySelector('summary').focus();});});

/* Shared return-to-home sticker. */
(() => { if(document.querySelector('script[data-home-return-loader]'))return; const script=document.createElement('script');script.src='https://yrrehcccccc.github.io/me/assets/home-return.js?v=1';script.async=true;script.dataset.homeReturnLoader='true';document.head.append(script); })();

(() => {
  'use strict';
  const decorate=()=>{
    const article=document.querySelector('article.chapter-body');
    if(!article || article.dataset.dreamChatReady)return;
    article.dataset.dreamChatReady='true';
    const lines=[...article.children];
    const isMessage=el=>el?.matches('.prose-line') && /^\s*[：:]/u.test(el.textContent);
    const isBlank=el=>el?.matches('.blank-line') || (el?.matches('.prose-line')&&!el.textContent.trim());
    const isTime=el=>el?.matches('.prose-line') && /^(?:[^，。！？!?：:|｜\n]{1,24}[ \t\u3000]+)?(?:[01]?\d|2[0-3])[:：][0-5]\d(?:[:：][0-5]\d)?(?:[ \t]*(?:AM|PM))?$/iu.test(el.textContent.trim());
    const appendLine=(chat,line)=>{
      const whitespace=[];let next=line.nextSibling;
      while(next && next.nodeType===Node.TEXT_NODE && !next.textContent.trim()){whitespace.push(next);next=next.nextSibling;}
      chat.append(line,...whitespace);
    };
    let chat=null;
    for(let i=0;i<lines.length;i++){
      const line=lines[i];
      if(isTime(line)){
        const next=lines.slice(i+1).find(el=>!isBlank(el));
        if(!isMessage(next)){chat=null;continue;}
        if(!chat){chat=document.createElement('section');chat.className='rt-chat dream-chat';chat.setAttribute('aria-label','聊天记录');line.before(chat);}
        line.classList.add('dream-chat-time');appendLine(chat,line);continue;
      }
      if(isMessage(line)){
        if(!chat){chat=document.createElement('section');chat.className='rt-chat dream-chat';chat.setAttribute('aria-label','聊天记录');line.before(chat);}
        line.classList.add('rt-bubble');
        // Preserve the source characters and inline markup; only the chat marker is hidden.
        const walker=document.createTreeWalker(line,NodeFilter.SHOW_TEXT);
        let text;
        while(walker.nextNode()){
          if(!walker.currentNode.data.length)continue;
          text=walker.currentNode;break;
        }
        const prefix=text && /^\s*[：:]/u.exec(text.data);
        if(prefix){
          const marker=document.createElement('span');marker.className='dream-chat-marker';marker.setAttribute('aria-hidden','true');
          marker.textContent=prefix[0];text.deleteData(0,prefix[0].length);line.insertBefore(marker,line.firstChild);
        }
        appendLine(chat,line);continue;
      }
      if(chat && isBlank(line)){
        const next=lines.slice(i+1).find(el=>!isBlank(el));
        if(isMessage(next)||isTime(next)){appendLine(chat,line);continue;}
      }
      chat=null;
    }
  };
  const style=document.createElement('style');style.textContent=`
    .dream-chat{display:flex;flex-direction:column;align-items:flex-start;gap:8px;margin:1.5em 0;padding:12px 16px;background:transparent;letter-spacing:normal;font-size:var(--size,16px);line-height:1.55;color:#242424}
    .chapter-body .dream-chat>.rt-bubble{position:relative;align-self:flex-start;box-sizing:border-box;max-width:94%;min-height:0;margin:0;padding:10px 13px;border-radius:5px 16px 16px 16px;background:#fff;box-shadow:0 2px 3px #0001;text-indent:0;line-height:inherit;white-space:pre-wrap}
    .dream-chat>.rt-bubble::before{position:absolute;top:9px;left:-6px;content:'';border-width:4px 7px 4px 0;border-style:solid;border-color:transparent #fff transparent transparent}
    .dream-chat>.rt-bubble.rt-self{align-self:flex-end;background:#f8dce5;border-radius:16px 5px 16px 16px}
    .dream-chat>.rt-bubble.rt-self::before{left:auto;right:-6px;border-width:4px 0 4px 7px;border-color:transparent transparent transparent #f8dce5}
    .dream-chat>.blank-line,.dream-chat-marker{display:none}
    .chapter-body .dream-chat>.dream-chat-time{min-height:0;margin:5px 0 -3px;padding:0;font:400 11px/1.35 system-ui,sans-serif;letter-spacing:0;text-indent:0;color:var(--muted,#77736c)}
    .chat-footnote{background:var(--bg);border:0;border-radius:12px;box-shadow:0 5px 24px #0002}
    .chat-footnote .chat-avatar{display:none}
    .chat-footnote .chat-row{gap:0}
    .chat-footnote .chat-bubble{max-width:96%;padding:10px 13px;border-radius:5px 16px 16px 16px;box-shadow:0 2px 3px #0001}
    @media(max-width:640px){.dream-chat{padding:12px}.chapter-body .dream-chat>.rt-bubble{max-width:96%}}
  `;document.head.append(style);
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',decorate,{once:true});else decorate();
})();
