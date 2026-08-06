const W=1680,H=1680;
const canvas=document.getElementById('canvas');
const ctx=canvas.getContext('2d');
canvas.width=W; canvas.height=H;

const $=id=>document.getElementById(id);
const ui={
 logoInput:$('logoInput'),filename:$('filename'),hook:$('hook'),
 color:$('color'),hex:$('hex'),size:$('size'),spacing:$('spacing'),rotation:$('rotation'),
 sizeValue:$('sizeValue'),spacingValue:$('spacingValue'),rotationValue:$('rotationValue'),
 empty:$('empty'),loading:$('loading')
};

const paths={
 base:'assets/20mm/base.png',
 colorMask:'assets/20mm/color-mask.png',
 designMask:'assets/20mm/design-mask.png',
 overlay:'assets/20mm/overlay.png',
 shadow:'assets/20mm/shadow.png',
 duimhaak:'assets/20mm/duimhaak.png',
 ovaalhaak:'assets/20mm/ovaalhaak.png',
 karabijnhaak:'assets/20mm/karabijnhaak.png',
 'cliphaak-luxe':'assets/20mm/cliphaak-luxe.png',
 krokodil:'assets/20mm/krokodil.png',
 sleutelring:'assets/20mm/sleutelring.png'
};
const assets={}; let logo=null;

function loadImage(src){
 return new Promise((resolve,reject)=>{
  const im=new Image(); im.onload=()=>resolve(im); im.onerror=reject; im.src=src;
 });
}
async function init(){
 for(const [key,path] of Object.entries(paths)) assets[key]=await loadImage(path);
 ui.loading.style.display='none'; render();
}
function rgb(hex){return [parseInt(hex.slice(1,3),16),parseInt(hex.slice(3,5),16),parseInt(hex.slice(5,7),16)]}
function offscreen(){const c=document.createElement('canvas');c.width=W;c.height=H;return c}
function coloredMask(){
 const c=offscreen(),g=c.getContext('2d');
 g.drawImage(assets.colorMask,0,0);
 g.globalCompositeOperation='source-in';
 g.fillStyle=ui.color.value;g.fillRect(0,0,W,H);
 return c;
}
function drawContained(g,img,maxW,maxH){
 const s=Math.min(maxW/img.width,maxH/img.height);
 g.drawImage(img,-img.width*s/2,-img.height*s/2,img.width*s,img.height*s);
}
function logoLayer(){
 const c=offscreen(),g=c.getContext('2d');
 if(!logo)return c;
 const size=Number(ui.size.value),extra=Number(ui.rotation.value);
 // Exact template coordinates at 1680×1680.
 const main=[
  [405,1114,-30],[500,1057,-30],[596,1000,-30],[692,943,-30],
  [788,886,-30],[884,829,-30],[980,772,-30],[1076,715,-30],
  [1172,658,-30],[1268,601,-30],[1364,544,-30]
 ];
 const returnSide=[
  [944,806,-30],[1045,747,-30],[1146,688,-30],[1247,629,-30],
  [1348,570,-30],[1445,507,-30]
 ];
 const loop=[
  [1370,500,31],[1432,454,35],[1487,411,39]
 ];
 const step=ui.spacing.value==='1'?3:ui.spacing.value==='2'?2:1;
 [...main,...returnSide,...loop].forEach(([x,y,deg],i)=>{
  if(i%step!==0)return;
  g.save();g.translate(x,y);g.rotate((deg+extra)*Math.PI/180);
  drawContained(g,logo,size*2.5,size*.72);
  g.restore();
 });
 g.globalCompositeOperation='destination-in';
 g.drawImage(assets.designMask,0,0);
 return c;
}
function render(){
 if(!assets.base)return;
 ctx.clearRect(0,0,W,H);
 ctx.fillStyle='#f7f7f7';ctx.fillRect(0,0,W,H);

 // Achtergrondschaduw uit PSD.
 ctx.drawImage(assets.shadow,0,0);

 // Kleurvlak.
 ctx.drawImage(coloredMask(),0,0);

 // Basistextuur: wit/grijs vermenigvuldigt met de gekozen kleur.
 ctx.save();ctx.globalCompositeOperation='multiply';ctx.globalAlpha=.70;
 ctx.drawImage(assets.base,0,0);ctx.restore();

 // Bedrukking.
 if(logo)ctx.drawImage(logoLayer(),0,0);

 // PSD-overlay boven de bedrukking voor textuur, randen en bochten.
 ctx.save();ctx.globalCompositeOperation='multiply';ctx.globalAlpha=.72;
 ctx.drawImage(assets.overlay,0,0);ctx.restore();

 // Gekozen echte haaklaag.
 ctx.drawImage(assets[ui.hook.value],0,0);
}
ui.logoInput.addEventListener('change',()=>{
 const file=ui.logoInput.files?.[0];if(!file)return;
 const url=URL.createObjectURL(file),im=new Image();
 im.onload=()=>{logo=im;ui.filename.textContent=file.name;ui.empty.style.display='none';URL.revokeObjectURL(url);render()};
 im.onerror=()=>{URL.revokeObjectURL(url);alert('Dit logo kon niet worden geopend.')};
 im.src=url;
});
ui.hook.addEventListener('change',render);
ui.color.addEventListener('input',()=>{ui.hex.value=ui.color.value.toUpperCase();render()});
ui.hex.addEventListener('input',()=>{if(/^#[0-9A-Fa-f]{6}$/.test(ui.hex.value)){ui.color.value=ui.hex.value;render()}});
ui.size.addEventListener('input',()=>{ui.sizeValue.textContent=ui.size.value+'%';render()});
ui.spacing.addEventListener('input',()=>{ui.spacingValue.textContent=['','Ruim','Normaal','Compact'][ui.spacing.value];render()});
ui.rotation.addEventListener('input',()=>{ui.rotationValue.textContent=ui.rotation.value+'°';render()});
$('reset').addEventListener('click',()=>{
 ui.hook.value='duimhaak';ui.color.value='#e30613';ui.hex.value='#E30613';
 ui.size.value=70;ui.spacing.value=2;ui.rotation.value=0;
 ui.sizeValue.textContent='70%';ui.spacingValue.textContent='Normaal';ui.rotationValue.textContent='0°';render();
});
$('download').addEventListener('click',()=>{
 const a=document.createElement('a');a.download='xxlgifts-20mm-keycord-mockup.png';
 a.href=canvas.toDataURL('image/png');a.click();
});
init().catch(err=>{console.error(err);ui.loading.textContent='De mockupbestanden konden niet laden.'});
