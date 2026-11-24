# Caring for My Caregivers

Website for [caringformycaregivers.com](https://caringformycaregivers.com): encouragement, tips, and resources for dementia and Alzheimer's caregivers, by Kristen Dean.

Built with [Astro](https://astro.build) as a static site and hosted on Cloudflare (Workers static assets).

## Pages

| Page | File |
| --- | --- |
| Home | `src/pages/index.astro` |
| About Kristen | `src/pages/about.astro` |
| Grandma Rose & Lily | `src/pages/stories.astro` (the only page that uses the story artwork) |
| Blog | `src/pages/blog/` with posts in `src/content/blog/*.md` |
| Caregiver Resources | `src/pages/resources.astro` with the list in `src/data/resources.json` |
| Contact | `src/pages/contact.astro` |

Site-wide settings (contact email, Facebook / YouTube / Instagram links) live in `src/data/site.json`. Links left blank are hidden.

## Common edits

**New blog post:** add a file to `src/content/blog/`, e.g. `my-post.md`. The file name becomes the URL (`/blog/my-post`).

```md
---
title: "When Mom Forgot the Cookies"
description: "One sentence shown in the blog list."
date: 2026-12-01
---

Write the post here in plain text. Blank lines start new paragraphs.
```

Set `draft: true` to hide a post. Kristen normally uses the blog editor instead (below).

## Blog editor (/admin)

Kristen writes posts at **https://caringformycaregivers.com/admin**, on a computer, phone, or tablet. It's [Sveltia CMS](https://github.com/sveltia/sveltia-cms): a Word-like editor with photo upload. Each **Save** commits the post to `main` on GitHub, and Cloudflare redeploys the site in a minute or two. On a phone or tablet she can use **Add to Home Screen** to get an app icon for it.

- Editor settings (fields, photo folder, the Caregiver Resources editor): `public/admin/config.yml`
- Sign-in: `worker/index.js`, a small Worker that handles only `/admin` and `/oauth/*`. Everything else is served straight from `dist`.
- Photos are resized to 1600px and saved as WebP in `public/images/blog/`.
- Kristen signs in with her own free GitHub account, which must be a collaborator on this repo.

### One-time setup

1. **GitHub OAuth app.** On GitHub: profile picture → **Settings** → **Developer settings** → **OAuth Apps** → **New OAuth App**.
   - Application name: `Caring for My Caregivers Editor`
   - Homepage URL: `https://caringformycaregivers.com`
   - Authorization callback URL: `https://caringformycaregivers.com/oauth/callback`
   - Click **Register application**, copy the **Client ID**, then click **Generate a new client secret** and copy it.
2. **Cloudflare secrets.** Cloudflare dashboard → **Workers & Pages** → `cfmc-site` → **Settings** → **Variables and Secrets** → **Add**. Type **Secret**, name `GITHUB_CLIENT_ID`, paste the Client ID, then **Deploy**. Repeat for `GITHUB_CLIENT_SECRET` with the client secret.
3. **Kristen's login.** She creates a free account at https://github.com/signup (her site email works). Then on this repo: **Settings** → **Collaborators** → **Add people** → her username. She accepts the invitation email.

To test locally, put the same two values in a `.dev.vars` file (git-ignored), run `npm run build` and `npx wrangler dev`.

**Add a local resource:** add an entry to the `local` list in `src/data/resources.json`. Entries are grouped by `location`:

```json
{ "location": "Texas: Dallas area", "name": "Example Support Group", "url": "https://example.org", "phone": "555-555-5555", "description": "Meets the first Tuesday of each month." }
```

## Run locally

```sh
npm install
npm run dev      # http://localhost:4321
npm run build    # outputs to dist/
```

## Deploying on Cloudflare

The site deploys as a Cloudflare Worker with static assets (config in `wrangler.jsonc`). In the Cloudflare dashboard: **Workers & Pages → Create application → Import a repository**, pick `cfmc-site`, name the project `cfmc-site` (it must match `name` in `wrangler.jsonc`), build command `npm run build`, deploy command `npx wrangler deploy`. Every push to `main` redeploys. The `routes` in `wrangler.jsonc` attach caringformycaregivers.com and www automatically on deploy.

It also works on classic Cloudflare Pages (preset Astro, build `npm run build`, output `dist`).

When adding the custom domain, only the `@` and `www` web records change. Never edit the Zoho email records (MX, the SPF TXT record, and `zoho._domainkey`).

## Planned later

Stripe memberships (including international), a downloads store for the activity book, and a Patreon/Facebook tie-in. The blog schema already has a `membersOnly` flag reserved for the membership phase.
