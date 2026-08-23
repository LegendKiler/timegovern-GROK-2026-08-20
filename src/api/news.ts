/**
 * TimeGovern Free Live News v2
 * Multi-source public RSS – no API keys required
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
const CACHE_TTL_MS = 30 * 1000; // LIVE align with UI 30s refresh

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
    name: 'Guardian World',
    url: 'https://www.theguardian.com/world/rss',
    publisher: 'The Guardian',
    category: 'world' as const,
    max: 6,
  },
  {
    name: 'NPR News',
    url: 'https://feeds.npr.org/1001/rss.xml',
    publisher: 'NPR',
    category: 'world' as const,
    max: 6,
  },
  {
    name: 'NASA Breaking',
    url: 'https://www.nasa.gov/rss/dyn/breaking_news.rss',
    publisher: 'NASA',
    category: 'astronomy' as const,
    max: 5,
  },
];

function timeAgo(ts: number): string {
  const sec = Math.max(0, Math.floor((Date.now() - ts) / 1000));
  if (sec < 60) return `${sec}s ago`;
  if (sec < 3600) return `${Math.floor(sec / 60)}m ago`;
  if (sec < 86400) return `${Math.floor(sec / 3600)}h ago`;
  return `${Math.floor(sec / 86400)}d ago`;
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&/g, '&')
    .replace(/</g, '<')
    .replace(/>/g, '>')
    .replace(/"/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function parseRssItems(xml: string): Array<{ title: string; link: string; pubDate: string; description: string }> {
  const items: Array<{ title: string; link: string; pubDate: string; description: string }> = [];
  const itemRegex = /<item[\s\S]*?<\/item>/gi;
  const blocks = xml.match(itemRegex) || [];
  for (const block of blocks) {
    const title = (block.match(/<title><!\[CDATA\[([\s\S]*?)\]\]><\/title>/i) || block.match(/<title>([\s\S]*?)<\/title>/i) || [])[1] || '';
    const link = (block.match(/<link>([\s\S]*?)<\/link>/i) || [])[1] || '';
    const pubDate = (block.match(/<pubDate>([\s\S]*?)<\/pubDate>/i) || [])[1] || '';
    const description = (block.match(/<description><!\[CDATA\[([\s\S]*?)\]\]><\/description>/i) || block.match(/<description>([\s\S]*?)<\/description>/i) || [])[1] || '';
    if (title.trim()) {
      items.push({
        title: stripHtml(title),
        link: link.trim(),
        pubDate: pubDate.trim(),
        description: stripHtml(description).slice(0, 500),
      });
    }
  }
  return items;
}

function fallbackArticles(): GroundedArticle[] {
  return [
    {
      id: 'fallback-1',
      title: 'TimeGovern news feeds temporarily offline — retrying',
      category: 'technology',
      date: new Date().toISOString().slice(0, 10),
      timeAgo: 'just now',
      author: 'TimeGovern',
      readTime: '1 min',
      summary: 'Live RSS feeds are temporarily unreachable. The system will retry automatically.',
      content: 'TimeGovern aggregates free public RSS from Google News, BBC, Guardian, NPR, NASA and more. No paid API keys are required.',
      keyTakeaways: ['Free multi-source RSS', 'Auto-refresh every 30s', 'No paid APIs'],
      imageUrl: '',
      sourceUrl: 'https://timegovern.com',
      publisher: 'TimeGovern',
      pubTimestamp: Date.now(),
    },
  ];
}

async function fetchOneFeed(feed: (typeof RSS_FEEDS)[0]): Promise<GroundedArticle[]> {
  try {
    const res = await fetch(feed.url, {
      headers: { 'User-Agent': 'TimeGovernNewsBot/2.0' },
      signal: AbortSignal.timeout(12000),
    });
    if (!res.ok) throw new Error(String(res.status));
    const xml = await res.text();
    const items = parseRssItems(xml).slice(0, feed.max);
    return items.map((it, i) => {
      const ts = it.pubDate ? Date.parse(it.pubDate) || Date.now() : Date.now();
      return {
        id: `${feed.publisher}-${i}-${ts}`,
        title: it.title,
        category: feed.category,
        date: new Date(ts).toISOString().slice(0, 10),
        timeAgo: timeAgo(ts),
        author: feed.publisher,
        readTime: '2 min',
        summary: it.description || it.title,
        content: it.description || it.title,
        keyTakeaways: [`Source: ${feed.publisher}`, 'Free public RSS', 'Auto-updated'],
        imageUrl: '',
        sourceUrl: it.link || feed.url,
        publisher: feed.publisher,
        pubTimestamp: ts,
      };
    });
  } catch (err) {
    console.warn(`RSS failed: ${feed.name}`, err);
    return [];
  }
}

export async function fetchGoogleSearchGroundedNews(opts?: {
  category?: string;
  q?: string;
  force?: boolean;
}): Promise<NewsResponsePayload> {
  const cacheKey = `${opts?.category || 'all'}|${opts?.q || ''}`;
  if (!opts?.force) {
    const cached = newsCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return cached.payload;
    }
  }

  const results = await Promise.all(RSS_FEEDS.map((f) => fetchOneFeed(f)));
  let articles = results.flat().sort((a, b) => (b.pubTimestamp || 0) - (a.pubTimestamp || 0));

  if (opts?.category && opts.category !== 'all') {
    articles = articles.filter((a) => a.category === opts.category);
  }
  if (opts?.q && opts.q.trim()) {
    const q = opts.q.toLowerCase();
    articles = articles.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        a.summary.toLowerCase().includes(q) ||
        a.content.toLowerCase().includes(q)
    );
  }

  if (articles.length === 0) articles = fallbackArticles();

  const payload: NewsResponsePayload = {
    success: true,
    grounded: true,
    source: 'Free Live RSS v2 – Google News, BBC, Guardian, NPR, NASA',
    model: 'rss-multi-source',
    queryTopic: opts?.q || undefined,
    updated_at: new Date().toISOString(),
    search_queries: RSS_FEEDS.map((f) => f.name),
    grounding_sources: RSS_FEEDS.map((f) => ({ title: f.publisher, url: f.url })),
    articles: articles.slice(0, 40),
  };

  newsCache.set(cacheKey, { timestamp: Date.now(), payload });
  return payload;
}

export async function handleNews(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const category = url.searchParams.get('category') || undefined;
  const q = url.searchParams.get('q') || undefined;
  const force = url.searchParams.get('force') === 'true';
  const payload = await fetchGoogleSearchGroundedNews({ category, q, force });
  return new Response(JSON.stringify(payload), {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=30',
    },
  });
}
