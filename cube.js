import {CONFIG} from './config.js';
export async function createCube(container,initialValues,onSelect){
 const THREE=await import('https://cdn.jsdelivr.net/npm/three@0.169.0/build/three.module.js');
 const renderer=new THREE.WebGLRenderer({antialias:true,alpha:true});
 renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.outputColorSpace=THREE.SRGBColorSpace;container.append(renderer.domElement);
 const scene=new THREE.Scene(),group=new THREE.Group();scene.add(group);
 const camera=new THREE.PerspectiveCamera(35,1,.1,50);camera.position.set(0,0,9);
 const home=new THREE.Quaternion().setFromEuler(new THREE.Euler(.20,-.26,0,'XYZ'));group.quaternion.copy(home);
 const front=[],all=[],textures=[];
 const body=new THREE.Mesh(new THREE.BoxGeometry(3.04,3.04,3.04),new THREE.MeshBasicMaterial({color:'#101010'}));group.add(body);all.push(body);
 const frames=[
 ['front',[0,0,1.535],[0,0,0]],['back',[0,0,-1.535],[0,Math.PI,0]],
 ['top',[0,1.535,0],[-Math.PI/2,0,0]],['bottom',[0,-1.535,0],[Math.PI/2,0,0]],
 ['left',[-1.535,0,0],[0,-Math.PI/2,0]],['right',[1.535,0,0],[0,Math.PI/2,0]]
 ];
 let values=[...initialValues],disposed=false;
 function draw(tile,i){const ctx=tile.userData.ctx;ctx.fillStyle=CONFIG.faces.front;ctx.fillRect(0,0,256,256);if(i!==4){ctx.fillStyle='#161616';ctx.font='600 130px Arial';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(values[i]||'',128,137);}tile.material.map.needsUpdate=true;}
 for(const [name,pos,rotation]of frames){const face=new THREE.Group();face.position.set(...pos);face.rotation.set(...rotation);group.add(face);
 for(let i=0;i<9;i++){let mat;if(name==='front'){const canvas=document.createElement('canvas');canvas.width=canvas.height=256;const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;textures.push(texture);mat=new THREE.MeshBasicMaterial({map:texture});const tile=new THREE.Mesh(new THREE.PlaneGeometry(.91,.91),mat);tile.userData={index:i,ctx:canvas.getContext('2d')};front.push(tile);tile.position.set((i%3-1)*1.01,(1-Math.floor(i/3))*1.01,0);face.add(tile);all.push(tile);draw(tile,i);}else{mat=new THREE.MeshBasicMaterial({color:CONFIG.faces[name]});const tile=new THREE.Mesh(new THREE.PlaneGeometry(.91,.91),mat);tile.position.set((i%3-1)*1.01,(1-Math.floor(i/3))*1.01,0);face.add(tile);all.push(tile);}}
 }
 const ray=new THREE.Raycaster(),pointer=new THREE.Vector2();let drag=null,returning=null,frame;
 function resize(){const w=container.clientWidth,h=container.clientHeight;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();}
 const observer=new ResizeObserver(resize);observer.observe(container);resize();
 const canvas=renderer.domElement;canvas.setAttribute('aria-label','Cubo tridimensional: arraste para girar e toque na face branca para preencher. Os botões abaixo também permitem preencher.');canvas.setAttribute('role','img');
 canvas.addEventListener('pointerdown',e=>{if(drag)return;returning=null;drag={id:e.pointerId,x:e.clientX,y:e.clientY,lastX:e.clientX,lastY:e.clientY,moved:false};canvas.setPointerCapture(e.pointerId);});
 canvas.addEventListener('pointermove',e=>{if(!drag||drag.id!==e.pointerId)return;const dx=e.clientX-drag.lastX,dy=e.clientY-drag.lastY;if(Math.hypot(e.clientX-drag.x,e.clientY-drag.y)>6)drag.moved=true;
 if(drag.moved){const q=new THREE.Quaternion().setFromEuler(new THREE.Euler(dy*.008,dx*.008,0));group.quaternion.premultiply(q);}
 drag.lastX=e.clientX;drag.lastY=e.clientY;});
 function release(e,cancel=false){if(!drag||drag.id!==e.pointerId)return;
 if(!cancel&&!drag.moved){const r=canvas.getBoundingClientRect();pointer.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);scene.updateMatrixWorld(true);ray.setFromCamera(pointer,camera);const hit=ray.intersectObjects(all,false)[0];if(hit&&front.includes(hit.object)&&hit.object.userData.index!==4)onSelect(hit.object.userData.index);}
 drag=null;returning={start:performance.now(),from:group.quaternion.clone()};}
 canvas.addEventListener('pointerup',e=>release(e));canvas.addEventListener('pointercancel',e=>release(e,true));canvas.addEventListener('lostpointercapture',e=>{if(drag)release(e,true);});
 function animate(t){if(disposed)return;if(returning){const p=Math.min(1,(t-returning.start)/CONFIG.returnDuration);group.quaternion.slerpQuaternions(returning.from,home,1-Math.pow(1-p,3));if(p===1)returning=null;}renderer.render(scene,camera);frame=requestAnimationFrame(animate);}frame=requestAnimationFrame(animate);
 return {update(next){values=[...next];front.forEach(draw);},dispose(){disposed=true;cancelAnimationFrame(frame);observer.disconnect();all.forEach(m=>{m.geometry.dispose();m.material.dispose();});textures.forEach(t=>t.dispose());renderer.dispose();canvas.remove();}};
}
