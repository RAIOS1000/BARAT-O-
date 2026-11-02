# ⚖️ Aprovadão — Analista Judiciário TJ-GO

Página de vendas do preparatório para **Analista Judiciário do TJ-GO (Apoio Judiciário e Administrativo)**, banca **UFG / Instituto Verbena**, com checkout na **Kiwify**.

Site estático (um único `index.html`), publicado de graça pelo **GitHub Pages** a partir da branch `main`.

## ✏️ O que preencher

Tudo fica no **final do `index.html`**, no bloco `CONFIGURAÇÃO`:

| Campo | Exemplo | Se ficar vazio |
|---|---|---|
| `LINK_KIWIFY` | `"https://pay.kiwify.com.br/XXXXXXX"` | Os botões levam até a seção de oferta |
| `PRECO.valor` | `"R$ 197,00"` | O preço não aparece |
| `PRECO.parcelas` | `"12"` | Não mostra o parcelamento |
| `ACESSO` | `"12 meses"` ou `"vitalício"` | A pergunta "Por quanto tempo tenho acesso?" não aparece |
| `CONTATO_EMAIL` | `"suporte@seudominio.com.br"` | A pergunta "Tem suporte?" e o contato no rodapé não aparecem |

Nada fica com cara de inacabado: o que não foi preenchido simplesmente não aparece.

## 🚀 Publicar

Qualquer mudança que entra na branch `main` é publicada automaticamente pelo GitHub Pages em cerca de 1 minuto (Settings → Pages: branch `main`, pasta `/ (root)`).

## 🌐 Domínio próprio (opcional)

Compre o domínio num registrador (Registro.br, Hostinger, Cloudflare…) e conecte em **Settings → Pages → Custom domain**, configurando o DNS no registrador.

## ⚠️ Avisos

- Material independente de estudo, sem vínculo com o TJ-GO, a UFG ou o Instituto Verbena.
- Os números da página (pesos das disciplinas, quantidade de aulas e questões) devem bater com o edital e com o produto entregue.
