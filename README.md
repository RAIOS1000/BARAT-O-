# 🏷️ BARATÃO — assistente de compras

Monte sua lista, importe seu arquivo e ache os melhores preços por localidade. App estático, pronto pro GitHub Pages.

## ✨ O que tem

- 📍 **Local livre** — GPS ou busca de qualquer cidade
- 🔎 **Buscar** — melhor preço de um produto (comparadores grátis; ou preços reais na tela com o motor inteligente)
- 🗂️ **Catálogo** — +200 itens comuns de supermercado por seção (mercearia, hortifruti, açougue, frios, bebidas, limpeza, higiene, pet…). Toque pra jogar na lista ou buscar
- 🧾 **Minha Lista** — quantidades, adicionar à mão, **importar arquivo (.txt/.csv)** e exportar
- ⚖️ **Comparar lista** — com o motor inteligente, compara a lista toda: melhor preço por item + **qual mercado sai mais barato no total**
- 📡 **Radar de preço** — preço-alvo que acende 🎯 quando a busca acha mais barato
- 🧮 **Calculadora por unidade** — mostra se o pacote maior compensa

Tudo salvo no próprio navegador.

## 🚀 Publicar (GitHub Pages)

1. Suba na **raiz**: `index.html`, `worker.js`, `README.md` e um arquivo vazio **`.nojekyll`**.
2. **Settings → Pages → Branch `main` / root → Save**.
3. No ar em `https://SEU-USER.github.io/SEU-REPO/`.

Já funciona no modo **Comparador** (grátis). Catálogo, Lista, Import/Export, Radar e Calculadora funcionam 100% offline.

## 🧠 Ligar o Motor Inteligente (preços reais + comparar lista)

O GitHub Pages é estático, então a chave não pode ficar no site. Usamos um **Cloudflare Worker** grátis.

1. <https://dash.cloudflare.com> → **Workers & Pages → Create → Worker** → cole `worker.js` → **Deploy**.
2. **Settings → Variables and Secrets → Add**: `ANTHROPIC_API_KEY` = sua chave `sk-ant-...` (Secret).
3. Copie a URL do Worker.
4. No app → ícone **motor** (topo) → cole a URL → **Ativar**.

Agora o **Buscar** mostra preços reais, e o **Comparar lista** funciona.

## 💸 Custo

Usa a API da Anthropic com busca web. Já vem com **cache (6h)** e **teto de buscas** pra segurar o gasto:
- busca de 1 item: até 4 pesquisas web
- comparar lista: **1 chamada** com até 8 pesquisas (mais barato que item por item)

Poucos centavos por operação com o modelo **Haiku** (padrão). Pra mais precisão, troque `MODEL` no `worker.js` por `"claude-sonnet-5"`. Recomendo definir um **limite de gasto mensal** no painel da Anthropic.

> ⚠️ A comparação de lista é uma **estimativa** baseada em busca web — ótima pra orientar, mas confirme no mercado antes de comprar.

## 📁 Arquivos

| Arquivo | O que é |
|---|---|
| `index.html` | O app |
| `worker.js` | Motor inteligente (busca + comparação de lista) |
| `README.md` | Este guia |

Feito pra economizar de verdade. 🟢
