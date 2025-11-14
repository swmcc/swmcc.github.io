import { getCollection } from 'astro:content';
import type { APIRoute } from 'astro';

export const GET: APIRoute = async () => {
  // Fetch all content collections
  const [writing, notes, thoughts, projects, nowPages] = await Promise.all([
    getCollection('writing'),
    getCollection('notes'),
    getCollection('thoughts'),
    getCollection('projects'),
    getCollection('now')
  ]);

  // Build file system structure with real content
  const fileSystem: any = {};

  // Add about.md (static placeholder for now)
  fileSystem['about.md'] = {
    type: 'file',
    name: 'about.md',
    content: 'Stephen McCullough - Software Engineer\nView full bio at: /about',
    url: '/about'
  };

  // Add now.md with actual current content
  if (nowPages.length > 0) {
    const currentNow = nowPages[0];
    fileSystem['now.md'] = {
      type: 'file',
      name: 'now.md',
      content: `What I'm up to (updated ${currentNow.data.updatedDate.toLocaleDateString('en-GB')})\n\nView full page at: /now`,
      url: '/now'
    };
  }

  // Add writing directory
  if (writing.length > 0) {
    fileSystem['writing'] = {
      type: 'directory',
      name: 'writing',
      children: {}
    };

    writing.forEach(post => {
      const fileName = `${post.slug}.md`;
      fileSystem['writing'].children[fileName] = {
        type: 'file',
        name: fileName,
        content: `${post.data.title}\n\n${post.data.description}\n\nPublished: ${post.data.pubDate.toLocaleDateString('en-GB')}\nTags: ${post.data.tags?.join(', ') || 'none'}\n\nView full article at: /writing/${post.slug}`,
        url: `/writing/${post.slug}`,
        metadata: {
          title: post.data.title,
          description: post.data.description,
          pubDate: post.data.pubDate,
          tags: post.data.tags || []
        }
      };
    });
  }

  // Add notes directory
  if (notes.length > 0) {
    fileSystem['notes'] = {
      type: 'directory',
      name: 'notes',
      children: {}
    };

    notes.forEach(note => {
      const fileName = `${note.slug}.md`;
      fileSystem['notes'].children[fileName] = {
        type: 'file',
        name: fileName,
        content: `${note.data.title}\n\nPublished: ${note.data.pubDate.toLocaleDateString('en-GB')}\nTags: ${note.data.tags?.join(', ') || 'none'}\n\nView full note at: /notes/${note.slug}`,
        url: `/notes/${note.slug}`,
        metadata: {
          title: note.data.title,
          pubDate: note.data.pubDate,
          tags: note.data.tags || []
        }
      };
    });
  }

  // Add thoughts directory
  if (thoughts.length > 0) {
    fileSystem['thoughts'] = {
      type: 'directory',
      name: 'thoughts',
      children: {}
    };

    thoughts.forEach(thought => {
      const fileName = `${thought.slug}.md`;
      const timeStr = thought.data.pubTime ? ` at ${thought.data.pubTime}` : '';
      fileSystem['thoughts'].children[fileName] = {
        type: 'file',
        name: fileName,
        content: `Thought posted ${thought.data.pubDate.toLocaleDateString('en-GB')}${timeStr}\nTags: ${thought.data.tags?.join(', ') || 'none'}\n\nView at: /thoughts/${thought.slug}`,
        url: `/thoughts/${thought.slug}`,
        metadata: {
          pubDate: thought.data.pubDate,
          pubTime: thought.data.pubTime,
          tags: thought.data.tags || []
        }
      };
    });
  }

  // Add projects directory
  if (projects.length > 0) {
    fileSystem['projects'] = {
      type: 'directory',
      name: 'projects',
      children: {}
    };

    projects.forEach(project => {
      const fileName = `${project.slug}.md`;
      fileSystem['projects'].children[fileName] = {
        type: 'file',
        name: fileName,
        content: `${project.data.title}\n\n${project.data.description}\n\nPublished: ${project.data.pubDate.toLocaleDateString('en-GB')}\nTags: ${project.data.tags?.join(', ') || 'none'}\n\nView full project at: /projects/${project.slug}`,
        url: `/projects/${project.slug}`,
        metadata: {
          title: project.data.title,
          description: project.data.description,
          pubDate: project.data.pubDate,
          tags: project.data.tags || []
        }
      };
    });
  }

  // Build searchable content index for chat mode
  const searchIndex: any[] = [];

  // Index writing posts
  for (const post of writing) {
    searchIndex.push({
      type: 'writing',
      slug: post.slug,
      title: post.data.title,
      description: post.data.description,
      content: post.body,
      tags: post.data.tags || [],
      pubDate: post.data.pubDate,
      url: `/writing/${post.slug}`
    });
  }

  // Index notes
  for (const note of notes) {
    searchIndex.push({
      type: 'notes',
      slug: note.slug,
      title: note.data.title,
      content: note.body,
      tags: note.data.tags || [],
      pubDate: note.data.pubDate,
      url: `/notes/${note.slug}`
    });
  }

  // Index thoughts
  for (const thought of thoughts) {
    searchIndex.push({
      type: 'thoughts',
      slug: thought.slug,
      content: thought.body,
      tags: thought.data.tags || [],
      pubDate: thought.data.pubDate,
      pubTime: thought.data.pubTime,
      url: `/thoughts/${thought.slug}`
    });
  }

  // Index projects
  for (const project of projects) {
    searchIndex.push({
      type: 'projects',
      slug: project.slug,
      title: project.data.title,
      description: project.data.description,
      content: project.body,
      tags: project.data.tags || [],
      pubDate: project.data.pubDate,
      url: `/projects/${project.slug}`
    });
  }

  // Create knowledge base for Swanson chat mode
  const knowledgeBase = {
    about: {
      name: 'Stephen McCullough',
      location: 'Northern Ireland',
      role: 'Software Engineer',
      interests: [
        'Ruby on Rails',
        'Python',
        'Modern web architecture',
        'AI operating systems',
        'Personal projects',
        'Self-hosted tools'
      ]
    },
    skills: {
      rails: extractSkillInfo('rails', searchIndex),
      python: extractSkillInfo('python', searchIndex),
      astro: extractSkillInfo('astro', searchIndex),
      hotwire: extractSkillInfo('hotwire', searchIndex),
      elasticsearch: extractSkillInfo('elasticsearch', searchIndex),
      typescript: extractSkillInfo('typescript', searchIndex),
      tailwind: extractSkillInfo('tailwind', searchIndex)
    },
    projects: {
      active: projects.map(p => ({
        title: p.data.title,
        description: p.data.description,
        url: `/projects/${p.slug}`,
        tags: p.data.tags || []
      }))
    }
  };

  return new Response(
    JSON.stringify({
      fileSystem,
      searchIndex,
      knowledgeBase,
      generatedAt: new Date().toISOString()
    }, null, 2),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    }
  );
};

// Helper function to extract skill information from content
function extractSkillInfo(skill: string, searchIndex: any[]): any {
  const skillLower = skill.toLowerCase();
  const relevantContent = searchIndex.filter(item => {
    const matchesTag = item.tags?.some((tag: string) => tag.toLowerCase().includes(skillLower));
    const matchesContent = item.content?.toLowerCase().includes(skillLower);
    const matchesTitle = item.title?.toLowerCase().includes(skillLower);
    const matchesDescription = item.description?.toLowerCase().includes(skillLower);

    return matchesTag || matchesContent || matchesTitle || matchesDescription;
  });

  return {
    mentioned: relevantContent.length > 0,
    count: relevantContent.length,
    examples: relevantContent.slice(0, 3).map((item: any) => ({
      type: item.type,
      title: item.title || `${item.type} post`,
      url: item.url,
      excerpt: extractRelevantExcerpt(item.content, skillLower)
    }))
  };
}

// Extract a relevant excerpt containing the skill keyword
function extractRelevantExcerpt(content: string, keyword: string, contextLength = 150): string {
  if (!content) return '';

  const lowerContent = content.toLowerCase();
  const index = lowerContent.indexOf(keyword);

  if (index === -1) return content.substring(0, contextLength) + '...';

  const start = Math.max(0, index - contextLength / 2);
  const end = Math.min(content.length, index + contextLength / 2);

  let excerpt = content.substring(start, end);

  if (start > 0) excerpt = '...' + excerpt;
  if (end < content.length) excerpt = excerpt + '...';

  return excerpt;
}
