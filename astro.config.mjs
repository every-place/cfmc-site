import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import site from './src/data/site.json' with { type: 'json' };

export default defineConfig({
  site: 'https://caringformycaregivers.com',
  // While the Coming Soon switch is on, the sitemap only lists the home page.
  integrations: [sitemap({ filter: (page) => !site.comingSoon || new URL(page).pathname === '/' })],
});
