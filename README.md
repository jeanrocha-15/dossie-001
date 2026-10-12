# DOSSIÊ 001

Site estático com HTML, CSS, JavaScript e Three.js. Sem cadastro e sem envio de dados da investigação. O progresso fica neste navegador.

## Arquivos
- index.html: estrutura e diálogos.
- style.css: identidade visual, responsividade e acessibilidade.
- config.js: cores adjacentes, dicas e duração de retorno do cubo.
- state.js: leitura, validação e restauração de progresso.
- app.js: evidências, teclado, histórico, dicas e prévia da câmera.
- cube.js: seis faces 3D, toque, arraste e retorno em 600 ms.
- tests/state.test.js: testes de leitura, validação e persistência.

## Executar
Com Node.js instalado: `npm start`. Abra http://127.0.0.1:4173.
Testes: `npm test`.
Three.js é carregado de uma URL CDN com versão fixa. A câmera exige HTTPS ou localhost. O leitor QR e sua validação definitiva estão reservados para a próxima versão.

## Publicar no GitHub Pages
1. Em Settings → General do repositório senha-secreta, altere Repository name para dossie-001.
2. Preserve a versão anterior em uma branch de backup antes de enviar os novos arquivos.
3. Envie os arquivos desta pasta para a raiz da branch main, sem a pasta .git.
4. Em Settings → Pages, selecione Deploy from a branch, main e /(root), e salve.
5. Aguarde o deploy e abra https://jeanrocha-15.github.io/dossie-001/.

A branch remota backup/pre-dossie-001-2026-10-12 preserva a versão anterior. O repositório foi renomeado para dossie-001.

## Limites da versão
O bloqueio das etapas é parte do jogo. Como todo site estático, o código de validação pode ser inspecionado no navegador. Nenhuma resposta é exibida na interface antes da validação.
As cores das faces adjacentes devem ser confirmadas contra o cubo físico e podem ser alteradas em config.js.
