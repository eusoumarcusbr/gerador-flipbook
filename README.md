# Gerador de Flipbook | SECOM TCE-MT

Transforma um PDF em um flipbook HTML com efeito de virar página, em um único arquivo, pronto para hospedar no servidor e embutir no portal via iframe.

## Como usar
1. Abra `index.html` no navegador (Chrome recomendado).
2. Importe o PDF (ou arraste o arquivo para a tela).
3. Escolha o tema e confira em Visualizar.
4. Compartilhar: baixe o HTML, hospede no servidor e cole o código do iframe.

## Arquivos
- `index.html`: a ferramenta inteira (editor + template do viewer exportado).
- `GUIA.md`: guia de uso para a equipe (passo a passo, dicas, problemas comuns).
- `CONTEXTO.md`: documentação técnica. Ler antes de alterar o código.
- `criadorflipbook.js`: primeira versão (React), mantida como histórico. Não é usada.

## Versões
- v2.0.0 (04/11/2026): redesign do editor e do viewer, prévia igual ao arquivo publicado, miniaturas, zoom, tela cheia.
- v1.1.0 (04/11/2026): páginas em alta resolução (2800 px, WebP) e proporção seguindo o PDF.
- v1.0.0 (mar/2026): versão inicial.
