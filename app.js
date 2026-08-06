const canvas=document.getElementById('previewCanvas');
const ctx=canvas.getContext('2d');
const emptyState=document.getElementById('emptyState');
const logoInput=document.getElementById('logoInput');
const logoName=document.getElementById('logoName');
const keycordColor=document.getElementById('keycordColor');
const colorText=document.getElementById('colorText');
const logoScale=document.getElementById('logoScale');
const repeats=document.getElementById('repeats');
const angle=document.getElementById('angle');
const logoScaleValue=document.getElementById('logoScaleValue');
const repeatsValue=document.getElementById('repeatsValue');
const angleValue=document.getElementById('angleValue');
let logo=null;
let background='#f2f2f2';

function drawContain(image,x,y,maxWidth,maxHeight){const scale=Math.min(maxWidth/image.width,maxHeight/image.height);const width=image.width*scale,height=image.height*scale;ctx.drawImage(image,x-width/2,y-height/2,width,height)}
function path(points){ctx.beginPath();ctx.moveTo(points[0].x,points[0].y);for(let i=1;i<points.length;i++){const p=points[i-1],c=points[i];ctx.quadraticCurveTo(p.x,p.y,(p.x+c.x)/2,(p.y+c.y)/2)}const last=points[points.length-1];ctx.lineTo(last.x,last.y)}
function drawStrap(points,width){ctx.save();ctx.lineCap='round';ctx.lineJoin='round';ctx.strokeStyle=keycordColor.value;ctx.lineWidth=width;path(points);ctx.stroke();ctx.globalAlpha=.16;ctx.strokeStyle='#fff';ctx.lineWidth=6;path(points.map(p=>({x:p.x-10,y:p.y})));ctx.stroke();ctx.restore()}
function render(){
  canvas.width=1600;canvas.height=1000;ctx.clearRect(0,0,1600,1000);ctx.fillStyle=background;ctx.fillRect(0,0,1600,1000);
  const radial=ctx.createRadialGradient(800,440,80,800,450,780);radial.addColorStop(0,'rgba(255,255,255,.86)');radial.addColorStop(1,'rgba(255,255,255,0)');ctx.fillStyle=radial;ctx.fillRect(0,0,1600,1000);
  const left=[{x:575,y:120},{x:475,y:250},{x:400,y:420},{x:390,y:590},{x:520,y:760},{x:705,y:840}],right=[{x:1025,y:120},{x:1125,y:250},{x:1200,y:420},{x:1210,y:590},{x:1080,y:760},{x:895,y:840}],strapWidth=68;
  ctx.save();ctx.lineCap='round';ctx.lineJoin='round';ctx.strokeStyle='rgba(0,0,0,.16)';ctx.lineWidth=strapWidth+20;ctx.filter='blur(15px)';ctx.translate(0,16);path(left);ctx.stroke();path(right);ctx.stroke();ctx.restore();
  drawStrap(left,strapWidth);drawStrap(right,strapWidth);
  if(logo){const a=[[540,190,-52],[465,320,-66],[414,475,-84],[430,640,-112],[555,770,-146],[695,825,-166]],b=[[1060,190,52],[1135,320,66],[1186,475,84],[1170,640,112],[1045,770,146],[905,825,166]],step=Math.max(1,Math.round(12/Number(repeats.value)));[...a,...b].forEach(([x,y,deg],i)=>{if(i%step!==0)return;ctx.save();ctx.translate(x,y);ctx.rotate(((deg+Number(angle.value))*Math.PI)/180);drawContain(logo,0,0,Number(logoScale.value)*2.25,Number(logoScale.value)*.88);ctx.restore()})}
  ctx.save();ctx.translate(800,858);ctx.fillStyle='#c9ccd0';ctx.strokeStyle='#81858a';ctx.lineWidth=7;ctx.beginPath();ctx.roundRect(-68,-24,136,48,18);ctx.fill();ctx.stroke();ctx.beginPath();ctx.arc(0,58,29,0,Math.PI*2);ctx.strokeStyle='#a8abb0';ctx.lineWidth=14;ctx.stroke();ctx.beginPath();ctx.roundRect(-22,78,44,92,20);ctx.fillStyle='#b9bdc2';ctx.fill();ctx.strokeStyle='#797d82';ctx.lineWidth=6;ctx.stroke();ctx.restore();
}
logoInput.addEventListener('change',()=>{const file=logoInput.files?.[0];if(!file)return;const allowed=['image/svg+xml','image/png','image/jpeg','image/webp'];if(!allowed.includes(file.type)){alert('Upload een SVG, PNG, JPG of WEBP.');return}const url=URL.createObjectURL(file);const img=new Image();img.onload=()=>{logo=img;logoName.textContent=file.name;emptyState.style.display='none';URL.revokeObjectURL(url);render()};img.onerror=()=>{alert('Het logo kon niet worden geopend.');URL.revokeObjectURL(url)};img.src=url});
keycordColor.addEventListener('input',()=>{colorText.value=keycordColor.value.toUpperCase();render()});
colorText.addEventListener('input',()=>{if(/^#[0-9A-Fa-f]{6}$/.test(colorText.value)){keycordColor.value=colorText.value;render()}});
logoScale.addEventListener('input',()=>{logoScaleValue.textContent=`${logoScale.value}%`;render()});repeats.addEventListener('input',()=>{repeatsValue.textContent=repeats.value;render()});angle.addEventListener('input',()=>{angleValue.textContent=`${angle.value}°`;render()});
document.querySelectorAll('.swatch').forEach(button=>button.addEventListener('click',()=>{document.querySelectorAll('.swatch').forEach(b=>b.classList.remove('active'));button.classList.add('active');background=button.dataset.color;render()}));
document.getElementById('resetButton').addEventListener('click',()=>{keycordColor.value='#e30613';colorText.value='#E30613';logoScale.value=56;repeats.value=7;angle.value=0;logoScaleValue.textContent='56%';repeatsValue.textContent='7';angleValue.textContent='0°';background='#f2f2f2';document.querySelectorAll('.swatch').forEach(b=>b.classList.toggle('active',b.dataset.color===background));render()});
document.getElementById('downloadButton').addEventListener('click',()=>{const link=document.createElement('a');link.download='xxlgifts-keycord-pattern.png';link.href=canvas.toDataURL('image/png');link.click()});
render();
