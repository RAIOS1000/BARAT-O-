# 🏷️ BARATÃO

Busca o **menor preço** de produtos no **Paraná** usando dados **oficiais de nota fiscal (NFC-e)** do programa **Menor Preço — Nota Paraná** (SEFA/PR), atualizados em tempo real. App de página única, sem build, pronto para o GitHub Pages.

- 📍 Usa sua **localização** e mostra distância até cada estabelecimento
- 🧾 Preços reais de **+109 mil estabelecimentos**, do valor da última nota fiscal
- 🔀 Ordena por **menor preço** ou **mais perto**, raio de 1 a 20 km
- 🗺️ Botão **Como chegar** (Google Maps) e badge de **frescor** do preço (há Xh/dias)
- 🕘 Histórico de buscas (salvo no próprio navegador)

---

## 🚀 Publicar no GitHub Pages

1. Crie um repositório (ex: `BARATAO`) na conta `raios1000`.
2. Suba o arquivo **`index.html`** (e, opcionalmente, `worker.js` e este README).
3. No GitHub: **Settings → Pages → Branch: `main` / `root` → Save**.
4. Em ~1 min fica no ar em: `https://raios1000.github.io/BARATAO/`

---

## ⚠️ O ponto crítico: CORS

A API do governo **não envia cabeçalhos CORS**, então o navegador **bloqueia** a chamada direta a partir de um site hospedado (GitHub Pages). O app já contorna isso com uma cadeia de "canos" que ele tenta em ordem:

1. **direto** — funciona ao abrir o `index.html` localmente, ou se o gov liberar CORS
2. **seu Cloudflare Worker** — o caminho recomendado (rápido e confiável)
3. **proxies públicos** (allorigins / corsproxy) — reserva automática, mas podem ficar instáveis

### Recomendado: seu próprio Worker (grátis, ~2 min)

1. Conta em <https://dash.cloudflare.com> (plano free basta)
2. **Workers & Pages → Create → Worker** → cole o conteúdo de **`worker.js`** → **Deploy**
3. Copie a URL gerada (ex: `https://baratao.SEU-USER.workers.dev`)
4. No `index.html`, ajuste:

```js
const CONFIG = {
  ...
  PROXY_URL: "https://baratao.SEU-USER.workers.dev/?url=",
  ...
};
```

Pronto — o app passa a usar seu cano oficial e ignora os proxies públicos.

---

## 🔧 Ajustar o mapeamento de campos (se precisar)

Não consegui bater no endpoint ao vivo durante a construção, então o mapeamento dos campos da resposta foi feito de forma **defensiva** (aceita vários nomes possíveis). Se algum dado vier vazio na primeira busca:

1. Abra **"ver resposta crua da API"** no rodapé dos resultados.
2. Veja os nomes reais dos campos (preço, nome do estabelecimento, lat/lng, data).
3. Ajuste o objeto **`F`** no topo do `<script>` do `index.html` — é só adicionar o nome certo na lista.

Parâmetros da consulta (também no topo): `DATA_DIAS` (janela de 1 a 15 dias) e o raio (no seletor da tela).

---

## 📁 Arquivos

| Arquivo | O que é |
|---|---|
| `index.html` | O app inteiro (HTML + CSS + JS, sem dependências de build) |
| `worker.js` | Proxy CORS opcional para Cloudflare Workers |
| `README.md` | Este guia |

---

## 📌 Observações

- O valor exibido é o da **última nota fiscal** do produto — pode não ser o preço atual. O app deixa isso claro e sugere confirmar no local.
- A base cobre **apenas o Paraná**. Fora do estado, o app oferece buscar a partir do **centro de Curitiba**.
- Fonte oficial: <https://menorpreco.notaparana.pr.gov.br>

Feito para rodar de verdade. 🟢
