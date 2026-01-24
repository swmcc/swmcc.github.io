import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';

export async function GET(context) {
  const writing = await getCollection('writing');
  const notes = await getCollection('notes');

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

  // Combine and sort by date
  const items = [...writingItems, ...noteItems]
    .sort((a, b) => b.pubDate.valueOf() - a.pubDate.valueOf());

  return rss({
    title: "Stephen McCullough",
    description: "Software engineer and founder - writing and technical notes",
    site: context.site,
    items: items,
    customData: `<language>en-gb</language>`,
  });
}
