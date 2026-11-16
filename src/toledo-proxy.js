// Only requests under /toledo reach this Worker (see run_worker_first); everything else is static assets.
export default {
  fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === "/toledo") return Response.redirect(`${url.origin}/toledo/`, 301);
    url.pathname = url.pathname.slice("/toledo".length);
    return env.TOLEDO.fetch(new Request(url, request));
  },
};
