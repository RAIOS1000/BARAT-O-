/**
 * BARATÃO — proxy CORS para a API do Menor Preço (Nota Paraná)
 * ------------------------------------------------------------
 * A API do governo não envia cabeçalhos CORS, então o navegador
 * bloqueia a chamada direta a partir do GitHub Pages. Este Worker
 * fica no meio, repassa a requisição e devolve com CORS liberado.
 *
 * Deploy grátis (2 min):
 *   1. Crie conta em https://dash.cloudflare.com  (plano free serve)
 *   2. Workers & Pages > Create > Worker > cole este código > Deploy
 *   3. Copie a URL gerada (ex: https://baratao.SEU-USER.workers.dev)
 *   4. No index.html, em CONFIG.PROXY_URL, use:  "https://baratao.SEU-USER.workers.dev/?url="
 *
 * Segurança: só repassa chamadas para o domínio oficial do Menor Preço.
 */
const ALLOWED = "menorpreco.notaparana.pr.gov.br";

export default {
  async fetch(request) {
    const cors = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "*",
    };
    if (request.method === "OPTIONS") return new Response(null, { headers: cors });

    const target = new URL(request.url).searchParams.get("url");
    if (!target) return json({ error: "faltou o parâmetro ?url=" }, 400, cors);

    let dest;
    try { dest = new URL(target); } catch { return json({ error: "url inválida" }, 400, cors); }
    if (dest.hostname !== ALLOWED) return json({ error: "domínio não permitido" }, 403, cors);

    try {
      const upstream = await fetch(dest.toString(), {
        headers: { "Accept": "application/json", "User-Agent": "Baratao/1.0" },
      });
      const body = await upstream.text();
      return new Response(body, {
        status: upstream.status,
        headers: { ...cors, "Content-Type": "application/json; charset=utf-8", "Cache-Control": "public, max-age=60" },
      });
    } catch (e) {
      return json({ error: "falha ao consultar a origem", detail: String(e) }, 502, cors);
    }
  },
};

function json(obj, status, cors) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { ...cors, "Content-Type": "application/json; charset=utf-8" },
  });
}
