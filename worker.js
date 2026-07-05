/**
 * BARATÃO — Motor Inteligente (Cloudflare Worker)
 * ------------------------------------------------------------
 * Recebe {produto, local} do app e usa a API da Anthropic COM
 * BUSCA WEB para achar os melhores preços reais na internet.
 * A chave fica guardada como SECRET do Worker (nunca no site).
 *
 * DEPLOY (grátis, ~5 min):
 *   1. https://dash.cloudflare.com  ->  Workers & Pages -> Create -> Worker
 *   2. Cole este arquivo -> Deploy
 *   3. Settings -> Variables and Secrets -> Add:
 *        Nome:  ANTHROPIC_API_KEY
 *        Valor: sua chave (sk-ant-...)   [marque como Secret/Encrypt]
 *   4. Copie a URL do Worker (ex: https://baratao.SEU-USER.workers.dev)
 *   5. No index.html, em CONFIG.API_ENDPOINT, cole essa URL.
 *
 * CUSTO: cada busca faz até MAX_BUSCAS pesquisas web + 1 chamada ao
 * modelo. Com Haiku fica em poucos centavos por busca. O app já
 * guarda cache local pra não repetir buscas iguais.
 */

const MODEL = "claude-haiku-4-5-20251001"; // troque por "claude-sonnet-5" p/ resultados melhores (mais caro)
const MAX_BUSCAS = 4;                        // teto de pesquisas web por consulta (controla custo)

export default {
  async fetch(request, env) {
    const cors = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };
    if (request.method === "OPTIONS") return new Response(null, { headers: cors });

    const url = new URL(request.url);
    let produto, local;
    if (request.method === "POST") {
      const b = await request.json().catch(() => ({}));
      produto = b.produto; local = b.local;
    } else {
      produto = url.searchParams.get("produto");
      local = url.searchParams.get("local");
    }
    if (!produto) return json({ ok: false, erro: "faltou 'produto'" }, 400, cors);
    if (!env.ANTHROPIC_API_KEY) return json({ ok: false, erro: "configure o secret ANTHROPIC_API_KEY no Worker" }, 500, cors);

    const prompt =
`Você é um caçador de ofertas no Brasil. Pesquise na web os MELHORES preços ATUAIS de "${produto}"${local ? ` para quem está em ${local}` : ""}.
Considere lojas online e marketplaces (Mercado Livre, Amazon, Magalu, Americanas, sites oficiais) e, quando fizer sentido, preços locais/regionais.
Traga de 3 a 6 opções, da mais barata para a mais cara, com link direto quando houver.
Responda APENAS com um objeto JSON válido, sem markdown, sem crases, exatamente neste formato:
{"produto":"${produto}","local":"${local || ""}","resultados":[{"loja":"nome","preco":0.00,"unidade":"ex: un, kg, L","local":"cidade/UF ou 'online'","link":"https://...","fonte":"onde achou","obs":"frete/condição, se relevante"}],"resumo":"uma frase curta com a melhor dica de economia"}
Use ponto decimal. Se não houver link confiável, deixe "link":"".`;

    try {
      const r = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": env.ANTHROPIC_API_KEY,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: MODEL,
          max_tokens: 2000,
          messages: [{ role: "user", content: prompt }],
          tools: [{ type: "web_search_20250305", name: "web_search", max_uses: MAX_BUSCAS }],
        }),
      });
      const data = await r.json();
      if (data.error) return json({ ok: false, erro: data.error.message || "erro na API" }, 502, cors);

      const text = (data.content || []).filter(b => b.type === "text").map(b => b.text).join("\n").trim();
      const parsed = extractJson(text);
      if (!parsed) return json({ ok: false, erro: "resposta sem JSON", cru: text.slice(0, 500) }, 502, cors);

      return json({ ok: true, ...parsed }, 200, { ...cors, "Cache-Control": "public, max-age=300" });
    } catch (e) {
      return json({ ok: false, erro: String(e) }, 502, cors);
    }
  },
};

function extractJson(text) {
  if (!text) return null;
  const t = text.replace(/```json/gi, "").replace(/```/g, "").trim();
  const a = t.indexOf("{"), b = t.lastIndexOf("}");
  if (a < 0 || b < 0) return null;
  try { return JSON.parse(t.slice(a, b + 1)); } catch { return null; }
}
function json(obj, status, headers) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { ...headers, "Content-Type": "application/json; charset=utf-8" },
  });
}
