const $=id=>document.getElementById(id);
const canvas=$('canvas'),ctx=canvas.getContext('2d');
const ui={
 template:$('template'),logoInput:$('logoInput'),filename:$('filename'),hook:$('hook'),
 color:$('color'),hex:$('hex'),size:$('size'),spacing:$('spacing'),rotation:$('rotation'),
 sizeValue:$('sizeValue'),spacingValue:$('spacingValue'),rotationValue:$('rotationValue'),
 empty:$('empty'),loading:$('loading'),previewTitle:$('previewTitle')
};
let config=null,currentTemplate=null,assets={},logo=null;

function loadImage(src){return new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>resolve(im);im.onerror=()=>reject(new Error('Kon '+src+' niet laden'));im.src=src})}
function offscreen(){const c=document.createElement('canvas');c.width=canvas.width;c.height=canvas.height;return c}
function drawContained(g,img,maxW,maxH){const s=Math.min(maxW/img.width,maxH/img.height);g.drawImage(img,-img.width*s/2,-img.height*s/2,img.width*s,img.height*s)}

async function loadTemplate(id){
 ui.loading.style.display='flex';ui.loading.textContent='Mockup laden…';
 currentTemplate=config.templates.find(t=>t.id===id);
 canvas.width=currentTemplate.canvas.width;canvas.height=currentTemplate.canvas.height;
 assets={};
 for(const [key,file] of Object.entries(currentTemplate.files)) assets[key]=await loadImage(file);
 for(const hook of currentTemplate.hooks) assets['hook:'+hook.id]=await loadImage(hook.file);

 ui.hook.innerHTML='';
 currentTemplate.hooks.forEach(h=>{const o=document.createElement('option');o.value=h.id;o.textContent=h.label;ui.hook.appendChild(o)});
 ui.previewTitle.textContent=`${currentTemplate.label} · ${currentTemplate.material}`;
 ui.loading.style.display='none';render();
}
function coloredMask(){
 const c=offscreen(),g=c.getContext('2d');
 g.drawImage(assets.colorMask,0,0);
 g.globalCompositeOperation='source-in';g.fillStyle=ui.color.value;g.fillRect(0,0,c.width,c.height);
 return c;
}
function logoLayer(){
 const c=offscreen(),g=c.getContext('2d');
 if(!logo)return c;
 const size=Number(ui.size.value),rot=Number(ui.rotation.value);
 const step=ui.spacing.value==='1'?3:ui.spacing.value==='2'?2:1;
 currentTemplate.logoPlacements.forEach(([x,y,deg],i)=>{
  if(i%step!==0)return;
  g.save();g.translate(x,y);g.rotate((deg+rot)*Math.PI/180);
  drawContained(g,logo,size*2.5,size*.72);g.restore();
 });
 g.globalCompositeOperation='destination-in';g.drawImage(assets.designMask,0,0);
 return c;
}
function render(){
 if(!currentTemplate||!assets.base)return;
 ctx.clearRect(0,0,canvas.width,canvas.height);
 ctx.fillStyle='#f7f7f7';ctx.fillRect(0,0,canvas.width,canvas.height);
 ctx.drawImage(assets.shadow,0,0);
 ctx.drawImage(coloredMask(),0,0);
 ctx.save();ctx.globalCompositeOperation='multiply';ctx.globalAlpha=.70;ctx.drawImage(assets.base,0,0);ctx.restore();
 if(logo)ctx.drawImage(logoLayer(),0,0);
 ctx.save();ctx.globalCompositeOperation='multiply';ctx.globalAlpha=.72;ctx.drawImage(assets.overlay,0,0);ctx.restore();
 ctx.drawImage(assets['hook:'+ui.hook.value],0,0);
}
async function init(){
 const response=await fetch('templates.json',{cache:'no-store'});
 if(!response.ok)throw new Error('templates.json kon niet laden');
 config=await response.json();
 config.templates.forEach(t=>{const o=document.createElement('option');o.value=t.id;o.textContent=t.label;ui.template.appendChild(o)});
 await loadTemplate(config.templates[0].id);
}
ui.template.addEventListener('change',()=>loadTemplate(ui.template.value).catch(showError));
ui.logoInput.addEventListener('change',()=>{
 const file=ui.logoInput.files?.[0];if(!file)return;
 const url=URL.createObjectURL(file),im=new Image();
 im.onload=()=>{logo=im;ui.filename.textContent=file.name;ui.empty.style.display='none';URL.revokeObjectURL(url);render()};
 im.onerror=()=>{URL.revokeObjectURL(url);alert('Dit logo kon niet worden geopend.')};im.src=url;
});
ui.hook.addEventListener('change',render);
ui.color.addEventListener('input',()=>{ui.hex.value=ui.color.value.toUpperCase();render()});
ui.hex.addEventListener('input',()=>{if(/^#[0-9A-Fa-f]{6}$/.test(ui.hex.value)){ui.color.value=ui.hex.value;render()}});
ui.size.addEventListener('input',()=>{ui.sizeValue.textContent=ui.size.value+'%';render()});
ui.spacing.addEventListener('input',()=>{ui.spacingValue.textContent=['','Ruim','Normaal','Compact'][ui.spacing.value];render()});
ui.rotation.addEventListener('input',()=>{ui.rotationValue.textContent=ui.rotation.value+'°';render()});
$('reset').addEventListener('click',()=>{ui.color.value='#e30613';ui.hex.value='#E30613';ui.size.value=70;ui.spacing.value=2;ui.rotation.value=0;ui.sizeValue.textContent='70%';ui.spacingValue.textContent='Normaal';ui.rotationValue.textContent='0°';ui.hook.selectedIndex=0;render()});
$('download').addEventListener('click',()=>{const a=document.createElement('a');a.download=`xxlgifts-${currentTemplate.id}-mockup.png`;a.href=canvas.toDataURL('image/png');a.click()});
function showError(err){console.error(err);ui.loading.style.display='flex';ui.loading.textContent='Fout: '+err.message}
init().catch(showError);