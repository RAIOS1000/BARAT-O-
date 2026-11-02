# 🎯 Aprovadão — Página de vendas

Página de vendas (landing page) para divulgar e vender o **Aprovadão** — material/curso de preparação para concurso público — com checkout no **Kiwify**.

Site estático, pronto pra publicar de graça no **GitHub Pages**.

## 🚀 Publicar na internet (GitHub Pages)

1. No GitHub, abra este repositório → **Settings** → **Pages**
2. Em **Source**, escolha **Deploy from a branch**
3. Selecione a branch **`main`** e a pasta **`/ (root)`** → **Save**
4. Em ~1 minuto o site fica no ar em `https://SEU-USUARIO.github.io/SEU-REPO/`

> Para publicar, o conteúdo precisa estar na branch que o Pages usa (normalmente `main`). Depois de aprovar as mudanças desta branch, basta mesclá-las na `main`.

## ✏️ Como editar a página

Tudo está no arquivo **`index.html`**. Os pontos que você vai querer trocar estão marcados com comentários `<!-- EDITAR ... -->`. Os principais:

| O que | Onde |
|---|---|
| **Link do Kiwify** | No final do arquivo, na linha `const LINK_KIWIFY = ""` — cole o link do seu checkout entre as aspas. Todos os botões passam a apontar pra lá. |
| **Preço** | No final do arquivo, em `const PRECO` (valor, parcelas, à vista, preço "de"). |
| **E-mail de contato** | No final do arquivo, em `const CONTATO_EMAIL`. |
| **Textos / benefícios / módulos** | Procure pelos comentários `<!-- EDITAR ... -->`. |
| **Depoimentos** | A seção está **escondida** (os textos são exemplos). Troque pelos reais e apague o `hidden` da `<section>`. |

Enquanto o link do Kiwify estiver vazio, os botões rolam até a seção de preço. Preço e contato vazios simplesmente não aparecem — nada quebra.

## 🌐 Domínio próprio (opcional)

O site funciona de graça no endereço `.github.io`. Se quiser um domínio próprio (ex.: `seunome.com.br`), compre em um registrador (Registro.br, Hostinger, Cloudflare…) e conecte ao GitHub Pages (Settings → Pages → Custom domain). É só pedir ajuda pra configurar o DNS e o arquivo `CNAME`.

## 📁 Arquivos

| Arquivo | O que é |
|---|---|
| `index.html` | A página de vendas (tudo aqui) |
| `.nojekyll` | Faz o GitHub Pages servir os arquivos como estão |
| `README.md` | Este guia |
