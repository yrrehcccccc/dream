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
    const paragraphs=lines.filter(el=>el.matches('.prose-line'));
    const page=location.pathname.split('/').pop();
    const text=el=>el.textContent.trim();
    const find=(needle,from=0)=>paragraphs.findIndex((el,i)=>i>=from&&text(el).includes(needle));
    const named=(el,senderOverride)=>{
      const value=el.textContent;
      const match=/^(\s*)(榆井|桐生|苏枋|樱遥|柘浦)([^：:]*)([：:])\s*([“"「])/u.exec(value);
      if(match){el.dataset.dreamSender=match[2];el.dataset.dreamPrefix=String(match[0].length);el.dataset.dreamAction=match[3].trim()?'1':'0';return true;}
      if(senderOverride){const quote=value.search(/[“"「]/u);if(quote>=0){el.dataset.dreamSender=senderOverride;el.dataset.dreamPrefix=String(quote+1);el.dataset.dreamAction='1';return true;}}
      return false;
    };
    const group=(startNeedle,endNeedle,sakuraRight=false)=>{
      const start=find(startNeedle);if(start<0)return;
      const end=find(endNeedle,start);if(end<start)return;
      for(const el of paragraphs.slice(start,end+1)){
        if(/^【桐生三辉邀请您加入「通宵速来」战队】$/u.test(text(el))){el.dataset.dreamNotice='1';continue;}
        const override=text(el).includes('你先做个人别嘴里没个真话。')?'樱遥':null;
        if(named(el,override))el.dataset.dreamSide=override||sakuraRight&&el.dataset.dreamSender==='樱遥'?'right':'left';
      }
    };
    if(page==='05.html')group('樱哥在窥屏吗？已读数变了！','咖啡的话我喜欢意式浓缩');
    if(page==='06.html'){
      group('榆井：“要去！”','榆井：“要去！”');
      group('对面的苏枋若无其事地端起拿铁喝了一口','虽然不知道发生了什么，榆井');
      for(const el of paragraphs){
        const value=text(el).replace(/^[：:]\s*/u,'');
        if(!/^[：:]/u.test(text(el)))continue;
        if(value.includes('好厉害呢，一口气打了好多字')||value==='更不讨厌你。'||value==='笨蛋！别让我再说一遍了！')el.dataset.dreamSide='right';
        if(value.startsWith('你混蛋的')||value==='更喜欢布丁还是更讨厌我？'||value==='想我来的？')el.dataset.dreamSide='left';
      }
    }
    if(page==='07.html')group('早些时候在群里提了一嘴天气的事儿','所以这个问题我不回答哦^^',true);
    if(page==='17.html'){
      for(let i=0;i<paragraphs.length;i++){
        if(text(paragraphs[i])==='03:28AM'){
          let count=0;
          for(let j=i+1;j<paragraphs.length&&count<2;j++){
            if(!text(paragraphs[j]))continue;
            if(!/^[：:]/u.test(text(paragraphs[j])))break;
            paragraphs[j].dataset.dreamSide=count++===0?'left':'right';
          }
        }
        const value=text(paragraphs[i]).replace(/^[：:]\s*/u,'');
        if(/^[：:]/u.test(text(paragraphs[i]))&&(value==='我 我也想看'||value.startsWith('学猫叫 你真会那样')||value==='[图片]'||value==='喂了，然而关系并没有打好。'))paragraphs[i].dataset.dreamSide='right';
      }
    }
    const isMessage=el=>el?.matches('.prose-line') && (!!el.dataset.dreamSender||/^\s*[：:]/u.test(el.textContent));
    const isBlank=el=>el?.matches('.blank-line') || (el?.matches('.prose-line')&&!el.textContent.trim());
    const isTime=el=>el?.matches('.prose-line') && /^(?:[^，。！？!?：:|｜\n]{1,24}[ \t\u3000]+)?(?:[01]?\d|2[0-3])[:：][0-5]\d(?:[:：][0-5]\d)?(?:[ \t]*(?:AM|PM))?$/iu.test(text(el));
    const rangeFor=(el,start,end)=>{
      const walker=document.createTreeWalker(el,NodeFilter.SHOW_TEXT);let offset=0,from,to;
      while(walker.nextNode()){
        const node=walker.currentNode,next=offset+node.data.length;
        if(!from && start<=next)from=[node,Math.max(0,start-offset)];
        if(end<=next){to=[node,Math.max(0,end-offset)];break;}offset=next;
      }
      if(!from||!to)return null;
      const range=document.createRange();range.setStart(...from);range.setEnd(...to);return range;
    };
    const hideRange=(el,start,end)=>{
      const range=rangeFor(el,start,end);if(!range)return;
      const marker=document.createElement('span');marker.className='dream-chat-marker';marker.setAttribute('aria-hidden','true');marker.append(range.extractContents());range.insertNode(marker);
    };
    const appendLine=(chat,line,wrapper=line)=>{
      const whitespace=[];let next=line.nextSibling;
      while(next && next.nodeType===Node.TEXT_NODE && !next.textContent.trim()){whitespace.push(next);next=next.nextSibling;}
      if(wrapper!==line){line.before(wrapper);wrapper.append(line);}
      chat.append(wrapper,...whitespace);
    };
    let chat=null;
    const openChat=before=>{
      if(chat)return chat;
      chat=document.createElement('section');chat.className='rt-chat dream-chat';chat.setAttribute('aria-label','聊天记录');before.before(chat);return chat;
    };
    for(let i=0;i<lines.length;i++){
      const line=lines[i];
      if(line.dataset.dreamNotice){line.classList.add('dream-chat-notice');line.setAttribute('role','note');appendLine(openChat(line),line);continue;}
      if(isTime(line)){
        const next=lines.slice(i+1).find(el=>!isBlank(el));
        if(!isMessage(next)){chat=null;continue;}
        line.classList.add('dream-chat-time');appendLine(openChat(line),line);continue;
      }
      if(isMessage(line)){
        const sender=line.dataset.dreamSender;
        if(sender){
          const prefix=Number(line.dataset.dreamPrefix);
          if(line.dataset.dreamAction==='1'){
            chat=null;
            const range=rangeFor(line,0,prefix-1);
            const action=document.createElement('div');action.className='prose-line dream-chat-action';action.append(range.extractContents());line.before(action);
            hideRange(line,0,1);
          }else hideRange(line,0,prefix);
          const close=/[”"」](\s*)$/u.exec(line.textContent);if(close)hideRange(line,close.index,close.index+1);
        }else{
          const prefix=/^\s*[：:]/u.exec(line.textContent);if(prefix)hideRange(line,0,prefix[0].length);
        }
        line.classList.add('rt-bubble');line.classList.toggle('rt-self',line.dataset.dreamSide==='right');
        if(sender){
          const row=document.createElement('div');row.className='dream-chat-row';row.dataset.sender=sender;row.setAttribute('role','group');row.setAttribute('aria-label',sender+'的消息');row.classList.toggle('rt-self-row',line.dataset.dreamSide==='right');
          appendLine(openChat(line),line,row);
        }else appendLine(openChat(line),line);
        continue;
      }
      if(chat && isBlank(line)){
        const next=lines.slice(i+1).find(el=>!isBlank(el));
        if(isMessage(next)||isTime(next)||next?.dataset.dreamNotice){appendLine(chat,line);continue;}
      }
      chat=null;
    }
  };
  const style=document.createElement('style');style.textContent=`
    .dream-chat{display:flex;flex-direction:column;align-items:flex-start;gap:10px;margin:1.5em 0;padding:12px 16px;background:transparent;letter-spacing:normal;font-size:var(--size,16px);line-height:1.55;color:#242424}
    .chapter-body .dream-chat .rt-bubble{position:relative;align-self:flex-start;box-sizing:border-box;max-width:94%;min-height:0;margin:0;padding:10px 13px;border-radius:5px 16px 16px 16px;background:#fff;box-shadow:0 2px 3px #0001;text-indent:0;line-height:inherit;white-space:pre-wrap}
    .dream-chat .rt-bubble::before{position:absolute;top:9px;left:-6px;content:'';border-width:4px 7px 4px 0;border-style:solid;border-color:transparent #fff transparent transparent}
    .chapter-body .dream-chat .rt-bubble.rt-self{align-self:flex-end;background:#f8dce5;border-radius:16px 5px 16px 16px}
    .dream-chat .rt-bubble.rt-self::before{left:auto;right:-6px;border-width:4px 0 4px 7px;border-color:transparent transparent transparent #f8dce5}
    .dream-chat-row{display:flex;flex-direction:column;align-items:flex-start;align-self:flex-start;gap:4px;width:fit-content;max-width:94%;min-width:0}
    .dream-chat-row.rt-self-row{align-self:flex-end;align-items:flex-end}
    .dream-chat-row::before{content:attr(data-sender);display:block;color:var(--muted,#77736c);font:400 11px/1.35 system-ui,sans-serif}
    .chapter-body .dream-chat-row>.rt-bubble{max-width:100%}
    .dream-chat>.blank-line,.dream-chat-marker{display:none}
    .chapter-body .dream-chat>.dream-chat-time{min-height:0;margin:5px 0 -3px;padding:0;font:400 11px/1.35 system-ui,sans-serif;letter-spacing:0;text-indent:0;color:var(--muted,#77736c)}
    .chapter-body .dream-chat>.dream-chat-notice{align-self:center;max-width:94%;min-height:0;margin:5px 0;padding:0;font:400 11px/1.55 system-ui,sans-serif;letter-spacing:0;text-indent:0;color:var(--muted,#77736c);text-align:center}
    .chat-footnote{background:var(--bg);border:0;border-radius:12px;box-shadow:0 5px 24px #0002}
    .chat-footnote .chat-avatar{display:none}.chat-footnote .chat-row{gap:0}
    .chat-footnote .chat-bubble{max-width:96%;padding:10px 13px;border-radius:5px 16px 16px 16px;box-shadow:0 2px 3px #0001}
    @media(max-width:640px){.dream-chat{padding:12px}.chapter-body .dream-chat .rt-bubble,.dream-chat-row{max-width:96%}.chapter-body .dream-chat-row>.rt-bubble{max-width:100%}}
  `;document.head.append(style);
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',decorate,{once:true});else decorate();
})();
