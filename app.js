const $=id=>document.getElementById(id);
const canvas=$('canvas'),ctx=canvas.getContext('2d');
const ui={
 template:$('template'),logoInput:$('logoInput'),filename:$('filename'),hook:$('hook'),
 color:$('color'),hex:$('hex'),size:$('size'),frontCount:$('frontCount'),backCount:$('backCount'),
 offset:$('offset'),rotation:$('rotation'),sizeValue:$('sizeValue'),
 frontCountValue:$('frontCountValue'),backCountValue:$('backCountValue'),
 offsetValue:$('offsetValue'),rotationValue:$('rotationValue'),empty:$('empty'),
 loading:$('loading'),previewTitle:$('previewTitle'),stage:$('stage'),editPath:$('editPath'),
 editorControls:$('editorControls'),pathSelect:$('pathSelect'),undoPoint:$('undoPoint'),
 clearPath:$('clearPath'),savePath:$('savePath'),editorHint:$('editorHint'),
 modeBadge:$('modeBadge'),copyPath:$('copyPath'),saveTools:$('saveTools'),downloadTemplate:$('downloadTemplate')
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
 sessionPaths=clonePaths(currentTemplate.paths);assets={};
 for(const [key,file] of Object.entries(currentTemplate.files))assets[key]=await loadImage(file);
 for(const hook of currentTemplate.hooks)assets['hook:'+hook.id]=await loadImage(hook.file);
 ui.hook.innerHTML='';currentTemplate.hooks.forEach(h=>{const o=document.createElement('option');o.value=h.id;o.textContent=h.label;ui.hook.appendChild(o)});
 ui.pathSelect.innerHTML='';sessionPaths.forEach((p,i)=>{const o=document.createElement('option');o.value=String(i);o.textContent=p.label||p.id;ui.pathSelect.appendChild(o)});
 ui.previewTitle.textContent=`${currentTemplate.label} · ${currentTemplate.material}`;
 const front=sessionPaths.find(p=>p.id==='front'),back=sessionPaths.find(p=>p.id==='back');
 ui.frontCount.value=front?.defaultLogoCount||7;ui.backCount.value=back?.defaultLogoCount||5;
 ui.frontCountValue.textContent=ui.frontCount.value;ui.backCountValue.textContent=ui.backCount.value;
 ui.loading.style.display='none';ui.saveTools.classList.remove('hidden');render();
}
function maskFill(mask,color){
 const c=offscreen(),g=c.getContext('2d');g.drawImage(mask,0,0);
 g.globalCompositeOperation='source-in';g.fillStyle=color;g.fillRect(0,0,c.width,c.height);return c;
}
function clippedTexture(mask,source,alpha=.7){
 const c=offscreen(),g=c.getContext('2d');g.drawImage(source,0,0);
 g.globalCompositeOperation='destination-in';g.drawImage(mask,0,0);
 c._alpha=alpha;return c;
}
function pathLength(points){let total=0;for(let i=1;i<points.length;i++)total+=Math.hypot(points[i][0]-points[i-1][0],points[i][1]-points[i-1][1]);return total}
function pointAtDistance(points,distance){
 if(points.length<2)return null;let walked=0;
 for(let i=1;i<points.length;i++){const a=points[i-1],b=points[i],segment=Math.hypot(b[0]-a[0],b[1]-a[1]);
  if(walked+segment>=distance){const t=(distance-walked)/segment;return{x:a[0]+(b[0]-a[0])*t,y:a[1]+(b[1]-a[1])*t,angle:Math.atan2(b[1]-a[1],b[0]-a[0])}}
  walked+=segment}
 const a=points.at(-2),b=points.at(-1);return{x:b[0],y:b[1],angle:Math.atan2(b[1]-a[1],b[0]-a[0])};
}
function logosForPath(path,count){
 const c=offscreen(),g=c.getContext('2d');if(!logo||path.points.length<2)return c;
 const length=pathLength(path.points),margin=Math.min(length*.12,85),usable=Math.max(1,length-margin*2);
 const size=Number(ui.size.value),extra=Number(ui.rotation.value)*Math.PI/180;
 const offsetPct=Number(ui.offset.value)/100;
 for(let i=0;i<count;i++){
  const base=count===1?.5:i/(count-1),shifted=Math.max(0,Math.min(1,base+offsetPct/Math.max(1,count)));
  const pos=pointAtDistance(path.points,margin+usable*shifted);if(!pos)continue;
  g.save();g.translate(pos.x,pos.y);g.rotate(pos.angle+(path.rotationOffset||0)*Math.PI/180+extra);
  drawContained(g,logo,size*2.12,size*.58);g.restore();
 }
 g.globalCompositeOperation='destination-in';g.drawImage(assets[path.mask],0,0);return c;
}
function drawRibbonSide(path,count){
 const mask=assets[path.mask];
 ctx.drawImage(maskFill(mask,ui.color.value),0,0);
 const texture=clippedTexture(mask,assets.base);
 ctx.save();ctx.globalCompositeOperation='multiply';ctx.globalAlpha=.70;ctx.drawImage(texture,0,0);ctx.restore();
 if(logo)ctx.drawImage(logosForPath(path,count),0,0);
}
function drawEditor(){
 if(!editing)return;ctx.save();ctx.lineCap='round';ctx.lineJoin='round';
 sessionPaths.forEach((path,pi)=>{if(path.points.length){ctx.beginPath();ctx.moveTo(path.points[0][0],path.points[0][1]);path.points.slice(1).forEach(p=>ctx.lineTo(p[0],p[1]));ctx.strokeStyle=pi===Number(ui.pathSelect.value)?'#e30613':'rgba(20,20,20,.55)';ctx.lineWidth=7;ctx.stroke()}
 path.points.forEach((p,i)=>{ctx.beginPath();ctx.arc(p[0],p[1],pi===Number(ui.pathSelect.value)?15:10,0,Math.PI*2);ctx.fillStyle=pi===Number(ui.pathSelect.value)?'#fff':'#ddd';ctx.fill();ctx.strokeStyle=pi===Number(ui.pathSelect.value)?'#e30613':'#333';ctx.lineWidth=5;ctx.stroke();if(pi===Number(ui.pathSelect.value)){ctx.fillStyle='#111';ctx.font='700 20px Montserrat';ctx.fillText(String(i+1),p[0]+20,p[1]-16)}})});ctx.restore();
}
function render(){
 if(!currentTemplate||!assets.base)return;
 ctx.clearRect(0,0,canvas.width,canvas.height);ctx.fillStyle='#f7f7f7';ctx.fillRect(0,0,canvas.width,canvas.height);
 ctx.drawImage(assets.shadow,0,0);
 const back=sessionPaths.find(p=>p.id==='back'),front=sessionPaths.find(p=>p.id==='front');
 if(back)drawRibbonSide(back,Number(ui.backCount.value));
 if(front)drawRibbonSide(front,Number(ui.frontCount.value));
 ctx.save();ctx.globalCompositeOperation='multiply';ctx.globalAlpha=.72;ctx.drawImage(assets.overlay,0,0);ctx.restore();
 ctx.drawImage(assets['hook:'+ui.hook.value],0,0);drawEditor();
}
function canvasPoint(event){const rect=canvas.getBoundingClientRect(),p=event.touches?.[0]||event.changedTouches?.[0]||event;return{x:(p.clientX-rect.left)*canvas.width/rect.width,y:(p.clientY-rect.top)*canvas.height/rect.height}}
function nearestPoint(x,y){let best=null,bestDist=40;sessionPaths.forEach((path,pi)=>path.points.forEach((p,i)=>{const d=Math.hypot(x-p[0],y-p[1]);if(d<bestDist){best={pathIndex:pi,pointIndex:i};bestDist=d}}));return best}
function beginPointer(e){if(!editing)return;e.preventDefault();const p=canvasPoint(e),near=nearestPoint(p.x,p.y);if(near){dragging=near;ui.pathSelect.value=String(near.pathIndex)}else{sessionPaths[Number(ui.pathSelect.value)].points.push([Math.round(p.x),Math.round(p.y)]);render()}}
function movePointer(e){if(!editing||!dragging)return;e.preventDefault();const p=canvasPoint(e);sessionPaths[dragging.pathIndex].points[dragging.pointIndex]=[Math.round(p.x),Math.round(p.y)];render()}
function endPointer(){dragging=null}
function setEditing(value){
 editing=value;
 ui.stage.classList.toggle('editing',value);
 ui.editorControls.classList.toggle('hidden',!value);
 ui.editorHint.classList.toggle('hidden',!value);
 ui.saveTools.classList.toggle('hidden',value);
 ui.modeBadge.textContent=value?'PAD BEWERKEN':'FRONT + BACK';
 ui.editPath.textContent=value?'Bewerken stoppen':'Pad bewerken';
 render();
}
function buildUpdatedConfig(){
 const updated=JSON.parse(JSON.stringify(config));
 const template=updated.templates.find(t=>t.id===currentTemplate.id);
 template.paths=JSON.parse(JSON.stringify(sessionPaths));
 return updated;
}
function downloadJson(filename,data){
 const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});
 const url=URL.createObjectURL(blob);
 const a=document.createElement('a');
 a.href=url;a.download=filename;a.click();
 setTimeout(()=>URL.revokeObjectURL(url),1000);
}
async function init(){const response=await fetch('templates.json',{cache:'no-store'});if(!response.ok)throw new Error('templates.json kon niet laden');config=await response.json();config.templates.forEach(t=>{const o=document.createElement('option');o.value=t.id;o.textContent=t.label;ui.template.appendChild(o)});await loadTemplate(config.templates[0].id)}
ui.template.addEventListener('change',()=>loadTemplate(ui.template.value).catch(showError));
ui.logoInput.addEventListener('change',()=>{const file=ui.logoInput.files?.[0];if(!file)return;const url=URL.createObjectURL(file),im=new Image();im.onload=()=>{logo=im;ui.filename.textContent=file.name;ui.empty.style.display='none';URL.revokeObjectURL(url);render()};im.onerror=()=>{URL.revokeObjectURL(url);alert('Dit logo kon niet worden geopend.')};im.src=url});
ui.hook.addEventListener('change',render);ui.color.addEventListener('input',()=>{ui.hex.value=ui.color.value.toUpperCase();render()});ui.hex.addEventListener('input',()=>{if(/^#[0-9A-Fa-f]{6}$/.test(ui.hex.value)){ui.color.value=ui.hex.value;render()}});
ui.size.addEventListener('input',()=>{ui.sizeValue.textContent=ui.size.value+'%';render()});ui.frontCount.addEventListener('input',()=>{ui.frontCountValue.textContent=ui.frontCount.value;render()});ui.backCount.addEventListener('input',()=>{ui.backCountValue.textContent=ui.backCount.value;render()});ui.offset.addEventListener('input',()=>{ui.offsetValue.textContent=ui.offset.value+'%';render()});ui.rotation.addEventListener('input',()=>{ui.rotationValue.textContent=ui.rotation.value+'°';render()});
ui.editPath.addEventListener('click',()=>setEditing(!editing));ui.pathSelect.addEventListener('change',render);ui.undoPoint.addEventListener('click',()=>{sessionPaths[Number(ui.pathSelect.value)].points.pop();render()});ui.clearPath.addEventListener('click',()=>{sessionPaths[Number(ui.pathSelect.value)].points=[];render()});ui.savePath.addEventListener('click',()=>setEditing(false));
ui.downloadTemplate.addEventListener('click',()=>{
 downloadJson('templates.json',buildUpdatedConfig());
 const original=ui.downloadTemplate.textContent;
 ui.downloadTemplate.textContent='Gedownload ✓';
 setTimeout(()=>ui.downloadTemplate.textContent=original,1600);
});
ui.copyPath.addEventListener('click',async()=>{
 const text=JSON.stringify(sessionPaths,null,2);
 try{
  await navigator.clipboard.writeText(text);
  ui.copyPath.textContent='Gekopieerd ✓';
  setTimeout(()=>ui.copyPath.textContent='Alleen padgegevens kopiëren',1600);
 }catch{
  prompt('Kopieer deze padgegevens:',text);
 }
});
canvas.addEventListener('mousedown',beginPointer);canvas.addEventListener('mousemove',movePointer);window.addEventListener('mouseup',endPointer);canvas.addEventListener('touchstart',beginPointer,{passive:false});canvas.addEventListener('touchmove',movePointer,{passive:false});window.addEventListener('touchend',endPointer);
$('reset').addEventListener('click',()=>{ui.color.value='#e30613';ui.hex.value='#E30613';ui.size.value=52;ui.frontCount.value=7;ui.backCount.value=5;ui.offset.value=0;ui.rotation.value=0;ui.sizeValue.textContent='52%';ui.frontCountValue.textContent='7';ui.backCountValue.textContent='5';ui.offsetValue.textContent='0%';ui.rotationValue.textContent='0°';ui.hook.selectedIndex=0;sessionPaths=clonePaths(currentTemplate.paths);setEditing(false);render()});
$('download').addEventListener('click',()=>{const wasEditing=editing;if(wasEditing)editing=false;render();const a=document.createElement('a');a.download=`xxlgifts-${currentTemplate.id}-mockup.png`;a.href=canvas.toDataURL('image/png');a.click();if(wasEditing){editing=true;render()}});
function showError(err){console.error(err);ui.loading.style.display='flex';ui.loading.textContent='Fout: '+err.message}
init().catch(showError);