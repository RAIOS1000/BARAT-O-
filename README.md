# 🏷️ MULTIPLICADOR — preço real do dia

Jogue sua **lista de compras** e o Multiplicador faz a **cotação do preço do dia** pra você: o melhor preço de cada item e **qual mercado sai mais barato no total, em R$**. App estático, pronto pro GitHub Pages.

## ✨ O que ele faz

- 🧾 **Jogue a lista** — digite, adicione pelo catálogo (+200 itens) ou **importe um arquivo** (.txt/.csv)
- 🏪 **Meus mercados** — já vem preenchido com *Assaí, Carrefour, Costa, Moreirinha, Pão de Açúcar* (edite à vontade) e ele cota **exatamente nessas redes**
- ⭐ **Minhas marcas favoritas** — informe as marcas que você gosta (ex.: Tio João, Pilão, OMO) e ele **prioriza essas marcas** quando o preço é competitivo; se a favorita estiver muito mais cara, mostra a alternativa e avisa
- 🔒 **Cofre** — toda cotação é **guardada automaticamente** (data, lista, marcas, preços e fontes); na próxima cotação cada item mostra **↓/↑ quanto mudou**. Backup completo e restauração em 1 toque
- 🧾📷 **Nota fiscal (NFC-e)** — **leitor de QR code** que abre a nota na SEFAZ (o preço real que você pagou) e a **guarda no Cofre**; ou **insira a chave de acesso** (44 dígitos) à mão. Detecta o estado pela chave
- 📸🤖 **Foto do cupom → IA lê os itens** — tire uma foto do cupom e o motor (Opus 4.8, com visão) extrai **loja, itens e preços reais pagos** e guarda como **compra real** no Cofre. Esses preços viram base para o **↓/↑** das próximas cotações
- 🧾 **Auditoria de veracidade** — o motor é instruído a **nunca inventar preço** e a citar a fonte de cada item; a cotação mostra "X de Y itens com fonte verificável"
- 📊📄 **Exportar** — cada cotação vira **planilha (Google Sheets)** e **PDF** com o relatório completo e a linha de auditoria
- 📲 **Instala no iPhone** — abra no Safari → Compartilhar → *Adicionar à Tela de Início*; vira um app com ícone próprio (passo a passo no `MANUAL.md`)
- 💰 **Cotar preço do dia** — com o motor ligado, ele pesquisa na web com **olhar de comprador/dono de mercado** (menor custo real, sem visar lucro) e entrega: melhor preço por item **com preço por kg/L/un**, o **mercado campeão** (total num lugar só), a **cesta ótima** (cada item no mais barato + se vale rachar a compra) e **dicas de comprador** (caixa fechada, atacarejo, promoção)
- 🔎 **Buscar** — melhor preço de um produto avulso (com o motor) ou comparadores grátis (sem motor)
- 📡 **Radar de preço** — preço-alvo que acende 🎯 quando a busca acha mais barato
- 🧮 **Calculadora por unidade** — mostra se o pacote maior compensa

Tudo é salvo no próprio navegador.

## 🚀 Usar agora (2 passos)

1. Abra o app — ele já abre na **Lista**, com o local em **Goiânia** e seus mercados preenchidos (dá pra trocar tudo tocando em cima).
2. Toque no botão **motor** (topo) → cole sua chave da Anthropic **`sk-ant-…`** → **Ativar**.

Pronto. Jogue suas compras e toque em **Cotar preço do dia**. 🛒

> A chave fica **só no seu aparelho** (localStorage do navegador) e vai apenas para a API da Anthropic — nada é guardado em servidor nosso. Pegue a sua em <https://console.anthropic.com/settings/keys> e defina um **limite de gasto mensal** por segurança.

## 🧠 Modelo

Vem no **modelo mais inteligente** (**Opus 4.8**) por padrão, com busca web de última geração. No cartão do motor dá pra trocar por **Sonnet 5** ou **Haiku 4.5** se quiser gastar menos.

## 🔒 Opção segura: Cloudflare Worker (chave escondida)

Não quer a chave no navegador? Use o **Worker grátis** — a chave fica como *secret* no servidor:

1. <https://dash.cloudflare.com> → **Workers & Pages → Create → Worker** → cole `worker.js` → **Deploy**.
2. **Settings → Variables and Secrets → Add**: `ANTHROPIC_API_KEY` = sua chave `sk-ant-...` (Secret).
   - (Opcional) `MODEL` = `claude-sonnet-5` para trocar o modelo.
3. Copie a URL do Worker.
4. No app → **motor** → abra *"Prefiro usar um Worker"* → cole a URL → **Ativar via Worker**.

## 🚀 Publicar (GitHub Pages)

1. Suba na **raiz**: `index.html`, `worker.js`, `README.md` e um arquivo vazio **`.nojekyll`**.
2. **Settings → Pages → Branch `main` / root → Save**.
3. No ar em `https://SEU-USER.github.io/SEU-REPO/`.

O modo **Comparador** (grátis) e as ferramentas offline (catálogo, lista, import/export, radar, calculadora) funcionam sem configurar nada.

## 💸 Custo

Usa a API da Anthropic com busca web. Já vem com **cache (6h)** e **teto de buscas**:
- busca de 1 item: até **5** pesquisas web
- cotar lista: **1 chamada** com até **9** pesquisas (mais barato que item por item)

Com **Opus 4.8** (padrão), uma cotação de lista custa poucos centavos de dólar. Para gastar menos, troque para **Sonnet 5** ou **Haiku 4.5** no cartão do motor. Recomendo definir um **limite de gasto mensal** no painel da Anthropic.

> ⚠️ A cotação é uma **estimativa** baseada em busca na web — ótima pra orientar onde comprar, mas **confirme o preço no mercado (ou no app da loja com seu CEP)** antes de fechar a compra. Numa compra do mês, o que mais pesa no total costuma ser *onde* você compra, não a marca.

## 📁 Arquivos

| Arquivo | O que é |
|---|---|
| `index.html` | O app |
| `worker.js` | Motor no servidor (opcional, chave escondida) |
| `README.md` | Este guia |

Feito pra economizar de verdade. 🟢
