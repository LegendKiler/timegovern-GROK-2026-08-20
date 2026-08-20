/**
 * TimeGovern Free Live News v2
 * Multi-source public RSS – no API keys required
 * Sources: Google News, BBC, Guardian, NPR, Reuters, AP, Smithsonian, Space.com-style science feeds
 */

export interface GroundedArticle {
  id: string;
  title: string;
  category: 'leap_seconds' | 'dst' | 'astronomy' | 'timezones' | 'technology' | 'metrology' | 'world';
  date: string;
  timeAgo: string;
  author: string;
  readTime: string;
  featured?: boolean;
  summary: string;
  content: string;
  keyTakeaways: string[];
  imageUrl: string;
  sourceUrl: string;
  publisher: string;
  groundingSources?: Array<{ title: string; url: string }>;
  verifiedGrounding?: boolean;
  pubTimestamp?: number;
}

export interface NewsResponsePayload {
  success: boolean;
  grounded: boolean;
  source: string;
  model?: string;
  queryTopic?: string;
  updated_at: string;
  search_queries?: string[];
  grounding_sources?: Array<{ title: string; url: string }>;
  articles: GroundedArticle[];
}

interface CacheEntry {
  timestamp: number;
  payload: NewsResponsePayload;
}
const newsCache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 45 * 1000; // 45s – fresher live feel

const RSS_FEEDS = [
  {
    name: 'Google News – Time & Astronomy',
    url: 'https://news.google.com/rss/search?q=%22time+zone%22+OR+astronomy+OR+%22leap+second%22+OR+%22daylight+saving%22+OR+UTC+OR+metrology+OR+eclipse&hl=en-US&gl=US&ceid=US:en',
    publisher: 'Google News',
    category: 'timezones' as const,
    max: 8,
  },
  {
    name: 'Google News – Space',
    url: 'https://news.google.com/rss/search?q=NASA+OR+space+OR+astronomy+OR+eclipse+OR+meteor&hl=en-US&gl=US&ceid=US:en',
    publisher: 'Google News Space',
    category: 'astronomy' as const,
    max: 6,
  },
  {
    name: 'Google News – World',
    url: 'https://news.google.com/rss?hl=en-US&gl=US&ceid=US:en',
    publisher: 'Google News',
    category: 'world' as const,
    max: 8,
  },
  {
    name: 'BBC World',
    url: 'https://feeds.bbci.co.uk/news/world/rss.xml',
    publisher: 'BBC News',
    category: 'world' as const,
    max: 8,
  },
  {
    name: 'BBC Science',
    url: 'https://feeds.bbci.co.uk/news/science_and_environment/rss.xml',
    publisher: 'BBC Science',
    category: 'astronomy' as const,
    max: 6,
  },
  {
    name: 'BBC Technology',
    url: 'https://feeds.bbci.co.uk/news/technology/rss.xml',
    publisher: 'BBC Technology',
    category: 'technology' as const,
    max: 5,
  },
  {
    name: 'The Guardian World',
    url: 'https://www.theguardian.com/world/rss',
    publisher: 'The Guardian',
    category: 'world' as const,
    max: 6,
  },
  {
    name: 'The Guardian Science',
    url: 'https://www.theguardian.com/science/rss',
    publisher: 'The Guardian Science',
    category: 'astronomy' as const,
    max: 5,
  },
  {
    name: 'NPR News',
    url: 'https://feeds.npr.org/1001/rss.xml',
    publisher: 'NPR',
    category: 'world' as const,
    max: 6,
  },
  {
    name: 'NPR Science',
    url: 'https://feeds.npr.org/1007/rss.xml',
    publisher: 'NPR Science',
    category: 'astronomy' as const,
    max: 5,
  },
  {
    name: 'Reuters World',
    url: 'https://www.reutersagency.com/feed/?taxonomy=best-topics&post_type=best',
    publisher: 'Reuters',
    category: 'world' as const,
    max: 5,
  },
  {
    name: 'NASA Breaking News',
    url: 'https://www.nasa.gov/rss/dyn/breaking_news.rss',
    publisher: 'NASA',
    category: 'astronomy' as const,
    max: 6,
  },
  {
    name: 'ESA Space News',
    url: 'https://www.esa.int/rssfeed/topNews',
    publisher: 'ESA',
    category: 'astronomy' as const,
    max: 4,
  },
];

const FALLBACK_ARTICLES: GroundedArticle[] = [
  {
    id: 'fallback-1',
    title: 'TimeGovern Live News – Connecting to free public feeds',
    category: 'world',
    date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    timeAgo: 'Just now',
    author: 'TimeGovern',
    publisher: 'TimeGovern',
    readTime: '1 min read',
    featured: true,
    summary: 'Live RSS feeds are temporarily unreachable. The system will retry automatically.',
    content: 'TimeGovern aggregates free public RSS from Google News, BBC, Guardian, NPR, NASA, ESA and more. No paid API keys are required.',
    keyTakeaways: ['Free multi-source RSS', 'Auto-refresh every 45s', 'No paid APIs'],
    imageUrl: 'https://images.unsplash.com/photo-1504711434719-226ed3222c1d?auto=format&fit=crop&w=1200&q=80',
    sourceUrl: 'https://timegovern.com',
    verifiedGrounding: false,
    pubTimestamp: Date.now(),
  },
];

function timeAgo(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    const sec = Math.floor((Date.now() - d.getTime()) / 1000);
    if (Number.isNaN(sec) || sec < 0) return 'Recently';
    if (sec < 60) return 'Just now';
    if (sec < 3600) return `${Math.floor(sec / 60)} min ago`;
    if (sec < 86400) return `${Math.floor(sec / 3600)} hours ago`;
    if (sec < 172800) return '1 day ago';
    return `${Math.floor(sec / 86400)} days ago`;
  } catch {
    return 'Recently';
  }
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&#\d+;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractImage(block: string, description: string): string | null {
  // media:content / enclosure
  const media =
    block.match(/url=["'](https?:\/\/[^"']+\.(?:jpg|jpeg|png|webp|gif)[^"']*)["']/i) ||
    block.match(/<media:content[^>]+url=["']([^"']+)["']/i) ||
    block.match(/<enclosure[^>]+url=["']([^"']+)["']/i) ||
    description.match(/(https?:\/\/[^\s"'<>]+\.(?:jpg|jpeg|png|webp|gif))/i);
  if (media) return media[1];
  const imgTag = description.match(/<img[^>]+src=["']([^"']+)["']/i);
  if (imgTag) return imgTag[1];
  return null;
}

function guessCategory(title: string, defaultCat: GroundedArticle['category']): GroundedArticle['category'] {
  const t = title.toLowerCase();
  if (/leap\s*second|atomic clock|metrology|bipm|iers|tai-utc/.test(t)) return 'leap_seconds';
  if (/daylight|\bdst\b|summer time|winter time|clocks? (go|change|spring|fall)/.test(t)) return 'dst';
  if (/astronomy|eclipse|meteor|nasa|space|moon|mars|satellite|orbit|comet|galaxy|telescope/.test(t)) return 'astronomy';
  if (/time\s*zone|timezone|\butc\b|\bgmt\b|iana|tzdata/.test(t)) return 'timezones';
  if (/quantum|nist|optical clock|precision timing|gps clock/.test(t)) return 'technology';
  return defaultCat;
}

function categoryImage(category: string, index: number): string {
  const images: Record<string, string[]> = {
    leap_seconds: [
      'https://images.unsplash.com/photo-1508962914676-134849a727f0?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?auto=format&fit=crop&w=1200&q=80',
    ],
    dst: ['https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80'],
    astronomy: [
      'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&w=1200&q=80',
    ],
    timezones: ['https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1200&q=80'],
    technology: ['https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80'],
    world: [
      'https://images.unsplash.com/photo-1504711434719-226ed3222c1d?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1495020689067-958852a7765e?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1504711434719-226ed3222c1d?auto=format&fit=crop&w=1200&q=80',
    ],
    metrology: ['https://images.unsplash.com/photo-1507668077129-56e32842fceb?auto=format&fit=crop&w=1200&q=80'],
  };
  const pool = images[category] || images.world;
  return pool[index % pool.length];
}

function parseRssItems(
  xml: string,
  maxItems: number
): Array<{ title: string; link: string; description: string; pubDate: string; source?: string; image?: string | null }> {
  const items: Array<{
    title: string;
    link: string;
    description: string;
    pubDate: string;
    source?: string;
    image?: string | null;
  }> = [];

  const itemRegex = /<item[\s\S]*?<\/item>/gi;
  const entryRegex = /<entry[\s\S]*?<\/entry>/gi; // Atom
  const blocks = [...(xml.match(itemRegex) || []), ...(xml.match(entryRegex) || [])];

  for (const block of blocks.slice(0, maxItems)) {
    const get = (tag: string) => {
      const cdata = block.match(new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>`, 'i'));
      if (cdata) return cdata[1].trim();
      const normal = block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i'));
      return normal ? normal[1].trim() : '';
    };

    let title = stripHtml(get('title'));
    let link = get('link');
    // Atom link href
    if (!link) {
      const atomLink = block.match(/<link[^>]+href=["']([^"']+)["']/i);
      if (atomLink) link = atomLink[1];
    }
    if (!link) link = get('guid') || get('id');

    const description = stripHtml(
      get('description') || get('content:encoded') || get('summary') || get('content') || ''
    );
    const pubDate =
      get('pubDate') || get('dc:date') || get('published') || get('updated') || new Date().toUTCString();
    const source = stripHtml(get('source') || get('dc:creator') || '');
    const image = extractImage(block, get('description') || get('content:encoded') || '');

    if (title && link) {
      items.push({
        title,
        link: link.replace(/^<!\[CDATA\[|\]\]>$/g, '').trim(),
        description: description.slice(0, 600),
        pubDate,
        source,
        image,
      });
    }
  }
  return items;
}

async function fetchOneFeed(feed: (typeof RSS_FEEDS)[0]): Promise<GroundedArticle[]> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(feed.url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'TimeGovern/2.0 (+https://timegovern.com; free-news-aggregator)',
        Accept: 'application/rss+xml, application/atom+xml, application/xml, text/xml, */*',
      },
    });
    clearTimeout(timer);

    if (!res.ok) return [];
    const xml = await res.text();
    const rawItems = parseRssItems(xml, feed.max);

    return rawItems.map((item, idx) => {
      const category = guessCategory(item.title, feed.category);
      const summary = item.description || item.title;
      const ts = new Date(item.pubDate).getTime();
      return {
        id: `rss-${feed.publisher.replace(/\s/g, '')}-${Buffer.from(item.link).toString('base64').slice(0, 12)}-${idx}`,
        title: item.title,
        category,
        date: !Number.isNaN(ts)
          ? new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
          : new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        timeAgo: timeAgo(item.pubDate),
        author: item.source || feed.publisher,
        publisher: feed.publisher,
        readTime: '3 min read',
        featured: false,
        summary,
        content: summary,
        keyTakeaways: [`Source: ${feed.publisher}`, 'Free public RSS', 'Auto-updated'],
        imageUrl: item.image || categoryImage(category, idx),
        sourceUrl: item.link,
        verifiedGrounding: true,
        groundingSources: [{ title: feed.publisher, url: item.link }],
        pubTimestamp: Number.isNaN(ts) ? Date.now() - idx * 60000 : ts,
      } as GroundedArticle;
    });
  } catch (err) {
    console.warn(`RSS failed: ${feed.name}`, err);
    return [];
  }
}

function dedupeByTitle(articles: GroundedArticle[]): GroundedArticle[] {
  const seen = new Set<string>();
  return articles.filter((a) => {
    const key = a.title
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '')
      .slice(0, 60);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export async function fetchFreeLiveNews(options: {
  topic?: string;
  category?: string;
  forceRefresh?: boolean;
}): Promise<NewsResponsePayload> {
  const { topic, category, forceRefresh } = options;
  const cacheKey = `${topic || 'default'}_${category || 'all'}`;

  if (!forceRefresh && newsCache.has(cacheKey)) {
    const cached = newsCache.get(cacheKey)!;
    if (Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return cached.payload;
    }
  }

  const results = await Promise.all(RSS_FEEDS.map((f) => fetchOneFeed(f)));
  let articles = dedupeByTitle(results.flat());

  // Sort by real publish time (newest first)
  articles.sort((a, b) => (b.pubTimestamp || 0) - (a.pubTimestamp || 0));

  if (topic && topic.trim()) {
    const q = topic.toLowerCase();
    const filtered = articles.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        a.summary.toLowerCase().includes(q) ||
        a.publisher.toLowerCase().includes(q)
    );
    if (filtered.length > 0) articles = filtered;
  }

  if (category && category !== 'all') {
    const filtered = articles.filter((a) => a.category === category);
    if (filtered.length > 0) articles = filtered;
  }

  articles = articles.slice(0, 30);
  if (articles.length === 0) articles = FALLBACK_ARTICLES;
  if (articles[0]) articles[0].featured = true;

  const payload: NewsResponsePayload = {
    success: true,
    grounded: true,
    source: 'Free Live RSS v2 – Google News, BBC, Guardian, NPR, NASA, ESA',
    model: 'rss-multi-source-v2',
    queryTopic: topic || category || 'General',
    updated_at: new Date().toISOString(),
    search_queries: RSS_FEEDS.map((f) => f.name),
    grounding_sources: RSS_FEEDS.map((f) => ({ title: f.publisher, url: f.url })),
    articles,
  };

  newsCache.set(cacheKey, { timestamp: Date.now(), payload });
  return payload;
}

export async function handleNews(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const topic = url.searchParams.get('q') || url.searchParams.get('topic') || undefined;
  const category = url.searchParams.get('category') || undefined;
  const forceRefresh =
    url.searchParams.get('force') === 'true' || url.searchParams.get('refresh') === 'true';

  const payload = await fetchFreeLiveNews({ topic, category, forceRefresh });

  return new Response(JSON.stringify(payload, null, 2), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': forceRefresh ? 'no-cache' : 'public, max-age=20, s-maxage=45',
    },
  });
}

export const fetchGoogleSearchGroundedNews = fetchFreeLiveNews;
