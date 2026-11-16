// Serves the Toledo landing page from its own Pages project (TOLEDO_ORIGIN, which deploys toledo/docs/site)
// so no copy lives in this repo.
export async function onRequest({ request, env, params }) {
  if (!env.TOLEDO_ORIGIN) return new Response("TOLEDO_ORIGIN is not set", { status: 500 });

  const url = new URL(request.url);
  if (url.pathname === "/toledo") return Response.redirect(`${url.origin}/toledo/`, 301);

  const upstream = new URL(`/${(params.path ?? []).join("/")}`, env.TOLEDO_ORIGIN);
  return fetch(upstream, { method: request.method, headers: request.headers });
}
