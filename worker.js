// src/worker.js
var worker_default = {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }
    if (url.pathname === "/api/messages") {
      if (request.method === "GET") {
        try {
          const before = url.searchParams.get("before");
          const limit = 30;

          let query;
          if (before) {
            query = env.DB.prepare(
              'SELECT id, name, message, datetime(timestamp, "localtime") as timestamp FROM messages WHERE id < ? ORDER BY id DESC LIMIT ?',
            ).bind(before, limit + 1);
          } else {
            query = env.DB.prepare(
              'SELECT id, name, message, datetime(timestamp, "localtime") as timestamp FROM messages ORDER BY id DESC LIMIT ?',
            ).bind(limit + 1);
          }

          const { results } = await query.all();
          const hasMore = results.length > limit;
          const messages = hasMore ? results.slice(0, limit) : results;

          return new Response(
            JSON.stringify({
              messages,
              has_more: hasMore,
              oldest_id:
                messages.length > 0 ? messages[messages.length - 1].id : null,
            }),
            {
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            },
          );
        } catch (error) {
          return new Response("Database error", {
            status: 500,
            headers: corsHeaders,
          });
        }
      }
      if (request.method === "POST") {
        try {
          const { name, message } = await request.json();
          if (!name || !message || name.length > 20 || message.length > 200) {
            return new Response("Invalid input", {
              status: 400,
              headers: corsHeaders,
            });
          }
          await env.DB.prepare(
            "INSERT INTO messages (name, message) VALUES (?, ?)",
          )
            .bind(name.trim(), message.trim())
            .run();
          return new Response("Message added", { headers: corsHeaders });
        } catch (error) {
          return new Response("Database error", {
            status: 500,
            headers: corsHeaders,
          });
        }
      }
    }
    return new Response("Not found", { status: 404, headers: corsHeaders });
  },
};
export { worker_default as default };
//# sourceMappingURL=worker.js.map
