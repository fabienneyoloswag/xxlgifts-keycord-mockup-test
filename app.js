const $=id=>document.getElementById(id);
const canvas=$('canvas'),ctx=canvas.getContext('2d');
const ui={
 template:$('template'),logoInput:$('logoInput'),filename:$('filename'),hook:$('hook'),
 color:$('color'),hex:$('hex'),size:$('size'),logoCount:$('logoCount'),offset:$('offset'),
 rotation:$('rotation'),autoCount:$('autoCount'),sizeValue:$('sizeValue'),
 countValue:$('countValue'),offsetValue:$('offsetValue'),rotationValue:$('rotationValue'),
 empty:$('empty'),loading:$('loading'),previewTitle:$('previewTitle'),stage:$('stage'),
 editPath:$('editPath'),editorControls:$('editorControls'),pathSelect:$('pathSelect'),
 undoPoint:$('undoPoint'),clearPath:$('clearPath'),savePath:$('savePath'),
 editorHint:$('editorHint'),modeBadge:$('modeBadge'),copyPath:$('copyPath')
};
let config=null,currentTemplate=null,assets={},logo=null;
let editing=false,dragging=null,sessionPaths=[];

function loadImage(src){return new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>resolve(im);im.onerror=()=>reject(new Error('Kon '+src+' niet laden'));im.src=src})}
function offscreen(){const c=document.createElement('canvas');c.width=canvas.width;c.height=canvas.height;return c}
function drawContained(g,img,maxW,maxH){const s=Math.min(maxW/img.width,maxH/img.height);g.drawImage(img,-img.width*s/2,-img.height*s/2,img.width*s,img.height*s)}
function clonePaths(paths){return JSON.parse(JSON.stringify(paths||[]))}

async function loadTemplate(id){
 ui.loading.style.display='flex';ui.loading.textContent='Mockup laden…';
 currentTemplate=config.templates.find(t=>t.id===id);
 canvas.width=currentTemplate.canvas.width;canvas.height=currentTemplate.canvas.height;
 sessionPaths=clonePaths(currentTemplate.paths);
 assets={};
 for(const [key,file] of Object.entries(currentTemplate.files))assets[key]=await loadImage(file);
 for(const hook of currentTemplate.hooks)assets['hook:'+hook.id]=await loadImage(hook.file);
 ui.hook.innerHTML='';
 currentTemplate.hooks.forEach(h=>{const o=document.createElement('option');o.value=h.id;o.textContent=h.label;ui.hook.appendChild(o)});
 ui.pathSelect.innerHTML='';
 sessionPaths.forEach((p,i)=>{const o=document.createElement('option');o.value=String(i);o.textContent=p.label||p.id;ui.pathSelect.appendChild(o)});
 ui.previewTitle.textContent=`${currentTemplate.label} · ${currentTemplate.material}`;
 ui.loading.style.display='none';
 adviseCount();render();
}
function coloredMask(){
 const c=offscreen(),g=c.getContext('2d');g.drawImage(assets.colorMask,0,0);
 g.globalCompositeOperation='source-in';g.fillStyle=ui.color.value;g.fillRect(0,0,c.width,c.height);return c;
}
function pathLength(points){
 let total=0;for(let i=1;i<points.length;i++)total+=Math.hypot(points[i][0]-points[i-1][0],points[i][1]-points[i-1][1]);return total;
}
function pointAtDistance(points,distance){
 if(points.length<2)return null;
 let walked=0;
 for(let i=1;i<points.length;i++){
  const a=points[i-1],b=points[i],segment=Math.hypot(b[0]-a[0],b[1]-a[1]);
  if(walked+segment>=distance){
   const t=(distance-walked)/segment;
   return {x:a[0]+(b[0]-a[0])*t,y:a[1]+(b[1]-a[1])*t,angle:Math.atan2(b[1]-a[1],b[0]-a[0])};
  }
  walked+=segment;
 }
 const a=points[points.length-2],b=points[points.length-1];
 return {x:b[0],y:b[1],angle:Math.atan2(b[1]-a[1],b[0]-a[0])};
}
function totalPathLength(){return sessionPaths.reduce((sum,p)=>sum+pathLength(p.points),0)}
function adviseCount(){
 if(!ui.autoCount.checked)return;
 const length=totalPathLength(),size=Number(ui.size.value);
 const estimated=Math.max(3,Math.min(20,Math.round(length/Math.max(115,size*2.45))));
 ui.logoCount.value=estimated;ui.countValue.textContent=estimated;
}
function distributeCounts(total){
 const lengths=sessionPaths.map(p=>pathLength(p.points)),sum=lengths.reduce((a,b)=>a+b,0)||1;
 let counts=lengths.map(l=>Math.max(1,Math.round(total*l/sum)));
 let current=counts.reduce((a,b)=>a+b,0);
 while(current>total){const i=counts.indexOf(Math.max(...counts));if(counts[i]>1){counts[i]--;current--}else break}
 while(current<total){const ratios=lengths.map((l,i)=>l/(counts[i]+1));const i=ratios.indexOf(Math.max(...ratios));counts[i]++;current++}
 return counts;
}
function logoLayer(){
 const c=offscreen(),g=c.getContext('2d');if(!logo)return c;
 const size=Number(ui.size.value),extra=Number(ui.rotation.value)*Math.PI/180;
 const total=Number(ui.logoCount.value),counts=distributeCounts(total);
 const offsetPct=Number(ui.offset.value)/100;
 sessionPaths.forEach((path,pathIndex)=>{
  const points=path.points;if(points.length<2)return;
  const length=pathLength(points),count=counts[pathIndex]||1;
  const margin=Math.min(length*.12,85);
  const usable=Math.max(1,length-margin*2);
  for(let i=0;i<count;i++){
   const base=count===1?.5:i/(count-1);
   const shifted=Math.max(0,Math.min(1,base+offsetPct/Math.max(1,count)));
   const pos=pointAtDistance(points,margin+usable*shifted);if(!pos)continue;
   g.save();g.translate(pos.x,pos.y);g.rotate(pos.angle+extra);
   drawContained(g,logo,size*2.12,size*.58);g.restore();
  }
 });
 g.globalCompositeOperation='destination-in';g.drawImage(assets.designMask,0,0);return c;
}
function drawEditor(){
 if(!editing)return;
 ctx.save();ctx.lineCap='round';ctx.lineJoin='round';
 sessionPaths.forEach((path,pathIndex)=>{
  if(path.points.length){
   ctx.beginPath();ctx.moveTo(path.points[0][0],path.points[0][1]);
   path.points.slice(1).forEach(p=>ctx.lineTo(p[0],p[1]));
   ctx.strokeStyle=pathIndex===Number(ui.pathSelect.value)?'#e30613':'rgba(20,20,20,.55)';
   ctx.lineWidth=7;ctx.stroke();
  }
  path.points.forEach((p,pointIndex)=>{
   ctx.beginPath();ctx.arc(p[0],p[1],pathIndex===Number(ui.pathSelect.value)?15:10,0,Math.PI*2);
   ctx.fillStyle=pathIndex===Number(ui.pathSelect.value)?'#fff':'#ddd';ctx.fill();
   ctx.strokeStyle=pathIndex===Number(ui.pathSelect.value)?'#e30613':'#333';ctx.lineWidth=5;ctx.stroke();
   if(pathIndex===Number(ui.pathSelect.value)){ctx.fillStyle='#111';ctx.font='700 20px Montserrat';ctx.fillText(String(pointIndex+1),p[0]+20,p[1]-16)}
  });
 });
 ctx.restore();
}
function render(){
 if(!currentTemplate||!assets.base)return;
 ctx.clearRect(0,0,canvas.width,canvas.height);ctx.fillStyle='#f7f7f7';ctx.fillRect(0,0,canvas.width,canvas.height);
 ctx.drawImage(assets.shadow,0,0);ctx.drawImage(coloredMask(),0,0);
 ctx.save();ctx.globalCompositeOperation='multiply';ctx.globalAlpha=.70;ctx.drawImage(assets.base,0,0);ctx.restore();
 if(logo&&!editing)ctx.drawImage(logoLayer(),0,0);
 ctx.save();ctx.globalCompositeOperation='multiply';ctx.globalAlpha=.72;ctx.drawImage(assets.overlay,0,0);ctx.restore();
 ctx.drawImage(assets['hook:'+ui.hook.value],0,0);drawEditor();
}
function canvasPoint(event){
 const rect=canvas.getBoundingClientRect();
 const touch=event.touches?.[0]||event.changedTouches?.[0]||event;
 return {x:(touch.clientX-rect.left)*canvas.width/rect.width,y:(touch.clientY-rect.top)*canvas.height/rect.height};
}
function nearestPoint(x,y){
 let best=null,bestDist=40;
 sessionPaths.forEach((path,pi)=>path.points.forEach((p,i)=>{const d=Math.hypot(x-p[0],y-p[1]);if(d<bestDist){best={pathIndex:pi,pointIndex:i};bestDist=d}}));return best;
}
function beginPointer(e){
 if(!editing)return;e.preventDefault();const p=canvasPoint(e),near=nearestPoint(p.x,p.y);
 if(near){dragging=near;ui.pathSelect.value=String(near.pathIndex)}
 else{const index=Number(ui.pathSelect.value);sessionPaths[index].points.push([Math.round(p.x),Math.round(p.y)]);render()}
}
function movePointer(e){
 if(!editing||!dragging)return;e.preventDefault();const p=canvasPoint(e);
 sessionPaths[dragging.pathIndex].points[dragging.pointIndex]=[Math.round(p.x),Math.round(p.y)];render();
}
function endPointer(){dragging=null}
function setEditing(value){
 editing=value;ui.stage.classList.toggle('editing',value);ui.editorControls.classList.toggle('hidden',!value);
 ui.editorHint.classList.toggle('hidden',!value);ui.copyPath.classList.toggle('hidden',value);
 ui.modeBadge.textContent=value?'PAD BEWERKEN':'ECHTE PSD-LAGEN';ui.editPath.textContent=value?'Bewerken stoppen':'Pad bewerken';render();
}
async function init(){
 const response=await fetch('templates.json',{cache:'no-store'});if(!response.ok)throw new Error('templates.json kon niet laden');
 config=await response.json();config.templates.forEach(t=>{const o=document.createElement('option');o.value=t.id;o.textContent=t.label;ui.template.appendChild(o)});
 await loadTemplate(config.templates[0].id);
}
ui.template.addEventListener('change',()=>loadTemplate(ui.template.value).catch(showError));
ui.logoInput.addEventListener('change',()=>{const file=ui.logoInput.files?.[0];if(!file)return;const url=URL.createObjectURL(file),im=new Image();im.onload=()=>{logo=im;ui.filename.textContent=file.name;ui.empty.style.display='none';URL.revokeObjectURL(url);render()};im.onerror=()=>{URL.revokeObjectURL(url);alert('Dit logo kon niet worden geopend.')};im.src=url});
ui.hook.addEventListener('change',render);
ui.color.addEventListener('input',()=>{ui.hex.value=ui.color.value.toUpperCase();render()});
ui.hex.addEventListener('input',()=>{if(/^#[0-9A-Fa-f]{6}$/.test(ui.hex.value)){ui.color.value=ui.hex.value;render()}});
ui.size.addEventListener('input',()=>{ui.sizeValue.textContent=ui.size.value+'%';adviseCount();render()});
ui.logoCount.addEventListener('input',()=>{ui.countValue.textContent=ui.logoCount.value;if(ui.autoCount.checked)ui.autoCount.checked=false;render()});
ui.offset.addEventListener('input',()=>{ui.offsetValue.textContent=ui.offset.value+'%';render()});
ui.rotation.addEventListener('input',()=>{ui.rotationValue.textContent=ui.rotation.value+'°';render()});
ui.autoCount.addEventListener('change',()=>{adviseCount();render()});
ui.editPath.addEventListener('click',()=>setEditing(!editing));
ui.pathSelect.addEventListener('change',render);
ui.undoPoint.addEventListener('click',()=>{const p=sessionPaths[Number(ui.pathSelect.value)];p.points.pop();render()});
ui.clearPath.addEventListener('click',()=>{sessionPaths[Number(ui.pathSelect.value)].points=[];render()});
ui.savePath.addEventListener('click',()=>setEditing(false));
ui.copyPath.addEventListener('click',async()=>{const text=JSON.stringify(sessionPaths,null,2);try{await navigator.clipboard.writeText(text);ui.copyPath.textContent='Gekopieerd ✓';setTimeout(()=>ui.copyPath.textContent='Padgegevens kopiëren',1600)}catch{prompt('Kopieer deze padgegevens:',text)}});
canvas.addEventListener('mousedown',beginPointer);canvas.addEventListener('mousemove',movePointer);window.addEventListener('mouseup',endPointer);
canvas.addEventListener('touchstart',beginPointer,{passive:false});canvas.addEventListener('touchmove',movePointer,{passive:false});window.addEventListener('touchend',endPointer);
$('reset').addEventListener('click',()=>{ui.color.value='#e30613';ui.hex.value='#E30613';ui.size.value=52;ui.offset.value=0;ui.rotation.value=0;ui.autoCount.checked=true;ui.sizeValue.textContent='52%';ui.offsetValue.textContent='0%';ui.rotationValue.textContent='0°';ui.hook.selectedIndex=0;sessionPaths=clonePaths(currentTemplate.paths);adviseCount();setEditing(false);render()});
$('download').addEventListener('click',()=>{const wasEditing=editing;if(wasEditing)editing=false;render();const a=document.createElement('a');a.download=`xxlgifts-${currentTemplate.id}-mockup.png`;a.href=canvas.toDataURL('image/png');a.click();if(wasEditing){editing=true;render()}});
function showError(err){console.error(err);ui.loading.style.display='flex';ui.loading.textContent='Fout: '+err.message}
init().catch(showError);