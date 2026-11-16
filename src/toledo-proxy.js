// Requests that match no static asset also fall through to this Worker, so anything outside /toledo must 404 here.
export default {
  fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === "/toledo") return Response.redirect(`${url.origin}/toledo/`, 301);
    if (!url.pathname.startsWith("/toledo/")) return new Response("Not found", { status: 404 });
    url.pathname = url.pathname.slice("/toledo".length);
    return env.TOLEDO.fetch(new Request(url, request));
  },
};
