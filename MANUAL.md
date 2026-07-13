# 📘 Manual do BARATÃO — preço real do dia

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

Pronto: vai aparecer o ícone 🏷️ **BARATÃO** na sua tela, abrindo em tela cheia como um app.

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

1. Na aba **Lista**: adicione itens **à mão**, pelo **Catálogo** (+200 itens) ou **Importe** um arquivo (.txt/.csv).
2. (Opcional) Ajuste **os mercados** que quer cotar e suas **⭐ marcas favoritas**.
3. Toque em **COTAR PREÇO DO DIA**.

Você recebe:
- 🏆 **Mercado campeão** — onde a lista toda sai mais barato, com o total e a economia.
- 🧺 **Cesta ótima** — comprando cada item no mais barato, e se **vale a pena rachar a compra** entre lojas.
- 🧾 **Cada item** com **marca**, **preço** e **preço por kg/L**.
- 💡 **Olhar de comprador** — dicas de atacarejo, caixa fechada e promoção.
- 🗓️ **Valor do dia** com a data no topo.

Quer só ver como fica? Toque em **👀 ver um exemplo de cotação (demo)** — funciona sem chave.

---

## 5) As outras abas

- **Buscar** — melhor preço de **um** produto (com marca e preço por unidade).
- **Catálogo** — toque pra jogar itens na lista.
- **Radar** — salve um **preço-alvo**; acende 🎯 quando a busca achar mais barato.
- **Calc** — compara duas embalagens por **preço por unidade** (o pacote maior nem sempre compensa).

---

## 6) Dúvidas rápidas

**"O motor não respondeu / erro."** Toque em **Testar** no cartão do motor. As mensagens são claras: *sem crédito*, *chave inválida*, *limite de uso* ou *conexão*.

**"Não quero a chave no navegador."** Use a opção **Worker** (abra "Prefiro usar um Worker" no cartão do motor). A chave fica escondida num servidorzinho grátis da Cloudflare — passo a passo no `README.md`.

**"É preço garantido?"** Não. A cotação é **estimativa de busca na web** — ótima pra decidir **onde** comprar. Confirme o valor no mercado (ou no app da loja com seu CEP) antes de fechar. Regra de dono: **compare sempre o preço por kg/L**.

---

Feito pra economizar de verdade. 🟢
