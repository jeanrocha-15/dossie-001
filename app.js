import {CONFIG} from './config.js';
import {fresh,restore,sequence,valid} from './state.js';
const $=s=>document.querySelector(s);
let state=fresh(),view=1,cube=null,stream=null,selected=0,renderId=0;
try{state=restore(localStorage.getItem(CONFIG.storageKey));}catch{$('#storage-status').textContent='O progresso não poderá ser salvo neste navegador.';}
view=state.stage;
const titles=['A correspondência perdida','Oito fragmentos','A conexão invisível'];
const prompt='Atue como consultor da investigação DOSSIÊ 001 — O Caso da Mensagem que Nunca Foi Enviada. Ajude-me a observar evidências e organizar hipóteses. Ofereça uma pista sutil por vez e faça perguntas sobre o que observo. Não revele respostas, códigos, datas ou soluções; não deduza a solução por mim. Aguarde minha descrição da evidência atual.';
$('#prompt').value=prompt;
function save(){try{localStorage.setItem(CONFIG.storageKey,JSON.stringify(state));}catch{$('#storage-status').textContent='Não foi possível salvar o progresso. Mantenha esta página aberta.';}}
function stopCamera(){stream?.getTracks().forEach(t=>t.stop());stream=null;const video=$('video');if(video)video.srcObject=null;}
function navigate(n){if(n>state.stage)return;view=n;render();$('#evidence').focus();}
function history(){
 $('#history').replaceChildren();
 titles.forEach((title,i)=>{const row=document.createElement('div');row.className='history-row';const b=document.createElement('button');b.textContent=String(i+1).padStart(3,'0')+' · '+title;b.disabled=i+1>state.stage;b.onclick=()=>navigate(i+1);const status=document.createElement('small');status.textContent=i+1>state.stage?'Arquivo bloqueado':i===0&&state.stage>1||i===1&&state.solved?'Evidência autenticada':'Em investigação';row.append(b,status);$('#history').append(row);});
}
function render(){
 const token=++renderId;cube?.dispose();cube=null;stopCamera();history();
 $('#progress').textContent=String(view).padStart(2,'0')+' / 03';$('#progress-bar').style.width=(state.stage/3*100)+'%';
 const e=$('#evidence');e.innerHTML='<span class="badge">EVIDÊNCIA '+String(view).padStart(3,'0')+'</span><h2 id="evidence-title">'+titles[view-1]+'</h2>';
 if(view===1){
 e.innerHTML+='<h3 class="case-title">O Caso da Mensagem que Nunca Foi Enviada</h3><p>Uma correspondência sem remetente foi identificada. Seu conteúdo foi fragmentado e distribuído entre diferentes evidências.</p><p>Não sabemos quem a escreveu, por que foi escondida ou por que você foi escolhida para recuperá-la.</p><p>Sua missão é reconstruir a mensagem.</p><p>O primeiro fragmento está associado a um objeto com seis faces. Nele, a ordem foi perdida, mas apenas uma face precisa ser restaurada.</p><button class="primary" id="start">Iniciar investigação →</button>';
 $('#start').onclick=()=>{state.stage=Math.max(2,state.stage);save();navigate(2);};
 }else if(view===2){
 e.innerHTML+='<h3>Oito fragmentos. Uma única origem.</h3><p>As peças foram separadas, mas suas cores ainda conhecem o lugar ao qual pertencem.</p><p>Reconstrua a face branca do objeto encontrado. Observe as cores adjacentes para orientar o cubo.</p><p>Depois, transfira os oito números para a representação digital. O centro não participa da mensagem.</p><div class="cube-stage" id="cube"></div><p class="cube-note" id="cube-status">Arraste para observar · Toque em uma peça branca para preencher</p><div class="legend"></div><details id="accessible"><summary>Preencher face com botões</summary><div class="accessible-grid"></div></details><div class="sequence" aria-label="Sequência reconstruída" aria-live="polite"></div><p class="feedback" id="feedback" role="status"></p><button id="validate" class="primary">Validar sequência →</button><div id="recovered"></div><details class="hint"><summary>Dicas da investigação</summary><ol id="hints"></ol><button id="hint">Revelar próxima dica</button></details>';
 const names={top:'Acima',right:'Direita',bottom:'Abaixo',left:'Esquerda'};
 for(const [key,name]of Object.entries(names)){const s=document.createElement('span');const i=document.createElement('i');i.style.background=CONFIG.faces[key];s.append(i,name);$('.legend').append(s);}
 for(let i=0;i<9;i++){const b=document.createElement('button');b.dataset.cell=i;b.disabled=i===4;b.setAttribute('aria-label',i===4?'Centro branco bloqueado':'Linha '+(Math.floor(i/3)+1)+', coluna '+(i%3+1));b.onclick=()=>openCell(i);$('.accessible-grid').append(b);}
 refreshValues();refreshHints();if(state.solved)reveal();
 $('#hint').onclick=()=>{state.hints=Math.min(3,state.hints+1);save();refreshHints();};
 $('#validate').onclick=()=>{if(valid(state.values)){state.solved=true;save();reveal();history();}else{const f=$('#feedback');f.textContent=state.values.filter(Boolean).length<8?'Preencha os oito fragmentos antes de validar.':'A sequência ainda não foi autenticada. Revise os fragmentos e a orientação.';f.classList.remove('error');void f.offsetWidth;f.classList.add('error');}};
 import('./cube.js').then(async({createCube})=>{const c=await createCube($('#cube'),state.values,openCell);if(token!==renderId){c.dispose();return;}cube=c;}).catch(()=>{if(token!==renderId)return;$('#cube-status').textContent='A visualização 3D não carregou. Use os botões da face branca abaixo.';$('#accessible').open=true;$('#cube').hidden=true;});
 }else{
 e.innerHTML+='<p>Algumas conexões não precisam de fios.</p><p>Existe um código nesta casa que permite estabelecer uma conexão.</p><p>Encontre-o. A próxima transmissão depende dele.</p><div class="success"><h3>PRÓXIMA TRANSMISSÃO</h3><p>O leitor está em preparação. Nenhum código será validado nesta versão.</p></div><video id="camera" autoplay muted playsinline hidden></video><p id="camera-status" role="status"></p><div class="camera-actions"><button id="camera-start">Abrir câmera</button><button id="camera-stop" hidden>Fechar câmera</button></div>';
 $('#camera-start').onclick=async()=>{try{stopCamera();stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:'environment'}},audio:false});if(view!==3){stopCamera();return;}$('#camera').srcObject=stream;$('#camera').hidden=false;await $('#camera').play();$('#camera-stop').hidden=false;$('#camera-status').textContent='Prévia da câmera ativa. A leitura e a validação de QR Code serão adicionadas na próxima etapa.';}catch{$('#camera-status').textContent='Não foi possível abrir a câmera. Confira a permissão e use uma conexão HTTPS.';}};
 $('#camera-stop').onclick=()=>{stopCamera();$('#camera').hidden=true;$('#camera-stop').hidden=true;$('#camera-status').textContent='Câmera fechada.';};
 }
}
function refreshHints(){$('#hints').replaceChildren();CONFIG.hints.slice(0,state.hints).forEach(t=>{const li=document.createElement('li');li.textContent=t;$('#hints').append(li);});$('#hint').disabled=state.hints===3;$('#hint').textContent=state.hints===3?'Todas as dicas reveladas':'Revelar próxima dica ('+(state.hints+1)+'/3)';}
function refreshValues(){if(view!==2)return;$('.sequence').replaceChildren();for(const c of sequence(state.values)){const s=document.createElement('span');s.textContent=c;$('.sequence').append(s);}document.querySelectorAll('[data-cell]').forEach(b=>b.textContent=state.values[Number(b.dataset.cell)]||'');cube?.update(state.values);}
function openCell(i){if(i===4||view!==2||state.solved)return;selected=i;$('#cell-label').textContent='Linha '+(Math.floor(i/3)+1)+' · Coluna '+(i%3+1);$('#keypad').showModal();}
function enter(value){state.values[selected]=value;save();refreshValues();$('#feedback').textContent='';$('#keypad').close();}
for(const n of [1,2,3,4,5,6,7,8,9,0]){const b=document.createElement('button');b.type='button';b.textContent=n;b.onclick=()=>enter(String(n));$('.digits').append(b);}
$('#clear-digit').onclick=()=>enter('');
function reveal(){$('#feedback').textContent='';$('#validate').hidden=true;document.querySelectorAll('[data-cell]').forEach(b=>b.disabled=true);$('#recovered').innerHTML='<div class="success" role="status"><h3>REGISTRO TEMPORAL RECUPERADO</h3><p>22 de agosto de 2026.</p><p>Algumas datas deixam de ser apenas números.</p><p>Evidência autenticada.</p></div><button id="next" class="primary">Desbloquear próximo arquivo →</button>';$('#next').onclick=()=>{if(!state.solved||!valid(state.values))return;state.stage=3;save();navigate(3);};}
$('#copy-prompt').onclick=async()=>{try{await navigator.clipboard.writeText(prompt);$('#copy-status').textContent='Prompt copiado.';}catch{$('#prompt').focus();$('#prompt').select();$('#copy-status').textContent='Selecione e copie o prompt abaixo.';}};
$('#reset').onclick=()=>$('#reset-dialog').showModal();
$('#cancel-reset').onclick=()=>$('#reset-dialog').close();
$('#confirm-reset').onclick=()=>{state=fresh();save();view=1;$('#reset-dialog').close();render();};
document.addEventListener('visibilitychange',()=>{if(document.hidden)stopCamera();});
window.addEventListener('pagehide',()=>{stopCamera();cube?.dispose();});
render();
