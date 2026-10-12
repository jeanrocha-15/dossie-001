export const BORDER=[0,1,2,5,8,7,6,3];
export const fresh=()=>({version:1,stage:1,values:Array(9).fill(''),hints:0,solved:false});
export const sequence=values=>BORDER.map(i=>values[i]||'·').join('');
export function valid(values){return BORDER.every(i=>/^[0-9]$/.test(values[i])) && BORDER.reduce((n,i)=>n*10+Number(values[i]),0)===22082026;}
export function restore(raw){
 try{const s=JSON.parse(raw);if(s?.version!==1||!Array.isArray(s.values)||s.values.length!==9)return fresh();
 const values=s.values.map((v,i)=>i!==4&&/^[0-9]$/.test(v)?String(v):'');const solved=s.solved===true&&valid(values);
 return {version:1,values,solved,stage:solved&&s.stage===3?3:s.stage>=2?2:1,hints:Math.max(0,Math.min(3,Number(s.hints)||0))};
 }catch{return fresh();}
}
