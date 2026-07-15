# 🏷️ MULTIPLICADOR — preço real do dia

Jogue sua **lista de compras** e o Multiplicador faz a **cotação do preço do dia** pra você: o melhor preço de cada item e **qual mercado sai mais barato no total, em R$**. App estático, pronto pro GitHub Pages.

## ✨ O que ele faz

- 🧾 **Jogue a lista** — digite, adicione pelo catálogo (+200 itens) ou **importe um arquivo** (.txt/.csv)
- ✨🎤 **Monte a lista falando ou escrevendo do seu jeito** — escreva (ou **dite pelo microfone**) "arroz, 2 leites e uma dúzia de ovos" e a IA transforma em itens com a quantidade certa. Digite um **prato** ("o que preciso p/ um strogonoff") e ela devolve os **ingredientes** já na lista. Sem chave, um modo simples separa por vírgula
- 🏪 **Lista por corredor** — um toque organiza a lista **na ordem dos corredores do mercado** (hortifruti → açougue → laticínios → … → limpeza), pra você comprar mais rápido sem ficar dando voltas
- 🏪 **Meus mercados** — já vem preenchido com *Assaí, Carrefour, Costa, Moreirinha, Pão de Açúcar* (edite à vontade) e ele cota **exatamente nessas redes**
- ⭐ **Minhas marcas favoritas** — informe as marcas que você gosta (ex.: Tio João, Pilão, OMO) e ele **prioriza essas marcas** quando o preço é competitivo; se a favorita estiver muito mais cara, mostra a alternativa e avisa
- 🔒 **Cofre** — toda cotação é **guardada automaticamente** (data, lista, marcas, preços e fontes); na próxima cotação cada item mostra **↓/↑ quanto mudou** e um selo **🟢 menor preço / 💚 preço bom** quando está bom vs. o histórico. Backup completo e restauração em 1 toque
- 💚 **Quanto você economizou** — o Cofre mostra um painel com a **economia potencial** que o app já garimpou (mercado campeão vs. o mais caro, somada nas suas cotações), com contadores de cotações, cupons e notas
- 🔁 **Recomprar em 1 toque** — com a lista vazia, um cartão traz a **última lista/compra** de volta na hora — perfeito pra compra do mês
- 🔗 **Compartilhar com a família** — mande sua **lista** por link (WhatsApp) e a pessoa abre, edita e cota; ou compartilhe a **cotação** (resumo com o mercado campeão e os preços). A lista viaja no próprio link — nada fica em servidor
- 🧾📷 **Nota fiscal (NFC-e)** — **leitor de QR code** que abre a nota na SEFAZ (o preço real que você pagou) e a **guarda no Cofre**; ou **insira a chave de acesso** (44 dígitos) à mão. Detecta o estado pela chave
- 📷🤖 **Foto do produto → IA identifica** — não achou o item? Tire uma foto da **embalagem** e a IA reconhece o produto (nome, marca, tamanho) e **já joga na sua lista** — pronto pra cotar. É a alternativa esperta ao leitor de código de barras (que o Safari do iPhone não faz bem)
- 📸🤖 **Foto do cupom → IA lê os itens** — tire uma foto do cupom e o motor (Opus 4.8, com visão) extrai **loja, itens e preços reais pagos**. Os itens (com as **quantidades reais**) entram na sua **Minha Lista** pra recomprar/cotar, e a compra fica guardada como **compra real** no Cofre. Esses preços viram base para o **↓/↑** das próximas cotações
- 🧾 **Auditoria de veracidade** — o motor é instruído a **nunca inventar preço** e a citar a fonte de cada item; a cotação mostra "X de Y itens com fonte verificável"
- 📊📄 **Exportar** — cada cotação vira **planilha (Google Sheets)** e **PDF** com o relatório completo e a linha de auditoria
- 📲 **Instala no iPhone** — abra no Safari → Compartilhar → *Adicionar à Tela de Início*; vira um app com ícone próprio (passo a passo no `MANUAL.md`)
- 💰 **Cotar preço do dia** — com o motor ligado, ele pesquisa na web com **olhar de comprador/dono de mercado** (menor custo real, sem visar lucro), **caça o encarte/ofertas da semana** de cada mercado (anotando a validade) e entrega: melhor preço por item **com preço por kg/L/un**, o **mercado campeão** (total num lugar só), a **cesta ótima** (cada item no mais barato + se vale rachar a compra) e **dicas de comprador** (caixa fechada, atacarejo, promoção)
- 🛒 **Comparar grátis (sem gastar nada)** — um toque na sua lista e cada item ganha atalhos pro **preço real** no app de cada mercado (**Rappi, iFood, Carrefour** com seu CEP) e no Google Shopping/encarte. **Sem IA e sem custo** — o preço de verdade mora nos apps das lojas, e o MULTIPLICADOR te leva direto lá
- ✍️ **Anotar preços e comparar (sem IA, zero token)** — viu o preço no app do mercado? Digite na sua lista (só o que quiser) e o app **calcula sozinho** qual mercado sai mais barato no total e a **cesta ótima** (cada item no mais barato), com a economia em R$. Fica **salvo no aparelho** — 100% offline, sem gastar nada
- 🔥 **Ofertas da semana** — um toque e o motor **entra no encarte de cada mercado** (Assaí, Carrefour, Atacadão, Costa, Moreirinha…) e traz as **ofertas com data de validade**, mercado por mercado. Sem chave/conexão, os botões abrem o **encarte oficial** de cada rede no navegador. Depois, ao **cotar sua lista**, os itens que estão em oferta ganham um selo **🔥** com a loja e a validade
- 🐞 **Debug quando a cotação falha** — se não vier preço, aparece um quadro **detalhes técnicos** (motor, modelo, status, quantas buscas web rodaram, erro e resposta crua) com botão **copiar** — é só colar pra diagnosticar
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
- busca de 1 item: até **6** pesquisas web
- cotar lista: **1 chamada** com até **12** pesquisas (inclui caçar **encartes/ofertas da semana**; ainda mais barato que item por item)

Com **Opus 4.8** (padrão), uma cotação de lista custa poucos centavos de dólar. Para gastar menos, troque para **Sonnet 5** ou **Haiku 4.5** no cartão do motor. Recomendo definir um **limite de gasto mensal** no painel da Anthropic.

> ⚠️ A cotação é uma **estimativa** baseada em busca na web — ótima pra orientar onde comprar, mas **confirme o preço no mercado (ou no app da loja com seu CEP)** antes de fechar a compra. Numa compra do mês, o que mais pesa no total costuma ser *onde* você compra, não a marca.

## 📁 Arquivos

| Arquivo | O que é |
|---|---|
| `index.html` | O app |
| `worker.js` | Motor no servidor (opcional, chave escondida) |
| `README.md` | Este guia |

Feito pra economizar de verdade. 🟢
