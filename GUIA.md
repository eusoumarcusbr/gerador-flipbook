# Guia de uso: Flipbook Creator

Transforma um PDF em um flipbook (publicação digital com efeito de virar página) para o portal e a intranet do TCE-MT.

## Antes de começar
- Tenha o PDF final do material (programação, revista, cartilha). Todas as páginas no mesmo tamanho.
- Use o Chrome ou o Edge. No Safari a ferramenta funciona, mas gera arquivos maiores.
- Dê um nome claro ao PDF antes de importar: ele vira o nome do arquivo e o título do flipbook (exemplo: `programacao-pro-mulher-2026.pdf`).

## Passo a passo

### 1. Abrir a ferramenta
Abra o `index.html` no navegador (ou o endereço onde ele está hospedado).

### 2. Importar o PDF
Clique em **Selecionar PDF** ou arraste o arquivo para a tela. A conversão mostra uma barra de progresso; espere terminar.

Para juntar dois PDFs: importe o primeiro, depois clique em **Importar PDF** e escolha **Adicionar ao final**.

### 3. Conferir as páginas
A lista à esquerda mostra todas as páginas. Ao passar o mouse sobre uma página aparecem os botões para mover para cima, mover para baixo e remover.

Clique em uma página para vê-la grande no centro.

### 4. Escolher o tema
No painel da direita, escolha a cor do flipbook (TCE-MT Institucional, TCE Pró-Mulher, Moderno, Escuro ou Sustentável). O tema muda o fundo e os controles do flipbook, não o conteúdo das páginas.

### 5. Visualizar
Clique em **Visualizar** no topo. O que aparece ali é exatamente o que o público vai ver. Teste as setas, as miniaturas e o zoom.

### 6. Baixar o arquivo
Clique em **Compartilhar** e depois em **Baixar flipbook-nome.html**. É um arquivo único, com todas as páginas e o PDF original dentro.

### 7. Publicar
Envie o arquivo para o servidor do TCE-MT (pelo Dreamweaver ou FTP) e copie o endereço público dele.

### 8. Embutir no portal
No modal Compartilhar, clique em **Copiar** no código do iframe, cole na página do portal ou da intranet e troque `SEU_LINK` pelo endereço do arquivo.

## O que o público pode fazer no flipbook
- Virar páginas: clique nas laterais, setas, teclado (setas, espaço, Home, End) ou deslizar no celular.
- Miniaturas de todas as páginas (primeiro botão da barra).
- Ampliar a página (lupa) com 100%, 150%, 200% e 300%.
- Tela cheia.
- Baixar o PDF original (último botão da barra).
- Abrir direto em uma página: acrescente `#p=5` ao final do endereço (abre na página 5).

## Dicas
- Para atualizar um flipbook já publicado: importe o PDF novo, baixe e substitua o arquivo no servidor com o mesmo nome. O link continua o mesmo.
- A ferramenta não salva o projeto. Se fechar a aba, importe o PDF de novo.
- Cada página pesa cerca de 500 KB no arquivo final. PDFs com muitas páginas geram arquivos grandes e demoram mais para abrir.
- As páginas de modelo (capa, citação, texto) servem para páginas extras simples. Para materiais diagramados, use sempre o PDF.

## Problemas comuns
- **Visualizar e Compartilhar desabilitados**: nenhuma página foi importada ainda.
- **Texto borrado no flipbook**: o PDF de origem está em baixa resolução. Exporte o PDF em alta qualidade (300 dpi) e importe de novo.
- **Página de modelo em branco no arquivo final**: aconteceu no Safari. Gere o arquivo pelo Chrome.
- **O flipbook não aparece no portal**: confira se o endereço no iframe está certo e se o arquivo foi enviado ao servidor.
