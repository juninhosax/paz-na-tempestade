# Paz na Tempestade

Landing page de vendas do livro **Paz na Tempestade — 21 dias para vencer a ansiedade e viver no descanso de Deus**, de José Cláudio Cândido Júnior.

## Publicação

Site estático, sem build. Suba o conteúdo desta pasta na raiz do servidor (`public_html`) ou ative o GitHub Pages em Settings → Pages → branch `main`, pasta `/ (root)`.

```
index.html            página única
style.css             estilos
script.js             fundo animado de partículas
js/three.module.js    biblioteca da animação (local)
img/                  imagens e favicon
.htaccess             MIME types e cache (Apache)
fonte/                arquivos de autoria do projeto
```

Todos os caminhos são relativos. Dependências externas: Google Fonts e o link de checkout.

## Checkout

Os botões apontam para `https://pay.kiwify.com.br/EmpIPGx`.

## Meta Pixel

Pixel `1442446967336151` instalado no `<head>` do `index.html`:

- `PageView` e `ViewContent` ao carregar a página;
- `InitiateCheckout` ao clicar em qualquer botão de checkout.

O evento `Purchase` deve ser configurado na Kiwify (produto → Pixels → Facebook), com o mesmo ID.
