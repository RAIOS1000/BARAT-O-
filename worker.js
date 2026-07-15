/**
 * MULTIPLICADOR — Motor de Preço Real (Cloudflare Worker) v4
 * ------------------------------------------------------------
 * Modos:
 *   • BUSCA  (GET  ?produto=&local=)                -> melhores preços de 1 produto
 *   • LISTA  (POST {lista:[...], local, mercados})  -> compara a lista toda de uma vez
 *   • FOTO   (POST {foto, media})                   -> lê o cupom fiscal por imagem (IA)
 *   • MONTAR (POST {montar:"texto/prato"})          -> monta a lista por fala/texto ou receita
 *   • PRODUTO(POST {foto_produto, media})           -> identifica o produto pela foto da embalagem
 *   • OFERTAS(POST {ofertas:true, mercados, local}) -> encarte/ofertas da semana por mercado, com validade
 *
 * A chave fica como SECRET do Worker (nunca no site).
 * DEPLOY: veja o README. Secret: ANTHROPIC_API_KEY = sk-ant-...
 * Opcional: variável MODEL para trocar o modelo (padrão: o mais inteligente).
 *
 * v4: resposta em STREAMING. O Worker manda os cabeçalhos na hora e vai
 * "pingando" espaços enquanto a IA pesquisa, para NUNCA estourar o limite de
 * ~100s da Cloudflare (o erro "code: 524"). O corpo final continua sendo um
 * JSON válido (espaços em volta do JSON são ignorados na leitura).
 */

const MAX_BUSCAS_ITEM = 6;    // teto de pesquisas web p/ 1 produto
const MAX_BUSCAS_LISTA = 20;  // teto de pesquisas web p/ a lista toda (streaming removeu o limite de tempo)

function getModel(env) { return (env && env.MODEL) || "claude-opus-4-8"; }
// dynamic filtering (mais preciso/econômico) nos modelos recentes; básico p/ os antigos
function webSearchName(model) {
  return /haiku|opus-4-1|opus-4-0|sonnet-4-5|sonnet-4-0/i.test(model || "")
    ? "web_search_20250305"
    : "web_search_20260209";
}
function hojeBR() {
  try { return new Date().toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" }); }
  catch (e) { try { return new Date().toISOString().slice(0, 10); } catch (_) { return ""; } }
}

export default {
  async fetch(request, env, ctx) {
    const cors = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };
    if (request.method === "OPTIONS") return new Response(null, { headers: cors });
    if (!env.ANTHROPIC_API_KEY) return json({ ok: false, erro: "configure o secret ANTHROPIC_API_KEY no Worker" }, 500, cors);

    // Lê o pedido (rápido) e decide o modo; a parte lenta (IA) roda dentro do stream.
    let work;
    if (request.method === "POST") {
      const b = await request.json().catch(() => ({}));
      work = () => dispatchPost(b, env);
    } else {
      const u = new URL(request.url);
      const produto = u.searchParams.get("produto");
      const local = u.searchParams.get("local");
      const marcas = u.searchParams.get("marcas");
      work = () => modoBusca(produto, local, marcas, env);
    }
    return streamJson(work, cors, ctx);
  },
};

function dispatchPost(b, env) {
  if (b.ofertas) return modoOfertas(b, env);
  if (b.montar) return modoMontar(b.montar, env);
  if (b.foto_produto) return modoFotoProduto(b, env);
  if (b.foto) return modoFoto(b, env);
  if (Array.isArray(b.lista) && b.lista.length) return modoLista(b, env);
  return modoBusca(b.produto, b.local, b.marcas, env);
}

/**
 * Abre a resposta IMEDIATAMENTE (cabeçalhos já vão embora -> derruba o 524),
 * manda um espaço a cada 15s pra segurar a conexão, e escreve o JSON quando a
 * IA terminar. Como espaços antes/depois do JSON são ignorados na leitura
 * (r.json() no app), o corpo continua um JSON válido.
 */
function streamJson(work, cors, ctx) {
  const { readable, writable } = new TransformStream();
  const writer = writable.getWriter();
  const enc = new TextEncoder();
  let done = false;
  const pump = (async () => {
    try {
      await writer.write(enc.encode(" ")); // 1º byte -> cabeçalhos saem na hora
      const beat = () => {
        if (done) return;
        writer.write(enc.encode(" ")).catch(() => {});
        setTimeout(beat, 15000);
      };
      setTimeout(beat, 15000);
      let obj;
      try { obj = await work(); }
      catch (e) { obj = { ok: false, erro: String((e && e.message) || e) }; }
      done = true;
      await writer.write(enc.encode(JSON.stringify(obj)));
    } catch (_) {
      /* conexão caiu: nada a fazer */
    } finally {
      done = true;
      try { await writer.close(); } catch (_) {}
    }
  })();
  if (ctx && ctx.waitUntil) ctx.waitUntil(pump);
  return new Response(readable, { status: 200, headers: { ...cors, "Content-Type": "application/json; charset=utf-8" } });
}

async function modoBusca(produto, local, marcas, env) {
  if (!produto) return { ok: false, erro: "faltou 'produto'" };
  const fav = (marcas || "").toString().trim()
    ? `\nMarcas favoritas do comprador: ${marcas}. Priorize essas marcas quando o preço for competitivo; se a favorita estiver bem mais cara, mostre também a alternativa mais barata e explique em "obs".`
    : "";
  const prompt =
`Você é um comprador esperto no Brasil, com mentalidade de dono de supermercado: quer o MENOR CUSTO REAL, sem visar lucro. Hoje é ${hojeBR()}. Pesquise na web os MENORES preços ATUAIS de "${produto}"${local ? ` para quem está em ${local}` : ""}.${fav}
BUSQUE O PREÇO REAL DA SEMANA: procure ATIVAMENTE o "encarte"/"ofertas da semana"/"folheto"/"tabloide" atual dos mercados da região, nos sites oficiais das redes e em agregadores de encartes. Prefira o preço do encarte VIGENTE desta semana e anote em "obs" a validade quando houver (ex.: "encarte válido até 16/07"); se o preço veio de encarte/promoção, diga na "fonte".
Priorize supermercados/atacarejos que atendam essa região; considere marketplaces confiáveis. Informe a MARCA de cada opção, compare o PREÇO POR UNIDADE (kg/L/un) e prefira a embalagem que sai mais barata por unidade. Traga de 3 a 6 opções, da mais barata para a mais cara, com link direto quando houver. Preço estimado ou de outra região vai em "obs". NUNCA invente preço: só registre valores realmente encontrados, preenchendo "fonte" com o site.
Responda APENAS com JSON válido, sem markdown, sem texto antes ou depois:
{"produto":"${produto}","local":"${local || ""}","data":"${hojeBR()}","resultados":[{"loja":"","marca":"","preco":0.00,"unidade":"","preco_unidade":"","local":"cidade/UF ou online","link":"","fonte":"","obs":""}],"resumo":""}
Use ponto decimal. "marca" quando houver; "preco_unidade" pode ser texto (ex.: "R$ 5,40/kg"). Sem link confiável, use "link":"".`;
  const data = await callClaude(prompt, MAX_BUSCAS_ITEM, 3000, env);
  const parsed = extractJson(data.text);
  if (!parsed) return { ok: false, erro: "resposta sem JSON", cru: (data.text || "").slice(0, 400) };
  return { ok: true, ...parsed };
}

async function modoLista(b, env) {
  const itens = b.lista.map(x => (typeof x === "string" ? x : `${x.qtd > 1 ? x.qtd + "x " : ""}${x.nome}`)).slice(0, 40);
  const local = b.local || "";
  const mercados = (b.mercados || "").toString().trim();
  const marcas = (b.marcas || "").toString().trim();
  const alvo = mercados
    ? `Cote a lista NESTES mercados (um total para cada um): ${mercados}.`
    : `Escolha grandes redes/atacarejos que atendam ${local || "a região"} (ex.: Assaí, Atacadão, Carrefour, Pão de Açúcar e redes regionais).`;
  const fav = marcas
    ? ` O comprador tem MARCAS FAVORITAS: ${marcas}. Priorize essas marcas quando o preço for competitivo; se a favorita estiver bem mais cara, cote a alternativa mais barata e avise em "obs".`
    : "";
  const prompt =
`Você é um COMPRADOR PROFISSIONAL / dono de supermercado fazendo a compra do mês para você mesmo — sem visar lucro, só o MENOR CUSTO REAL. Hoje é ${hojeBR()}. Para quem está em ${local || "Brasil"}, pesquise na web os preços ATUAIS dos itens abaixo. ${alvo}${fav}
Pense como um comprador experiente:
- Compare sempre o PREÇO POR UNIDADE (por kg, litro ou unidade), não só o preço da embalagem.
- Prefira atacarejo e, quando o preço por unidade compensar, embalagem maior / caixa fechada / fardo / saco.
- ESTRATÉGIA (importante p/ lista grande): NÃO pesquise item por item — o orçamento de busca acaba. PRIMEIRO encontre o ENCARTE VIGENTE desta semana de CADA mercado e leia dele o MÁXIMO de itens da lista de uma vez só. Procure o encarte de cada rede nesta ordem: (1) site oficial da rede; (2) o INSTAGRAM e o FACEBOOK da loja — mercados regionais (ex.: Costa, Moreirinha) quase sempre postam o folheto da semana nas redes sociais, não no site; (3) sites agregadores de encarte (buscas como "encarte <loja> ${local || "cidade"}", "ofertas da semana <loja>", "folheto <loja>"). Só DEPOIS, se sobrar busca, procure os itens que faltaram.
- VIGÊNCIA: hoje é ${hojeBR()}. Use SOMENTE encarte cuja validade cubra HOJE. Folheto de semanas/meses atrás (ex.: de 2025) NÃO vale — descarte e trate o item como "não encontrado" em vez de usar preço velho. Anote em "obs" a validade do encarte usado (ex.: "encarte válido até 16/07").
- Seja honesto: preço estimado, indisponível ou de outra região vai em "obs".
- VERACIDADE: nunca invente preço. Só registre valores realmente encontrados na busca, informando a fonte (site); se não achar, use 0 e explique em "obs".

LISTA:
${itens.map((n, i) => `${i + 1}. ${n}`).join("\n")}

Para cada item informe: a MARCA cotada (ex.: Tio João, Camil, Qualitá), o melhor preço, a loja, a embalagem, o preço por unidade e a fonte (site onde viu o preço). Depois entregue:
1) o total por mercado (comprando tudo em um só) e qual mercado sai mais barato no total;
2) a "cesta ótima": comprando cada item onde está mais barato, o total e quanto economiza vs o melhor mercado único;
3) dicas de comprador (itens que compensam em caixa fechada/atacado, ou em promoção agora).
Responda APENAS com JSON válido, sem markdown, sem texto antes ou depois:
{"local":"${local}","data":"${hojeBR()}","itens":[{"nome":"","marca":"","melhor_preco":0.00,"melhor_loja":"","embalagem":"","preco_unidade":"","fonte":"","link":"","obs":""}],"por_mercado":[{"loja":"","total_estimado":0.00,"itens_encontrados":0}],"melhor_mercado":"","economia_estimada":0.00,"cesta_otima":{"total":0.00,"economia":0.00,"itens":[{"nome":"","loja":"","preco":0.00}]},"dicas":[""],"resumo":""}
Use ponto decimal. "marca" é obrigatória quando houver; "preco_unidade" pode ser texto (ex.: "R$ 5,40/kg").`;
  const data = await callClaude(prompt, MAX_BUSCAS_LISTA, 8000, env);
  const parsed = extractJson(data.text);
  if (!parsed) return { ok: false, erro: "resposta sem JSON", cru: (data.text || "").slice(0, 400) };
  return { ok: true, modo: "lista", ...parsed };
}

async function modoOfertas(b, env) {
  const local = (b.local || "").toString();
  const mercados = (b.mercados || "").toString().trim();
  const marcas = (b.marcas || "").toString().trim();
  const lojas = mercados || "Assaí, Carrefour, Atacadão, Costa, Moreirinha";
  const fav = marcas ? ` O comprador tem marcas favoritas: ${marcas} — destaque quando aparecerem no encarte.` : "";
  const prompt =
`Você é um comprador esperto no Brasil. Hoje é ${hojeBR()}. Para quem está em ${local || "Brasil"}, PESQUISE na web as OFERTAS DA SEMANA (encarte / folheto / "ofertas da semana") ATUAIS de CADA um destes mercados, um por um: ${lojas}.
Para cada mercado, procure o encarte/folheto VIGENTE desta semana em (1) site oficial da rede, (2) INSTAGRAM e FACEBOOK da loja — mercados regionais (ex.: Costa, Moreirinha) quase sempre postam o folheto da semana nas redes sociais, não no site — e (3) agregadores de encarte. Leia os itens e traga as principais ofertas do dia a dia (mercearia, limpeza, hortifruti, açougue, bebidas) com a DATA DE VALIDADE do encarte.${fav}
VIGÊNCIA: use SOMENTE encarte cuja validade cubra HOJE (${hojeBR()}); descarte folhetos antigos (ex.: de 2025). Só ofertas REAIS que você realmente encontrou na busca; se não achar o encarte VIGENTE de um mercado, devolva "ofertas":[] e explique em "obs". NUNCA invente preço nem validade.
Responda APENAS com JSON válido, sem markdown, sem texto antes ou depois:
{"local":"${local}","data":"${hojeBR()}","mercados":[{"loja":"","validade":"","fonte":"","obs":"","ofertas":[{"produto":"","marca":"","preco":0.00,"preco_unidade":"","validade":"","fonte":""}]}]}
"validade" do mercado é o período do encarte (ex.: "válido de 14/07 a 20/07"). Use ponto decimal para o preço.`;
  const data = await callClaude(prompt, MAX_BUSCAS_LISTA, 8000, env);
  const parsed = extractJson(data.text);
  if (!parsed) return { ok: false, erro: "resposta sem JSON", cru: (data.text || "").slice(0, 400) };
  return { ok: true, modo: "ofertas", ...parsed };
}

async function modoMontar(texto, env) {
  const prompt =
`O usuário quer montar uma LISTA DE COMPRAS de supermercado. Ele escreveu (pode ser fala transcrita, informal, com erros de digitação):
"""${String(texto).slice(0, 1200)}"""

Sua tarefa:
- Se for uma LISTA de itens (mesmo bagunçada), transforme em itens de supermercado, um por item, com a quantidade certa. Entenda quantidades por extenso e medidas: "uma dúzia de ovos" = 12 ovos; "meia dúzia" = 6; "2 caixas de leite" = 2; "um fardo de cerveja" = 1.
- Se for o NOME DE UM PRATO ou um pedido de receita (ex.: "strogonoff", "o que preciso pra fazer uma feijoada", "bolo de cenoura", "lasanha"), liste os INGREDIENTES de supermercado para prepará-lo (porção para ~4 pessoas), com quantidades realistas.
- Use nomes GENÉRICOS e comuns de produto (ex.: "arroz", "peito de frango", "creme de leite"), SEM marca, para facilitar a cotação de preço depois.
- Não invente nada além do que faz sentido para a lista/prato. Isto é só a lista — NÃO cote preços.
Responda APENAS com JSON válido, sem markdown, sem texto antes ou depois:
{"tipo":"lista","prato":"","itens":[{"nome":"","qtd":1}]}
"tipo" é "lista" ou "receita". Em receita, preencha "prato". "qtd" é um inteiro (quantas unidades comprar); se não souber, use 1.`;
  const r = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-api-key": env.ANTHROPIC_API_KEY, "anthropic-version": "2023-06-01" },
    body: JSON.stringify({ model: getModel(env), max_tokens: 1500, messages: [{ role: "user", content: prompt }] }),
  });
  const data = await r.json();
  if (data.error) throw new Error(data.error.message || "erro na API");
  const text = (data.content || []).filter(x => x.type === "text").map(x => x.text).join("\n").trim();
  const parsed = extractJson(text);
  if (!parsed) return { ok: false, erro: "não consegui montar a lista", cru: text.slice(0, 400) };
  return { ok: true, modo: "montar", ...parsed };
}

async function modoFotoProduto(b, env) {
  const media = (b.media || "image/jpeg").toString();
  const prompt =
`Você recebeu a FOTO de um ou mais PRODUTOS de supermercado (a embalagem/rótulo). Identifique cada produto claramente visível. Devolva APENAS JSON válido, sem markdown, sem texto antes ou depois:
{"itens":[{"nome":"","marca":"","tamanho":"","qtd":1}]}
"nome" = nome genérico e comum do produto para uma lista de compras (ex.: "arroz", "leite integral", "sabão em pó", "café"), SEM a marca. "marca" = a marca do rótulo, se der pra ler. "tamanho" = peso/volume que aparecer (ex.: "5kg", "1L", "500g"). "qtd" = quantas unidades iguais aparecem, senão 1. Se não tiver certeza, deixe em branco — NUNCA invente. Se não for um produto de mercado, devolva {"itens":[]}.`;
  const r = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-api-key": env.ANTHROPIC_API_KEY, "anthropic-version": "2023-06-01" },
    body: JSON.stringify({
      model: getModel(env), max_tokens: 1200,
      messages: [{ role: "user", content: [
        { type: "image", source: { type: "base64", media_type: media, data: b.foto_produto } },
        { type: "text", text: prompt },
      ] }],
    }),
  });
  const data = await r.json();
  if (data.error) throw new Error(data.error.message || "erro na API");
  const text = (data.content || []).filter(x => x.type === "text").map(x => x.text).join("\n").trim();
  const parsed = extractJson(text);
  if (!parsed) return { ok: false, erro: "não consegui identificar o produto", cru: text.slice(0, 400) };
  return { ok: true, modo: "foto_produto", ...parsed };
}

async function modoFoto(b, env) {
  const media = (b.media || "image/jpeg").toString();
  const prompt =
`Você recebeu a FOTO de um cupom fiscal brasileiro (NFC-e/SAT). Hoje é ${hojeBR()}. Leia com atenção e extraia os dados REAIS impressos no cupom — NUNCA invente; o que não der pra ler com certeza vai em "obs".
Devolva APENAS JSON válido, sem markdown, sem texto antes ou depois:
{"loja":"","data":"","local":"","total":0.00,"itens":[{"nome":"","marca":"","qtd":1,"preco_unit":0.00,"preco_total":0.00,"obs":""}]}
Use ponto decimal. "preco_unit" é o preço unitário e "preco_total" é o valor daquele item no cupom.`;
  const r = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-api-key": env.ANTHROPIC_API_KEY, "anthropic-version": "2023-06-01" },
    body: JSON.stringify({
      model: getModel(env), max_tokens: 3000,
      messages: [{ role: "user", content: [
        { type: "image", source: { type: "base64", media_type: media, data: b.foto } },
        { type: "text", text: prompt },
      ] }],
    }),
  });
  const data = await r.json();
  if (data.error) throw new Error(data.error.message || "erro na API");
  const text = (data.content || []).filter(x => x.type === "text").map(x => x.text).join("\n").trim();
  const parsed = extractJson(text);
  if (!parsed) return { ok: false, erro: "não consegui ler o cupom", cru: text.slice(0, 400) };
  return { ok: true, modo: "foto", ...parsed };
}

async function callClaude(prompt, maxBuscas, maxTokens, env) {
  const model = getModel(env);
  const primary = webSearchName(model);
  try {
    return await callClaudeTool(model, primary, prompt, maxBuscas, maxTokens, env);
  } catch (e) {
    // se a ferramenta de busca avançada não rolar na conta, cai pra básica
    if (primary !== "web_search_20250305" && /web_search|tool.?type|unexpected.*tag|does not match|unsupported|max_uses|invalid.*tool/i.test(String(e && e.message))) {
      return await callClaudeTool(model, "web_search_20250305", prompt, maxBuscas, maxTokens, env);
    }
    throw e;
  }
}
async function callClaudeTool(model, toolType, prompt, maxBuscas, maxTokens, env) {
  let messages = [{ role: "user", content: prompt }];
  const tools = [{ type: toolType, name: "web_search", max_uses: maxBuscas }];
  let text = "", guard = 0;
  // STREAMING: pedimos a resposta em stream. Assim a Anthropic começa a responder
  // em ~1s e a subchamada do Worker recebe bytes continuamente — ela nunca fica
  // "parada esperando" >100s, que era o que gerava "error code: 524" aqui dentro.
  // servidores de busca podem pausar o turno (pause_turn) — retomamos reenviando.
  while (guard++ < 16) {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({ model, max_tokens: maxTokens, messages, tools, stream: true }),
    });
    if (!r.ok || !r.body) {
      const t = await r.text().catch(() => "");
      throw new Error("erro na API (HTTP " + r.status + ") " + t.slice(0, 200));
    }
    const acc = await lerStreamAnthropic(r.body);
    if (acc.error) throw new Error(acc.error);
    text = (acc.content || []).filter(x => x.type === "text").map(x => x.text).join("\n").trim();
    if (acc.stop_reason === "pause_turn" && acc.content && acc.content.length) {
      messages = [messages[0], { role: "assistant", content: acc.content }];
      continue;
    }
    break;
  }
  return { text };
}

// Lê o stream SSE da Anthropic e remonta os blocos de conteúdo + o stop_reason.
// Eventos vêm separados por linha em branco; cada um tem "event:" e "data:".
async function lerStreamAnthropic(body) {
  const reader = body.getReader();
  const dec = new TextDecoder();
  const blocks = [];   // blocos de conteúdo por índice
  const pj = {};       // índice -> input_json parcial (para blocos de tool_use)
  let stop_reason = null, error = null, buf = "";
  const trata = (ev, obj) => {
    if (ev === "content_block_start") {
      blocks[obj.index] = obj.content_block || {};
      if (blocks[obj.index].type === "text" && blocks[obj.index].text == null) blocks[obj.index].text = "";
    } else if (ev === "content_block_delta") {
      const b = blocks[obj.index]; if (!b) return;
      const d = obj.delta || {};
      if (d.type === "text_delta") b.text = (b.text || "") + (d.text || "");
      else if (d.type === "input_json_delta") pj[obj.index] = (pj[obj.index] || "") + (d.partial_json || "");
    } else if (ev === "content_block_stop") {
      const b = blocks[obj.index];
      if (b && pj[obj.index] != null) { try { b.input = JSON.parse(pj[obj.index] || "{}"); } catch (_) {} }
    } else if (ev === "message_delta") {
      if (obj.delta && obj.delta.stop_reason) stop_reason = obj.delta.stop_reason;
    } else if (ev === "error") {
      error = (obj.error && obj.error.message) || "erro no stream da API";
    }
  };
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buf += dec.decode(value, { stream: true });
    const parts = buf.split("\n\n");
    buf = parts.pop();
    for (const part of parts) {
      let ev = null, dataStr = "";
      for (let line of part.split("\n")) {
        line = line.replace(/\r$/, "");
        if (line.startsWith("event:")) ev = line.slice(6).trim();
        else if (line.startsWith("data:")) dataStr += line.slice(5).trim();
      }
      if (!dataStr || dataStr === "[DONE]") continue;
      let obj; try { obj = JSON.parse(dataStr); } catch (_) { continue; }
      trata(ev || obj.type, obj);
    }
  }
  return { content: blocks.filter(b => b != null), stop_reason, error };
}

function extractJson(text) {
  if (!text) return null;
  const t = text.replace(/```json/gi, "").replace(/```/g, "").trim();
  const a = t.indexOf("{"), b = t.lastIndexOf("}");
  if (a < 0 || b < 0) return null;
  try { return JSON.parse(t.slice(a, b + 1)); } catch { return null; }
}
function json(obj, status, headers) {
  return new Response(JSON.stringify(obj), { status, headers: { ...headers, "Content-Type": "application/json; charset=utf-8" } });
}
