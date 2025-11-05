import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';

export async function GET(context) {
  const writing = await getCollection('writing');
  const notes = await getCollection('notes');
  const thoughts = await getCollection('thoughts');

  // Filter out draft posts
  const publishedWriting = writing.filter((post) => !post.data.draft);

  // Process writing
  const writingItems = publishedWriting.map((item) => ({
    title: item.data.title,
    description: item.data.description,
    pubDate: item.data.pubDate,
    link: `/writing/${item.slug}/`,
    categories: ['Writing'],
  }));

  // Process notes
  const noteItems = notes.map((item) => ({
    title: item.data.title,
    description: `A technical note about ${item.data.title}`,
    pubDate: item.data.pubDate,
    link: `/notes/${item.slug}/`,
    categories: ['Notes'],
  }));

  // Process thoughts - need to render markdown to get content
  const thoughtItems = await Promise.all(
    thoughts.map(async (item) => {
      const { Content } = await item.render();
      const rendered = Content ? String(Content) : 'A quick thought';
      return {
        title: `Thought from ${item.data.pubDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`,
        description: rendered.substring(0, 200) + '...',
        pubDate: item.data.pubDate,
        link: `/thoughts/`,
        categories: ['Thoughts'],
      };
    })
  );

  // Combine and sort by date
  const items = [...writingItems, ...noteItems, ...thoughtItems]
    .sort((a, b) => b.pubDate.valueOf() - a.pubDate.valueOf());

  return rss({
    title: "Stephen McCullough",
    description: "Software engineer and founder - writing, technical notes, and quick thoughts",
    site: context.site,
    items: items,
    customData: `<language>en-gb</language>`,
  });
}
