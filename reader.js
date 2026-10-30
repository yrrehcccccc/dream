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
const theme = Number(read('theme'));
document.querySelector('[data-theme="' + (Number.isInteger(theme) && themes[theme] ? theme : 0) + '"]').click();
const font = read('font');
document.querySelector('[data-font="' + (Object.hasOwn(fonts, font) ? font : 'serif') + '"]').click();
const size = read('size');
document.querySelector('[data-size="' + (['12','14','16','18','20','23'].includes(size) ? size : '16') + '"]').click();

const menuEntries=[{"href":"intro-1.html","label":"《英文诗两首（一）》"},{"href":"00.html","label":"00"},{"href":"01.html","label":"01"},{"href":"02.html","label":"02"},{"href":"03.html","label":"03"},{"href":"04.html","label":"04"},{"href":"05.html","label":"05"},{"href":"06.html","label":"06"},{"href":"intro-2.html","label":"《英文诗两首（二）》"},{"href":"07.html","label":"07"},{"href":"08.html","label":"08"},{"href":"09.html","label":"09"},{"href":"10.html","label":"10"},{"href":"11.html","label":"11"},{"href":"intro-3.html","label":"《星期六》"},{"href":"12.html","label":"12"},{"href":"13.html","label":"13"},{"href":"14.html","label":"14"},{"href":"15.html","label":"15"},{"href":"16.html","label":"16"},{"href":"intro-4.html","label":"《布宜诺斯艾利斯》"},{"href":"17.html","label":"17"},{"href":"18.html","label":"18"},{"href":"19.html","label":"19"},{"href":"20.html","label":"20"},{"href":"intro-5.html","label":"《循环的夜》"},{"href":"21.html","label":"21"},{"href":"22.html","label":"22"},{"href":"23.html","label":"23"},{"href":"24.html","label":"24"},{"href":"25.html","label":"25"},{"href":"26.html","label":"26"},{"href":"27.html","label":"27"},{"href":"28.html","label":"28"},{"href":"29.html","label":"29"}];
document.querySelectorAll('.chapter-nav > a[href="index.html"]').forEach(link=>{
  const details=document.createElement('details');details.className='toc-dropdown';
  const summary=document.createElement('summary');summary.textContent='目录';
  const menu=document.createElement('nav');menu.className='toc-menu';menu.setAttribute('aria-label','章节目录');
  for(const entry of menuEntries){const a=document.createElement('a');a.href=entry.href;a.textContent=entry.label;if(location.pathname.endsWith('/'+entry.href))a.setAttribute('aria-current','page');menu.append(a);}
  details.append(summary,menu);link.replaceWith(details);
  details.addEventListener('toggle',()=>{if(details.open)document.querySelectorAll('.toc-dropdown').forEach(other=>{if(other!==details)other.open=false;});});
});
document.addEventListener('click',event=>{document.querySelectorAll('.toc-dropdown[open]').forEach(menu=>{if(!menu.contains(event.target))menu.open=false;});});
document.addEventListener('keydown',event=>{if(event.key==='Escape')document.querySelectorAll('.toc-dropdown[open]').forEach(menu=>{menu.open=false;menu.querySelector('summary').focus();});});
