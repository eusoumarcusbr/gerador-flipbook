# Flipbook Creator TCE-MT: contexto do projeto

Ler este arquivo antes de mexer no código. Atualizado em 04/11/2026 (redesign completo).

## O que é
Ferramenta web da SECOM/TCE-MT que transforma um PDF (programações de evento, publicações) em um flipbook HTML com efeito de virar página. Gera um único arquivo `flipbook-<nome>.html`, autocontido, que é hospedado no servidor do TCE-MT e embutido no portal/intranet via iframe.

Fluxo de uso: abrir o Flipbook Creator > Importar PDF (ou arrastar o PDF para a tela) > escolher tema > Visualizar > Compartilhar > Baixar o HTML > subir no servidor > colar o iframe.

## Arquivos da pasta
- `index.html`: a ferramenta inteira (HTML + CSS + JS vanilla em um arquivo). Único arquivo em uso. Contém também o template do viewer exportado.
- `index_antigo_2026-11-04.html`: versão anterior ao redesign (layout antigo, já com a melhoria de qualidade). Referência.
- `index_antigo.html`: versão de mar/2026, proporção fixa 3/4. Referência.
- `criadorflipbook.js`: primeira versão, componente React (origem do projeto). Não é usado.
- `_notes/dwsync.xml`: controle de sincronização do Dreamweaver.
- `guia.html`: guia de uso para a equipe em página web (autocontida, com capturas de tela embutidas). Hospedar junto com a ferramenta.
- `GUIA.md`: o mesmo guia em texto.
- `README.md`: apresentação do repositório no GitHub.
- `CONTEXTO.md`: este arquivo.

## Publicação
Ferramenta publicada em https://www.tce.mt.gov.br/uploads/flipbook/criador/index.html e guia em https://www.tce.mt.gov.br/uploads/flipbook/criador/guia.html (pasta `uploads/flipbook/criador/` do servidor). Código versionado em github.com/eusoumarcusbr/gerador-flipbook (branch main). Arquivos enviados por FTP via Dreamweaver para `ftp.tce.mt.gov.br` (pasta remota: ver site configurado no Dreamweaver). Cada flipbook exportado é um arquivo HTML separado, hospedado no mesmo servidor.

Importante: mudanças no `index.html` só valem para flipbooks gerados depois. Flipbooks já publicados precisam ser reimportados e baixados de novo.

## Design (decisões de 04/11/2026)
- Fonte única: Public Sans (Google Fonts), criada para interfaces de governo. Números tabulares. Fraunces só nas citações das páginas de modelo.
- Editor: chrome neutro (cinza frio + azul TCE #1b4f72) que não muda com o tema do flipbook. Só a página no centro reflete o tema.
- Viewer: todas as cores derivadas do tema escolhido (fundo, barra, linhas, acento), calculadas em `buildViewer()` com `mix()`; funciona com tema claro e escuro.
- Sem travessões, sem labels em caixa alta, sem fonte mono em contadores.

## Estrutura técnica (index.html)
- Dependências externas: pdf.js 3.11.174 (cdnjs) e Google Fonts. Precisa de internet para funcionar.
- `<script type="text/template" id="vtpl">`: template completo do viewer exportado, com chaves `{{TITLE}}`, `{{DOCNAME}}`, `{{BG}}`, `{{SURF}}`, `{{INK}}`, `{{INK2}}`, `{{LINE}}`, `{{HOVER}}`, `{{ACC}}`, `{{PAGEBG}}`, `{{AR}}`, `{{IMAGES}}`, `{{THUMBS}}`, `{{PDF}}`, `{{PDFNAME}}`. O `</script>` interno está escrito como `<\/script>` e é convertido na exportação.
- Estado global `S`: `view` (editor/preview), `theme`, `logo`, `pages[]`, `sel`, `pdfMode` (replace/append), `pdfData` (PDF em base64), `pdfName`, `pendingFile` (PDF arrastado para a tela), `mobTab` (pages/page/edit), `ar` (proporção "w/h" lida do PDF).
- Cada página: `{id, tpl, title, sub, body, img, th, quote, qa}`. `img` = imagem grande (WebP), `th` = miniatura 200px (JPEG) gerada na importação.
- Temas em `TH`: tce, proMulher, modern, dark, nature. Modelos de página em `TP` e renderizados por `rpc()`.
- Funções principais: `render()` monta a tela; `editor()` / `topbar()` / `mtabs()` / `pitem()` / `redi()` montam o editor; `importPdf(file)` importa e renderiza o PDF; `buildViewer()` gera o HTML final a partir do template; `raster()` converte páginas de modelo em imagem (SVG foreignObject > canvas); `dlf()` baixa o arquivo; `rpdfm()` e `rshm()` são os modais.
- Prévia ("Visualizar") = o próprio HTML exportado dentro de um iframe (`srcdoc`). O que aparece na prévia é exatamente o que será publicado.
- Começa vazio (sem páginas de exemplo). Sem persistência: recarregar a página perde tudo.
- Botão "Guia" no topo abre `guia.html` (link relativo, mesma pasta) em nova aba.

## Qualidade das páginas
Onde: `importPdf()`.
- Escala calculada por página: lado maior em 2800 px, limitada entre 2x e 4x, teto de 16 milhões de pixels (limite do Safari). A4 sai em 1980x2800 px.
- WebP qualidade 0.9; se o navegador não gerar WebP (Safari), JPEG 0.92.
- Miniatura de 200 px por página (JPEG 0.8) para a lista do editor e para a faixa de miniaturas do viewer.
- Páginas de modelo (capa, citação etc.) são convertidas em imagem na exportação por `raster()`, 1860 px de largura. No Safari isso pode falhar (canvas "tainted"); nesse caso a página sai com um placeholder.

Para ajustar: mudar o `2800` (resolução) ou o `.9` (compressão). Tudo vai embutido em base64 no HTML exportado, então o peso cresce com o número de páginas (A4 de texto ~500 KB por página).

## Viewer exportado (o que o público vê)
- Uma página por vez, efeito de virar folha (CSS 3D), página anterior fica oculta após virar.
- Barra inferior: miniaturas, anterior/próxima, campo de página editável ("3 de 12"), ampliar (overlay com 100/150/200/300%), tela cheia, baixar PDF original (só se houver PDF).
- Barra de progresso arrastável acima dos controles. Setas laterais no desktop. Deslizar no celular.
- Teclado: setas, espaço, PageUp/PageDown, Home/End, Esc. `#p=N` na URL abre direto na página N.
- Acessibilidade: aria-labels, foco visível, leitor de tela recebe "Página X de Y", `prefers-reduced-motion` desliga a animação.
- Rodapé: "Desenvolvido pela SECOM do TCE-MT."
- Iframe sugerido no modal Compartilhar, com o nome real do arquivo.

## Histórico
- mar/2026: versão inicial (React, depois convertida para HTML único).
- abr/2026: proporção da página passa a seguir o PDF em vez de 3/4 fixo.
- 04/11/2026 (manhã): resolução e compressão das páginas aumentadas.
- 04/11/2026 (tarde): redesign completo do editor e do viewer; prévia passa a usar o viewer real; páginas de modelo viram imagem na exportação; miniaturas, zoom, tela cheia, barra de progresso. Testado com Playwright (Chromium) em 375, 768, 1440 e 1000x700.

## Limitações conhecidas
- Arquivo exportado pesado em PDFs com muitas páginas (tudo embutido).
- Navegadores muito antigos (antes de 2020) não exibem WebP.
- Sem salvar projeto: cada edição precisa ser refeita a partir do PDF.
- Fontes do Google não carregam dentro das páginas de modelo convertidas em imagem (usam fonte do sistema).
