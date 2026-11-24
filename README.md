# Caring for My Caregivers

Website for [caringformycaregivers.com](https://caringformycaregivers.com): encouragement, tips, and resources for dementia and Alzheimer's caregivers, by Kristen Dean.

Built with [Astro](https://astro.build) as a static site and hosted on Cloudflare Pages.

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

Set `draft: true` to hide a post. A browser-based editor for Kristen is planned so she won't need to touch files.

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

Stripe memberships (including international), a downloads store for the activity book, a Patreon/Facebook tie-in, and a simple browser editor for blog posts. The blog schema already has a `membersOnly` flag reserved for the membership phase.
