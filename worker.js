/**
 * MULTIPLICADOR — Motor de Preço Real (Cloudflare Worker) v3
 * ------------------------------------------------------------
 * Dois modos:
 *   • BUSCA (GET  ?produto=&local=)            -> melhores preços de 1 produto
 *   • LISTA (POST {lista:[...], local, mercados}) -> compara a lista toda de uma vez
 *
 * A chave fica como SECRET do Worker (nunca no site).
 * DEPLOY: veja o README. Secret: ANTHROPIC_API_KEY = sk-ant-...
 * Opcional: variável MODEL para trocar o modelo (padrão: o mais inteligente).
 */

const MAX_BUSCAS_ITEM = 5;   // teto de pesquisas web p/ 1 produto
const MAX_BUSCAS_LISTA = 9;  // teto de pesquisas web p/ a lista toda

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
  async fetch(request, env) {
    const cors = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };
    if (request.method === "OPTIONS") return new Response(null, { headers: cors });
    if (!env.ANTHROPIC_API_KEY) return json({ ok: false, erro: "configure o secret ANTHROPIC_API_KEY no Worker" }, 500, cors);

    try {
      if (request.method === "POST") {
        const b = await request.json().catch(() => ({}));
        if (b.foto) return await modoFoto(b, env, cors);
        if (Array.isArray(b.lista) && b.lista.length) return await modoLista(b, env, cors);
        return await modoBusca(b.produto, b.local, b.marcas, env, cors);
      } else {
        const u = new URL(request.url);
        return await modoBusca(u.searchParams.get("produto"), u.searchParams.get("local"), u.searchParams.get("marcas"), env, cors);
      }
    } catch (e) {
      return json({ ok: false, erro: String(e) }, 502, cors);
    }
  },
};

async function modoBusca(produto, local, marcas, env, cors) {
  if (!produto) return json({ ok: false, erro: "faltou 'produto'" }, 400, cors);
  const fav = (marcas || "").toString().trim()
    ? `\nMarcas favoritas do comprador: ${marcas}. Priorize essas marcas quando o preço for competitivo; se a favorita estiver bem mais cara, mostre também a alternativa mais barata e explique em "obs".`
    : "";
  const prompt =
`Você é um comprador esperto no Brasil, com mentalidade de dono de supermercado: quer o MENOR CUSTO REAL, sem visar lucro. Hoje é ${hojeBR()}. Pesquise na web os MENORES preços ATUAIS de "${produto}"${local ? ` para quem está em ${local}` : ""}.${fav}
Priorize supermercados/atacarejos que atendam essa região; considere marketplaces confiáveis. Informe a MARCA de cada opção, compare o PREÇO POR UNIDADE (kg/L/un) e prefira a embalagem que sai mais barata por unidade. Traga de 3 a 6 opções, da mais barata para a mais cara, com link direto quando houver. Preço estimado ou de outra região vai em "obs". NUNCA invente preço: só registre valores realmente encontrados, preenchendo "fonte" com o site.
Responda APENAS com JSON válido, sem markdown, sem texto antes ou depois:
{"produto":"${produto}","local":"${local || ""}","data":"${hojeBR()}","resultados":[{"loja":"","marca":"","preco":0.00,"unidade":"","preco_unidade":"","local":"cidade/UF ou online","link":"","fonte":"","obs":""}],"resumo":""}
Use ponto decimal. "marca" quando houver; "preco_unidade" pode ser texto (ex.: "R$ 5,40/kg"). Sem link confiável, use "link":"".`;
  const data = await callClaude(prompt, MAX_BUSCAS_ITEM, 2200, env);
  const parsed = extractJson(data.text);
  if (!parsed) return json({ ok: false, erro: "resposta sem JSON", cru: (data.text || "").slice(0, 400) }, 502, cors);
  return json({ ok: true, ...parsed }, 200, cors);
}

async function modoLista(b, env, cors) {
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
- Aproveite promoções e o encarte da semana.
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
  const data = await callClaude(prompt, MAX_BUSCAS_LISTA, 4200, env);
  const parsed = extractJson(data.text);
  if (!parsed) return json({ ok: false, erro: "resposta sem JSON", cru: (data.text || "").slice(0, 400) }, 502, cors);
  return json({ ok: true, modo: "lista", ...parsed }, 200, cors);
}

async function modoFoto(b, env, cors) {
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
  if (!parsed) return json({ ok: false, erro: "não consegui ler o cupom", cru: text.slice(0, 400) }, 502, cors);
  return json({ ok: true, modo: "foto", ...parsed }, 200, cors);
}

async function callClaude(prompt, maxBuscas, maxTokens, env) {
  const model = getModel(env);
  let messages = [{ role: "user", content: prompt }];
  const tools = [{ type: webSearchName(model), name: "web_search", max_uses: maxBuscas }];
  let data, guard = 0;
  // servidores de busca podem pausar o turno (pause_turn) — retomamos reenviando
  while (guard++ < 4) {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({ model, max_tokens: maxTokens, messages, tools }),
    });
    data = await r.json();
    if (data.error) throw new Error(data.error.message || "erro na API");
    if (data.stop_reason === "pause_turn") {
      messages = [messages[0], { role: "assistant", content: data.content }];
      continue;
    }
    break;
  }
  const text = (data.content || []).filter(x => x.type === "text").map(x => x.text).join("\n").trim();
  return { text };
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
