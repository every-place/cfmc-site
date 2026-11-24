import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import site from '../data/site.json';

export async function GET(context) {
  // While the Coming Soon switch is on, the feed is empty.
  const posts = site.comingSoon ? [] : (await getCollection('blog', ({ data }) => !data.draft))
    .sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
  return rss({
    title: site.name,
    description: site.tagline,
    site: context.site,
    items: posts.map((p) => ({
      title: p.data.title,
      description: p.data.description,
      pubDate: p.data.date,
      link: `/blog/${p.id}/`,
    })),
  });
}
