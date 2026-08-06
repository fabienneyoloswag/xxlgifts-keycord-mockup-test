const canvas=document.getElementById('previewCanvas'),ctx=canvas.getContext('2d');
const els={empty:document.getElementById('emptyState'),logoInput:document.getElementById('logoInput'),logoName:document.getElementById('logoName'),color:document.getElementById('keycordColor'),colorText:document.getElementById('colorText'),scale:document.getElementById('logoScale'),repeats:document.getElementById('repeats'),angle:document.getElementById('angle'),variant:document.getElementById('variant'),hook:document.getElementById('hook'),title:document.getElementById('previewTitle'),scaleValue:document.getElementById('logoScaleValue'),repeatsValue:document.getElementById('repeatsValue'),angleValue:document.getElementById('angleValue')};
let logo=null,background='#f2f2f2';

function line(points){ctx.beginPath();ctx.moveTo(points[0].x,points[0].y);for(let i=1;i<points.length;i++){const p=points[i-1],c=points[i];ctx.quadraticCurveTo(p.x,p.y,(p.x+c.x)/2,(p.y+c.y)/2)}ctx.lineTo(points.at(-1).x,points.at(-1).y)}
function contain(img,x,y,mw,mh){const s=Math.min(mw/img.width,mh/img.height);ctx.drawImage(img,x-img.width*s/2,y-img.height*s/2,img.width*s,img.height*s)}
function strap(points,w){ctx.save();ctx.lineCap='round';ctx.lineJoin='round';ctx.strokeStyle=els.color.value;ctx.lineWidth=w;line(points);ctx.stroke();ctx.globalAlpha=.17;ctx.strokeStyle='#fff';ctx.lineWidth=6;line(points.map(p=>({x:p.x-8,y:p.y})));ctx.stroke();ctx.restore()}
function metalGradient(x1,y1,x2,y2){const g=ctx.createLinearGradient(x1,y1,x2,y2);g.addColorStop(0,'#f4f5f6');g.addColorStop(.45,'#aeb2b7');g.addColorStop(1,'#73787e');return g}

function drawAccessory(type){
  ctx.save();ctx.translate(800,862);
  const metal=metalGradient(-70,-30,70,150);
  ctx.fillStyle=metal;ctx.strokeStyle='#72777d';ctx.lineWidth=7;
  ctx.beginPath();ctx.roundRect(-66,-23,132,46,17);ctx.fill();ctx.stroke();
  if(type==='badge'){
    ctx.beginPath();ctx.arc(0,86,58,0,Math.PI*2);ctx.fill();ctx.stroke();
    ctx.beginPath();ctx.arc(0,86,31,0,Math.PI*2);ctx.fillStyle='#f3f3f3';ctx.fill();
  }else if(type==='oval'){
    ctx.beginPath();ctx.ellipse(0,98,35,58,0,0,Math.PI*2);ctx.strokeStyle='#a5a9ae';ctx.lineWidth=15;ctx.stroke();
  }else if(type==='plastic'){
    ctx.fillStyle='#171717';ctx.strokeStyle='#050505';ctx.beginPath();ctx.roundRect(-30,43,60,112,20);ctx.fill();ctx.stroke();
  }else if(type==='bulldog'){
    ctx.beginPath();ctx.roundRect(-48,48,96,68,18);ctx.fill();ctx.stroke();ctx.beginPath();ctx.moveTo(-28,118);ctx.lineTo(0,155);ctx.lineTo(28,118);ctx.stroke();
  }else if(type==='jhook'){
    ctx.beginPath();ctx.arc(0,90,32,.4,Math.PI*1.8);ctx.strokeStyle='#a5a9ae';ctx.lineWidth=15;ctx.stroke();ctx.beginPath();ctx.moveTo(28,72);ctx.lineTo(42,132);ctx.stroke();
  }else{
    ctx.beginPath();ctx.arc(0,55,27,0,Math.PI*2);ctx.strokeStyle='#a5a9ae';ctx.lineWidth=13;ctx.stroke();ctx.beginPath();ctx.roundRect(-23,76,46,98,20);ctx.fill();ctx.stroke();
  }
  ctx.restore();
}

function drawVariantHardware(){
  const v=els.variant.value;
  if(v.includes('buckle')){
    ctx.save();ctx.translate(495,710);ctx.rotate(-.63);ctx.fillStyle='#202124';ctx.strokeStyle='#060606';ctx.lineWidth=5;ctx.beginPath();ctx.roundRect(-58,-28,116,56,16);ctx.fill();ctx.stroke();ctx.fillStyle='#ececec';ctx.fillRect(-10,-25,20,50);ctx.restore();
  }
  if(v.includes('safety')){
    ctx.save();ctx.translate(800,126);ctx.fillStyle='#f5f5f5';ctx.strokeStyle='#b7b7b7';ctx.lineWidth=5;ctx.beginPath();ctx.roundRect(-72,-25,144,50,18);ctx.fill();ctx.stroke();ctx.restore();
  }
}

function render(){
  canvas.width=1600;canvas.height=1000;ctx.clearRect(0,0,1600,1000);ctx.fillStyle=background;ctx.fillRect(0,0,1600,1000);
  const glow=ctx.createRadialGradient(800,430,60,800,450,780);glow.addColorStop(0,'rgba(255,255,255,.9)');glow.addColorStop(1,'rgba(255,255,255,0)');ctx.fillStyle=glow;ctx.fillRect(0,0,1600,1000);
  const left=[{x:575,y:120},{x:475,y:250},{x:400,y:420},{x:390,y:590},{x:520,y:760},{x:705,y:840}],right=[{x:1025,y:120},{x:1125,y:250},{x:1200,y:420},{x:1210,y:590},{x:1080,y:760},{x:895,y:840}],w=68;
  ctx.save();ctx.lineCap='round';ctx.lineJoin='round';ctx.strokeStyle='rgba(0,0,0,.17)';ctx.lineWidth=w+22;ctx.filter='blur(15px)';ctx.translate(0,17);line(left);ctx.stroke();line(right);ctx.stroke();ctx.restore();
  strap(left,w);strap(right,w);
  drawVariantHardware();
  if(logo){
    const pos=[[540,190,-52],[465,320,-66],[414,475,-84],[430,640,-112],[555,770,-146],[695,825,-166],[1060,190,52],[1135,320,66],[1186,475,84],[1170,640,112],[1045,770,146],[905,825,166]];
    const count=Number(els.repeats.value),step=Math.max(1,Math.round(12/count));
    pos.forEach(([x,y,d],i)=>{if(i%step)return;ctx.save();ctx.translate(x,y);ctx.rotate((d+Number(els.angle.value))*Math.PI/180);contain(logo,0,0,Number(els.scale.value)*2.3,Number(els.scale.value)*.92);ctx.restore()});
  }
  drawAccessory(els.hook.value);
  els.title.textContent=`20 mm sublimatie · ${els.variant.options[els.variant.selectedIndex].text.toLowerCase()}`;
}

els.logoInput.addEventListener('change',()=>{const f=els.logoInput.files?.[0];if(!f)return;const url=URL.createObjectURL(f),img=new Image();img.onload=()=>{logo=img;els.logoName.textContent=f.name;els.empty.style.display='none';URL.revokeObjectURL(url);render()};img.onerror=()=>alert('Het logo kon niet worden geopend.');img.src=url});
els.color.addEventListener('input',()=>{els.colorText.value=els.color.value.toUpperCase();render()});
els.colorText.addEventListener('input',()=>{if(/^#[0-9A-Fa-f]{6}$/.test(els.colorText.value)){els.color.value=els.colorText.value;render()}});
els.scale.addEventListener('input',()=>{els.scaleValue.textContent=els.scale.value+'%';render()});
els.repeats.addEventListener('input',()=>{els.repeatsValue.textContent=els.repeats.value;render()});
els.angle.addEventListener('input',()=>{els.angleValue.textContent=els.angle.value+'°';render()});
els.variant.addEventListener('change',render);els.hook.addEventListener('change',render);
document.querySelectorAll('.swatch').forEach(b=>b.addEventListener('click',()=>{document.querySelectorAll('.swatch').forEach(x=>x.classList.remove('active'));b.classList.add('active');background=b.dataset.color;render()}));
document.getElementById('resetButton').addEventListener('click',()=>{els.color.value='#e30613';els.colorText.value='#E30613';els.scale.value=58;els.repeats.value=7;els.angle.value=0;els.variant.value='normal';els.hook.value='lobster';els.scaleValue.textContent='58%';els.repeatsValue.textContent='7';els.angleValue.textContent='0°';background='#f2f2f2';document.querySelectorAll('.swatch').forEach(b=>b.classList.toggle('active',b.dataset.color===background));render()});
document.getElementById('downloadButton').addEventListener('click',()=>{const a=document.createElement('a');a.download='xxlgifts-keycord-mockup.png';a.href=canvas.toDataURL('image/png');a.click()});
render();
