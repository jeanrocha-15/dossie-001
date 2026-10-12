import test from 'node:test';
import assert from 'node:assert/strict';
import {BORDER,fresh,sequence,valid,restore} from '../state.js';
test('leitura horária dos oito quadrados',()=>{assert.deepEqual(BORDER,[0,1,2,5,8,7,6,3]);assert.equal(sequence(['0','1','2','3','','5','6','7','8']),'01258763');});
test('validação exata e rejeição de face incompleta',()=>{const v=['2','2','0','6','','8','2','0','2'];assert.equal(valid(v),true);v[8]='1';assert.equal(valid(v),false);v[8]='';assert.equal(valid(v),false);});
test('salvamento e restauração preservam valores e desbloqueio',()=>{const s={...fresh(),values:['2','2','0','6','','8','2','0','2'],solved:true,stage:3,hints:2};assert.deepEqual(restore(JSON.stringify(s)),s);});
test('progresso inválido não desbloqueia evidência 003',()=>{assert.equal(restore(JSON.stringify({...fresh(),stage:3,solved:true})).stage,2);assert.equal(restore('{bad').stage,1);assert.equal(restore(null).stage,1);});
test('centro bloqueado e dados inválidos são descartados',()=>{const s=restore(JSON.stringify({...fresh(),values:['<script>','2','0','6','9','8','2','0','2'],hints:99}));assert.equal(s.values[0],'');assert.equal(s.values[4],'');assert.equal(s.hints,3);});
