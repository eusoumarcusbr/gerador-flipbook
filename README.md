# Gerador de Flipbook | SECOM TCE-MT

Transforma um PDF em um flipbook HTML com efeito de virar página, em um único arquivo, pronto para hospedar no servidor e embutir no portal via iframe.

Ferramenta: https://www.tce.mt.gov.br/uploads/flipbook/criador/index.html
Guia de uso: https://www.tce.mt.gov.br/uploads/flipbook/criador/guia.html

## Como usar
1. Abra a ferramenta no navegador (Chrome recomendado).
2. Importe o PDF (ou arraste o arquivo para a tela).
3. Escolha o tema e confira em Visualizar.
4. Compartilhar: baixe o HTML, hospede no servidor e cole o código do iframe.

## Arquivos
- `index.html`: a ferramenta inteira (editor + template do viewer exportado).
- `guia.html`: guia de uso para a equipe, em página web (hospedar junto com a ferramenta).
- `GUIA.md`: o mesmo guia em texto.
- `CONTEXTO.md`: documentação técnica. Ler antes de alterar o código.
- `criadorflipbook.js`: primeira versão (React), mantida como histórico. Não é usada.

## Versões
- v2.0.0 (04/11/2026): redesign do editor e do viewer, prévia igual ao arquivo publicado, miniaturas, zoom, tela cheia.
- v1.1.0 (04/11/2026): páginas em alta resolução (2800 px, WebP) e proporção seguindo o PDF.
- v1.0.0 (mar/2026): versão inicial.
