// Cloudflare Worker for caringformycaregivers.com.
//
// Almost everything is the static Astro site in ./dist, served by Cloudflare's asset
// handler. The only routes that run code are /oauth/*, the "Sign in with GitHub" step
// for the blog editor at /admin (Sveltia CMS). The editor then saves posts straight to
// the GitHub repo, and every save to main redeploys the site.
//
// Needs two secrets in Cloudflare (Worker > Settings > Variables and Secrets):
//   GITHUB_CLIENT_ID      from the GitHub OAuth App
//   GITHUB_CLIENT_SECRET  from the GitHub OAuth App

const COOKIE = 'cfmc-oauth-state';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    // The editor's sign-in popup must run on the same address as the editor, so always
    // use the main domain (no www) for /admin and /oauth.
    if (url.hostname.startsWith('www.')) {
      url.hostname = url.hostname.slice(4);
      return Response.redirect(url.toString(), 301);
    }
    if (url.pathname === '/oauth/authorize') return authorize(request, env, url);
    if (url.pathname === '/oauth/callback') return callback(request, env, url);
    return env.ASSETS.fetch(request);
  },
};

function authorize(request, env, url) {
  if (!env.GITHUB_CLIENT_ID || !env.GITHUB_CLIENT_SECRET) {
    return page('error', { error: 'The editor sign-in is not set up yet (missing GitHub OAuth secrets).' });
  }
  const state = crypto.randomUUID().replaceAll('-', '');
  const scope = url.searchParams.get('scope') || 'public_repo';
  const github = new URL('https://github.com/login/oauth/authorize');
  github.searchParams.set('client_id', env.GITHUB_CLIENT_ID);
  github.searchParams.set('redirect_uri', `${url.origin}/oauth/callback`);
  github.searchParams.set('scope', scope);
  github.searchParams.set('state', state);
  return new Response(null, {
    status: 302,
    headers: {
      Location: github.toString(),
      'Set-Cookie': `${COOKIE}=${state}; HttpOnly; Secure; SameSite=Lax; Path=/oauth; Max-Age=600`,
    },
  });
}

async function callback(request, env, url) {
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const cookie = (request.headers.get('Cookie') || '')
    .split(';')
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${COOKIE}=`));
  const expected = cookie ? cookie.slice(COOKIE.length + 1) : '';

  if (!code || !state || !expected || state !== expected) {
    return page('error', { error: 'Sign-in expired or was interrupted. Please close this window and try again.' });
  }

  const res = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: { Accept: 'application/json', 'Content-Type': 'application/json', 'User-Agent': 'cfmc-site' },
    body: JSON.stringify({
      client_id: env.GITHUB_CLIENT_ID,
      client_secret: env.GITHUB_CLIENT_SECRET,
      code,
      redirect_uri: `${url.origin}/oauth/callback`,
    }),
  });
  const data = await res.json().catch(() => ({}));
  if (!data.access_token) {
    return page('error', { error: data.error_description || 'GitHub did not return a sign-in token.' });
  }
  return page('success', { token: data.access_token });
}

// The small handshake page the editor's sign-in popup expects (Decap/Sveltia protocol).
// Messages only go back to a window on this same site.
function page(status, content) {
  const message = `authorization:github:${status}:${JSON.stringify({ provider: 'github', ...content })}`;
  const html = `<!doctype html><html><head><meta charset="utf-8"><title>Signing in…</title></head>
<body style="font-family:system-ui,sans-serif;padding:2rem;color:#2f2229">
<p>${status === 'success' ? 'Signed in. You can close this window.' : escapeHtml(content.error)}</p>
<script>
(() => {
  const message = ${JSON.stringify(message)};
  const origin = location.origin;
  if (!window.opener) return;
  window.addEventListener('message', (e) => {
    if (e.origin === origin && e.data === 'authorizing:github') {
      window.opener.postMessage(message, origin);
    }
  });
  window.opener.postMessage('authorizing:github', origin);
})();
</script></body></html>`;
  return new Response(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
      'Set-Cookie': `${COOKIE}=; HttpOnly; Secure; SameSite=Lax; Path=/oauth; Max-Age=0`,
    },
  });
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
}
