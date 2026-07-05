# 🏷️ BARATÃO — caça-ofertas inteligente

Escolha **qualquer localidade** (GPS ou busca de cidade) e ache os **melhores preços** de qualquer produto. Não fica preso a código de barras / nota fiscal — varre a internet de verdade. App estático, pronto pro GitHub Pages.

## ✨ O que ele faz

- 📍 **Escolha o local** — sua posição por GPS ou busque qualquer cidade
- 🗂️ **Categorias** — Mercado, Combustível, Farmácia, Eletrônicos, Casa, Pet…
- 🧠 **Dois motores de busca:**
  - **Comparador (grátis, já funciona)** — dispara buscas certeiras em Google Shopping, Mercado Livre, Zoom, Buscapé e fontes por categoria
  - **Inteligente (com Worker)** — traz **preços reais na tela** (loja, valor, link da oferta), buscando na web na hora
- 📡 **Radar de Preço** — salve um produto com **preço-alvo**; quando a busca achar igual ou mais barato, ele acende 🎯
- 🧮 **Calculadora de preço por unidade** — descobre se o pacote maior compensa mesmo
- 🔗 **Compartilhar** a oferta no WhatsApp

Tudo salvo no seu navegador (radar, local, cache). Nada vai pra servidor nenhum sem ser você.

---

## 🚀 Passo 1 — publicar no GitHub Pages

1. Suba **`index.html`** (e opcionalmente `worker.js` e este README) na **raiz** do repositório.
2. Adicione um arquivo vazio chamado **`.nojekyll`** na raiz (evita o Jekyll atrapalhar).
3. **Settings → Pages → Branch `main` / root → Save**.
4. No ar em `https://SEU-USER.github.io/SEU-REPO/`.

> Já funciona assim no modo **Comparador**. Pra ligar o motor inteligente, siga o passo 2.

---

## 🧠 Passo 2 — ligar o Motor Inteligente (preços reais na tela)

O GitHub Pages é estático, então a chave da IA não pode ficar no site (ficaria exposta). Por isso usamos um **Cloudflare Worker** grátis que guarda a chave e faz a busca.

1. Conta em <https://dash.cloudflare.com> (plano free serve).
2. **Workers & Pages → Create → Worker** → cole o conteúdo de **`worker.js`** → **Deploy**.
3. **Settings → Variables and Secrets → Add:**
   - Nome: `ANTHROPIC_API_KEY`
   - Valor: sua chave `sk-ant-...` (marque como **Secret**)
4. Copie a URL do Worker (ex: `https://baratao.SEU-USER.workers.dev`).
5. Abra o BARATÃO → ícone **motor** (no topo) → cole a URL → **Ativar**.
   - Fica salvo no navegador. (Também dá pra fixar direto no `CONFIG.API_ENDPOINT` do `index.html`.)

Pronto: agora a busca mostra preços reais com link.

---

## 💸 Custo (importante)

O motor inteligente usa a API da Anthropic **com busca web**. Cada busca:
- faz até **4 pesquisas web** (limitado no `worker.js` em `MAX_BUSCAS`)
- + 1 chamada ao modelo (padrão **Haiku**, barato)

Na prática, **poucos centavos por busca**. Pra segurar o custo, o app já:
- **guarda cache** de buscas iguais por 6h (`CONFIG.CACHE_HORAS`) — não paga 2x pela mesma
- respeita o teto de pesquisas por consulta

Quer resultados melhores? No `worker.js`, troque `MODEL` para `"claude-sonnet-5"` (mais caro, mais preciso). Quer gastar menos? Mantenha o Haiku e aumente o cache.

> Dica: no painel da Anthropic dá pra definir **limite de gastos** na conta — recomendo configurar um teto mensal.

---

## 🔧 Ajustes rápidos (topo do `index.html`)

| Config | O que faz |
|---|---|
| `API_ENDPOINT` | URL do seu Worker (ou cole pela interface) |
| `CACHE_HORAS` | por quanto tempo reaproveita buscas iguais |
| `CATS` / `SUGGEST` | categorias e sugestões de produto |
| `CMP` | fontes do comparador por categoria |

---

## 📁 Arquivos

| Arquivo | O que é |
|---|---|
| `index.html` | O app inteiro |
| `worker.js` | Motor inteligente (Cloudflare Worker) |
| `README.md` | Este guia |

Feito pra economizar de verdade. 🟢
