/**
 * BARATÃO — Motor Inteligente (Cloudflare Worker) v2
 * ------------------------------------------------------------
 * Dois modos:
 *   • BUSCA (GET  ?produto=&local=)        -> melhores preços de 1 produto
 *   • LISTA (POST {lista:[...], local})    -> compara a lista toda de uma vez
 *
 * A chave fica como SECRET do Worker (nunca no site).
 * DEPLOY: veja o README. Secret: ANTHROPIC_API_KEY = sk-ant-...
 */

const MODEL = "claude-haiku-4-5-20251001"; // troque por "claude-sonnet-5" p/ mais precisao (mais caro)
const MAX_BUSCAS_ITEM = 4;                  // teto de pesquisas web p/ 1 produto
const MAX_BUSCAS_LISTA = 8;                 // teto de pesquisas web p/ a lista toda

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
`Voce e um cacador de ofertas no Brasil. Pesquise na web os MELHORES precos ATUAIS de "${produto}"${local ? ` para quem esta em ${local}` : ""}.
Considere lojas online, marketplaces e mercados regionais. Traga de 3 a 6 opcoes, da mais barata para a mais cara, com link direto quando houver.
Responda APENAS com JSON valido, sem markdown:
{"produto":"${produto}","local":"${local || ""}","resultados":[{"loja":"","preco":0.00,"unidade":"","local":"cidade/UF ou online","link":"","fonte":"","obs":""}],"resumo":""}
Use ponto decimal. Sem link confiavel -> "link":"".`;
  const data = await callClaude(prompt, MAX_BUSCAS_ITEM, 2000, env);
  const parsed = extractJson(data.text);
  if (!parsed) return json({ ok: false, erro: "resposta sem JSON", cru: (data.text||"").slice(0,400) }, 502, cors);
  return json({ ok: true, ...parsed }, 200, cors);
}

async function modoLista(b, env, cors) {
  const itens = b.lista.map(x => (typeof x === "string" ? x : `${x.qtd?x.qtd+"x ":""}${x.nome}`)).slice(0, 40);
  const local = b.local || "";
  const prompt =
`Voce e um assistente de compras no Brasil. Para quem esta em ${local || "Brasil"}, pesquise na web precos ATUAIS dos itens da lista de compras abaixo em grandes redes de supermercado (ex.: Carrefour, Assai, Atacadao, Pao de Acucar, redes regionais) e marketplaces quando fizer sentido.
LISTA:
${itens.map((n,i)=>`${i+1}. ${n}`).join("\n")}

Para cada item, informe o melhor preco encontrado e a loja. Depois, estime o total por mercado e diga qual mercado sai mais barato no geral. Seja honesto: se um preco for estimativa/indisponivel, marque em "obs".
Responda APENAS com JSON valido, sem markdown:
{"local":"${local}","itens":[{"nome":"","melhor_preco":0.00,"melhor_loja":"","link":"","obs":""}],"por_mercado":[{"loja":"","total_estimado":0.00,"itens_encontrados":0}],"melhor_mercado":"","economia_estimada":0.00,"resumo":""}
Use ponto decimal.`;
  const data = await callClaude(prompt, MAX_BUSCAS_LISTA, 4000, env);
  const parsed = extractJson(data.text);
  if (!parsed) return json({ ok: false, erro: "resposta sem JSON", cru: (data.text||"").slice(0,400) }, 502, cors);
  return json({ ok: true, modo: "lista", ...parsed }, 200, cors);
}

async function callClaude(prompt, maxBuscas, maxTokens, env) {
  const r = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: maxTokens,
      messages: [{ role: "user", content: prompt }],
      tools: [{ type: "web_search_20250305", name: "web_search", max_uses: maxBuscas }],
    }),
  });
  const data = await r.json();
  if (data.error) throw new Error(data.error.message || "erro na API");
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
