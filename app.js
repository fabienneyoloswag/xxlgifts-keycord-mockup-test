const c=document.getElementById('canvas'),ctx=c.getContext('2d',{willReadFrequently:true});
const base=new Image();base.src='mockup-base.png';
let logo=null, basePixels=null, mask=null;
const el=id=>document.getElementById(id);
const controls={file:el('file'),fileName:el('fileName'),color:el('color'),hex:el('hex'),size:el('size'),density:el('density'),rotation:el('rotation'),sizeVal:el('sizeVal'),densityVal:el('densityVal'),rotationVal:el('rotationVal'),empty:el('empty')};

function rgb(hex){return [parseInt(hex.slice(1,3),16),parseInt(hex.slice(3,5),16),parseInt(hex.slice(5,7),16)]}
function isCyan(r,g,b){return b>95&&g>90&&g>r*1.18&&b>r*1.12&&Math.abs(g-b)<100}
function prep(){
 c.width=base.width;c.height=base.height;
 ctx.drawImage(base,0,0);
 basePixels=ctx.getImageData(0,0,c.width,c.height);
 mask=new Uint8ClampedArray(c.width*c.height);
 for(let i=0,p=0;i<basePixels.data.length;i+=4,p++){
  const r=basePixels.data[i],g=basePixels.data[i+1],b=basePixels.data[i+2];
  if(isCyan(r,g,b)) mask[p]=Math.min(255,Math.max(0,((g+b)/2-r)*3.1));
 }
 render();
}
function recolor(){
 const out=new ImageData(new Uint8ClampedArray(basePixels.data),c.width,c.height);
 const [tr,tg,tb]=rgb(controls.color.value);
 for(let i=0,p=0;i<out.data.length;i+=4,p++){
  const a=mask[p]/255;if(a<=0)continue;
  const r=basePixels.data[i],g=basePixels.data[i+1],b=basePixels.data[i+2];
  const lum=(r*.22+g*.60+b*.18)/255;
  const shade=.30+lum*.94;
  const nr=Math.min(255,tr*shade),ng=Math.min(255,tg*shade),nb=Math.min(255,tb*shade);
  out.data[i]=r*(1-a)+nr*a;out.data[i+1]=g*(1-a)+ng*a;out.data[i+2]=b*(1-a)+nb*a;
 }
 ctx.putImageData(out,0,0);
}
function contain(g,img,maxW,maxH){
 const s=Math.min(maxW/img.width,maxH/img.height);
 g.drawImage(img,-img.width*s/2,-img.height*s/2,img.width*s,img.height*s);
}
function makeMaskCanvas(){
 const m=document.createElement('canvas');m.width=c.width;m.height=c.height;
 const mx=m.getContext('2d');const im=mx.createImageData(c.width,c.height);
 for(let p=0,i=0;p<mask.length;p++,i+=4){im.data[i]=255;im.data[i+1]=255;im.data[i+2]=255;im.data[i+3]=mask[p]}
 mx.putImageData(im,0,0);return m;
}
function drawLogos(){
 if(!logo)return;
 const layer=document.createElement('canvas');layer.width=c.width;layer.height=c.height;const g=layer.getContext('2d');
 const s=Number(controls.size.value),rot=Number(controls.rotation.value);
 const dense=Number(controls.density.value);
 const placements=[
  [440,1115,-30],[610,1012,-30],[780,910,-30],[950,810,-30],[1120,710,-30],[1290,610,-30],[1460,510,-30],
  [570,1225,-30],[740,1125,-30],[910,1025,-30],[1080,925,-30],
  [960,795,-30],[1115,705,-30],[1270,615,-30],[1425,525,-30],
  [1040,570,-30],[1170,495,-30],[1300,420,-30],[1430,350,-30]
 ];
 const stride=dense===1?3:dense===2?2:1;
 placements.forEach((p,i)=>{if(i%stride)return;g.save();g.translate(p[0],p[1]);g.rotate((p[2]+rot)*Math.PI/180);contain(g,logo,s*2.45,s*.68);g.restore()});
 // Logos on the upper returning strap.
 const upper=[[1260,505,28],[1370,435,31],[1470,365,35]];
 upper.forEach((p,i)=>{if(i%stride)return;g.save();g.translate(p[0],p[1]);g.rotate((p[2]+rot)*Math.PI/180);contain(g,logo,s*2.2,s*.64);g.restore()});
 g.globalCompositeOperation='destination-in';g.drawImage(makeMaskCanvas(),0,0);
 ctx.save();ctx.globalAlpha=.96;ctx.drawImage(layer,0,0);ctx.restore();
}
function addTexture(){
 // Reapply a subtle luminance layer so the textile shading remains visible above the print.
 const shade=document.createElement('canvas');shade.width=c.width;shade.height=c.height;const sx=shade.getContext('2d');
 const im=sx.createImageData(c.width,c.height);
 for(let p=0,i=0;p<mask.length;p++,i+=4){if(!mask[p])continue;const r=basePixels.data[i],g=basePixels.data[i+1],b=basePixels.data[i+2];const lum=(r+g+b)/3;const delta=lum-150;if(delta>16){im.data[i]=255;im.data[i+1]=255;im.data[i+2]=255;im.data[i+3]=Math.min(55,delta*.45)}else if(delta<-16){im.data[i]=0;im.data[i+1]=0;im.data[i+2]=0;im.data[i+3]=Math.min(42,-delta*.34)}}sx.putImageData(im,0,0);ctx.drawImage(shade,0,0);
}
function render(){if(!basePixels)return;recolor();drawLogos();addTexture()}
base.onload=prep;

controls.file.addEventListener('change',()=>{const f=controls.file.files?.[0];if(!f)return;const u=URL.createObjectURL(f),im=new Image();im.onload=()=>{logo=im;controls.fileName.textContent=f.name;controls.empty.style.display='none';URL.revokeObjectURL(u);render()};im.src=u});
controls.color.addEventListener('input',()=>{controls.hex.value=controls.color.value.toUpperCase();render()});
controls.hex.addEventListener('input',()=>{if(/^#[0-9a-fA-F]{6}$/.test(controls.hex.value)){controls.color.value=controls.hex.value;render()}});
controls.size.addEventListener('input',()=>{controls.sizeVal.textContent=controls.size.value+'%';render()});
controls.density.addEventListener('input',()=>{controls.densityVal.textContent=['','Ruim','Normaal','Compact'][controls.density.value];render()});
controls.rotation.addEventListener('input',()=>{controls.rotationVal.textContent=controls.rotation.value+'°';render()});
el('reset').addEventListener('click',()=>{controls.color.value='#e30613';controls.hex.value='#E30613';controls.size.value=72;controls.density.value=2;controls.rotation.value=0;controls.sizeVal.textContent='72%';controls.densityVal.textContent='Normaal';controls.rotationVal.textContent='0°';render()});
el('download').addEventListener('click',()=>{const a=document.createElement('a');a.download='xxlgifts-echte-psd-mockup.png';a.href=c.toDataURL('image/png');a.click()});
