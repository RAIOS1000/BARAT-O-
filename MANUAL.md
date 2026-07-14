# 📘 Manual do MULTIPLICADOR — preço real do dia

App que recebe sua **lista de compras** e devolve a **cotação do preço do dia**: qual mercado sai mais barato no total (em R$), com **marca, preço e preço por kg/L** de cada item.

---

## 1) Colocar no ar (uma vez só)

O app é um site estático. Publique no **GitHub Pages**:

1. No repositório: **Settings → Pages**.
2. Em **Branch**, escolha **`main`** e a pasta **`/ (root)`** → **Save**.
3. Aguarde ~1 minuto. Ele fica no ar em:
   `https://SEU-USUARIO.github.io/BARAT-O-/`

> Precisa estar em **HTTPS** (o GitHub Pages já é) para o ícone e a instalação no iPhone funcionarem.

---

## 2) Instalar no iPhone (ícone na tela de início)

1. Abra o link do app no **Safari** (tem que ser o Safari).
2. Toque no botão **Compartilhar** (o quadradinho com a seta pra cima), embaixo.
3. Escolha **"Adicionar à Tela de Início"**.
4. Confirme em **Adicionar**.

Pronto: vai aparecer o ícone 🏷️ **MULTIPLICADOR** na sua tela, abrindo em tela cheia como um app.

*(No Android é igual: Chrome → menu ⋮ → "Adicionar à tela inicial".)*

---

## 3) Ligar o "preço real do dia" (2 toques)

O app já abre na **Lista**, com o local em **Goiânia** e seus mercados preenchidos.

1. Toque no botão **motor** (canto de cima) → **⚡ Ligar o preço real do dia**.
2. Cole sua chave da Anthropic **`sk-ant-…`** → **Ativar**.
3. Toque em **✔️ Testar se está funcionando** — se aparecer **✅ Funcionando**, está tudo certo.

### Onde pego a chave?
- Entre em **console.anthropic.com** → **Settings → API keys** → **Create key**.
- Adicione crédito em **Settings → Billing** (custa **centavos** por cotação).
- Defina um **limite de gasto mensal** por segurança.

> 🔒 A chave fica **só no seu aparelho** (no navegador). Não é enviada para nenhum servidor nosso — vai apenas para a API da Anthropic.

---

## 4) Usar no dia a dia

> 🔁 **Recomprar em 1 toque:** quando a lista está vazia, aparece um cartão **"Recomprar sua última lista"** — um toque traz de volta a última lista (ou a última compra lida do cupom). Ideal pra compra do mês.

1. Na aba **Lista**, monte sua lista do jeito mais fácil:
   - **✨ Fale ou escreva do seu jeito:** no campo de cima, escreva (ou toque em **🎤 Falar**) algo como *"arroz, 2 leites e uma dúzia de ovos"* e toque em **✨ Montar lista** — a IA vira itens com a quantidade certa (entende "uma dúzia" = 12, "meia dúzia" = 6, "2 caixas de leite" = 2).
   - **🍳 De um prato pra lista:** escreva um prato — *"o que preciso p/ um strogonoff"*, *"bolo de cenoura"* — e ela adiciona os **ingredientes** (porção p/ ~4 pessoas). *(Falar receita/quantidade por extenso precisa do motor ligado; sem motor, escreva os itens separados por vírgula.)*
   - Também dá pra adicionar **à mão**, pelo **Catálogo** (+200 itens) ou **Importar** um arquivo (.txt/.csv).
2. **🏪 Ver por corredor:** com 2+ itens, toque em **Por corredor** e a lista se organiza na **ordem do mercado** (hortifruti → açougue → laticínios → mercearia → limpeza…), pra comprar sem dar voltas. O **Lista simples** volta à ordem normal.
3. (Opcional) Ajuste **os mercados** que quer cotar e suas **⭐ marcas favoritas**.
4. Toque em **COTAR PREÇO DO DIA**.

Você recebe:
- 🏆 **Mercado campeão** — onde a lista toda sai mais barato, com o total e a economia.
- 🧺 **Cesta ótima** — comprando cada item no mais barato, e se **vale a pena rachar a compra** entre lojas.
- 🧾 **Cada item** com **marca**, **preço** e **preço por kg/L**.
- 💡 **Olhar de comprador** — dicas de atacarejo, caixa fechada e promoção.
- 🗓️ **Valor do dia** com a data no topo.

Quer só ver como fica? Toque em **👀 ver um exemplo de cotação (demo)** — funciona sem chave.

---

## 5) Cofre, auditoria e exportações

- 💚 **Quanto você economizou:** no topo do Cofre, um painel soma a **economia potencial** que o app já achou pra você — a diferença entre o **mercado campeão** e o mais caro, em todas as suas cotações — com contadores de cotações, cupons e notas. É *potencial*: vira real quando você compra no campeão (confirme os preços no mercado).
- 🔒 **Cofre (aba nova):** toda cotação é guardada **automaticamente** no aparelho — data, lista, marcas, preços e fontes. Na aba Cofre você pode **rever**, **usar a lista de novo**, exportar ou apagar. E quando você cota de novo, cada item mostra **↓/↑ quanto mudou** desde a última vez e um selo **🟢 menor preço / 💚 preço bom** quando o valor está bom comparado ao seu histórico.
- 💾 **Backup:** em Cofre → **Backup completo** baixa um arquivo com tudo (lista, mercados, marcas, radar e histórico). Guarde no iCloud/Arquivos — é a garantia total. **Restaurar** traz tudo de volta, inclusive em outro aparelho.
- 🧾 **Auditoria:** cada cotação registra data/hora, motor usado e a fonte de cada preço ("X de Y itens com fonte verificável"). O motor é instruído a **nunca inventar preço** — o que não foi encontrado vem marcado como estimativa em Obs.
- 📊 **Google Sheets:** toque em **Google Sheets** — baixa a planilha (.csv); abra com o app do Sheets ou mande pro Drive.
- 📄 **PDF:** toque em **Salvar PDF** — abre a tela de impressão; no iPhone, toque em **Compartilhar → Salvar em Arquivos**.
- 🔗 **Compartilhar a lista com a família:** na aba **Lista**, toque em **Compartilhar** — o app monta um **link** com sua lista dentro dele e abre o menu de compartilhar (WhatsApp, etc.). Quem receber e abrir o link vê a lista e escolhe **Juntar** com a dela ou **Substituir**. É uma **cópia** (não sincroniza ao vivo), e a lista viaja no próprio link — nada fica guardado em servidor.
- 📲 **Compartilhar a cotação:** na tela do resultado, toque em **📲 Compartilhar** pra mandar um resumo (mercado campeão, cesta ótima e os preços) no WhatsApp ou onde quiser.
- 🧾📷 **Nota fiscal (NFC-e):** toque em **📷 Ler nota fiscal** (na aba Cofre ou na Lista).
  - **Escanear QR Code:** aponte a câmera para o QR no rodapé do cupom → o app abre a nota oficial na **SEFAZ** (o preço real que você pagou) e a **guarda no Cofre**.
  - **Inserir chave:** se o QR estiver ruim, digite a **chave de acesso (44 dígitos)** que fica embaixo do código de barras → ele detecta o estado, guarda a nota e abre o portal (copia a chave pra você colar).
  - A câmera só funciona com o app publicado em **https** (GitHub Pages) e depois de **permitir o acesso à câmera** no Safari. Alternativa: o app **Câmera do iPhone** também lê o QR da NFC-e e abre a nota direto.
  - **📸 Ler foto do cupom (IA):** tire uma foto do cupom e o motor (IA com visão) **lê a loja, os itens e os preços reais que você pagou**. Os itens (com as **quantidades reais**) vão direto pra sua **Minha Lista** — pronta pra recomprar ou **Cotar preço do dia** de novo — e a compra fica guardada como **compra real** no Cofre. Precisa do **motor ligado** (chave). Esses preços viram a base do **↓/↑** nas próximas cotações. A leitura por imagem pode ter pequenos erros — **confira com o cupom**.

---

## 6) As outras abas

- **Buscar** — melhor preço de **um** produto (com marca e preço por unidade).
- **Catálogo** — toque pra jogar itens na lista.
- **Radar** — salve um **preço-alvo**; acende 🎯 quando a busca achar mais barato.
- **Calc** — compara duas embalagens por **preço por unidade** (o pacote maior nem sempre compensa).

---

## 7) Dúvidas rápidas

**"O motor não respondeu / erro."** Toque em **Testar** no cartão do motor. As mensagens são claras: *sem crédito*, *chave inválida*, *limite de uso* ou *conexão*.

**"Não quero a chave no navegador."** Use a opção **Worker** (abra "Prefiro usar um Worker" no cartão do motor). A chave fica escondida num servidorzinho grátis da Cloudflare — passo a passo no `README.md`.

**"O 🎤 Falar não abre a gravação no iPhone."** Alguns iPhones não liberam o microfone direto pra páginas web. Sem problema: toque no campo de texto e use o **🎤 do teclado do iPhone** (ao lado da barra de espaço) para ditar — funciona igual. Depois é só tocar em **✨ Montar lista**.

**"É preço garantido?"** Não. A cotação é **estimativa de busca na web** — ótima pra decidir **onde** comprar. Confirme o valor no mercado (ou no app da loja com seu CEP) antes de fechar. Regra de dono: **compare sempre o preço por kg/L**.

---

Feito pra economizar de verdade. 🟢
