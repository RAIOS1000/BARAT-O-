/**
 * BARATÃO — Motor de Preço Real (Cloudflare Worker) v3
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
        if (Array.isArray(b.lista) && b.lista.length) return await modoLista(b, env, cors);
        return await modoBusca(b.produto, b.local, env, cors);
      } else {
        const u = new URL(request.url);
        return await modoBusca(u.searchParams.get("produto"), u.searchParams.get("local"), env, cors);
      }
    } catch (e) {
      return json({ ok: false, erro: String(e) }, 502, cors);
    }
  },
};

async function modoBusca(produto, local, env, cors) {
  if (!produto) return json({ ok: false, erro: "faltou 'produto'" }, 400, cors);
  const prompt =
`Você é um caçador de ofertas no Brasil. Hoje é ${hojeBR()}. Pesquise na web os MENORES preços ATUAIS de "${produto}"${local ? ` para quem está em ${local}` : ""}.
Priorize supermercados e lojas que atendam essa região; considere também marketplaces confiáveis. Traga de 3 a 6 opções, da mais barata para a mais cara, com link direto quando houver. Se um preço for estimativa ou de outra região, diga em "obs".
Responda APENAS com JSON válido, sem markdown, sem texto antes ou depois:
{"produto":"${produto}","local":"${local || ""}","resultados":[{"loja":"","preco":0.00,"unidade":"","local":"cidade/UF ou online","link":"","fonte":"","obs":""}],"resumo":""}
Use ponto decimal. Sem link confiável, use "link":"".`;
  const data = await callClaude(prompt, MAX_BUSCAS_ITEM, 2200, env);
  const parsed = extractJson(data.text);
  if (!parsed) return json({ ok: false, erro: "resposta sem JSON", cru: (data.text || "").slice(0, 400) }, 502, cors);
  return json({ ok: true, ...parsed }, 200, cors);
}

async function modoLista(b, env, cors) {
  const itens = b.lista.map(x => (typeof x === "string" ? x : `${x.qtd > 1 ? x.qtd + "x " : ""}${x.nome}`)).slice(0, 40);
  const local = b.local || "";
  const mercados = (b.mercados || "").toString().trim();
  const alvo = mercados
    ? `Cote a lista NESTES mercados (um total para cada um): ${mercados}.`
    : `Escolha grandes redes que atendam ${local || "a região"} (ex.: Assaí, Atacadão, Carrefour, Pão de Açúcar e redes regionais).`;
  const prompt =
`Você é um assistente de compras no Brasil. Hoje é ${hojeBR()}. Para quem está em ${local || "Brasil"}, pesquise na web os preços ATUAIS dos itens da lista de compras abaixo. ${alvo}
LISTA:
${itens.map((n, i) => `${i + 1}. ${n}`).join("\n")}

Para cada item, informe o melhor preço encontrado e em qual loja. Depois some o total por mercado e diga qual mercado sai mais barato no geral e quanto se economiza escolhendo ele. Seja honesto: se um preço for estimativa ou indisponível, marque em "obs".
Responda APENAS com JSON válido, sem markdown, sem texto antes ou depois:
{"local":"${local}","itens":[{"nome":"","melhor_preco":0.00,"melhor_loja":"","link":"","obs":""}],"por_mercado":[{"loja":"","total_estimado":0.00,"itens_encontrados":0}],"melhor_mercado":"","economia_estimada":0.00,"resumo":""}
Use ponto decimal.`;
  const data = await callClaude(prompt, MAX_BUSCAS_LISTA, 4200, env);
  const parsed = extractJson(data.text);
  if (!parsed) return json({ ok: false, erro: "resposta sem JSON", cru: (data.text || "").slice(0, 400) }, 502, cors);
  return json({ ok: true, modo: "lista", ...parsed }, 200, cors);
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
