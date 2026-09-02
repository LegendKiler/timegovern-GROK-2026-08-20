/**
 * TimeGovern Free Live News v2
 * Multi-source public RSS – no API keys required
 * Categories: world, astronomy, timezones, dst, leap_seconds, technology, metrology
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
const CACHE_TTL_MS = 30 * 1000;

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
    name: 'Google News – DST',
    url: 'https://news.google.com/rss/search?q=%22daylight+saving%22+OR+%22daylight+savings%22+OR+%22summer+time%22+OR+DST+clocks&hl=en-US&gl=US&ceid=US:en',
    publisher: 'Google News DST',
    category: 'dst' as const,
    max: 8,
  },
  {
    name: 'Google News – Leap second / UTC',
    url: 'https://news.google.com/rss/search?q=%22leap+second%22+OR+%22atomic+clock%22+OR+BIPM+OR+metrology+OR+%22coordinated+universal+time%22&hl=en-US&gl=US&ceid=US:en',
    publisher: 'Google News Time',
    category: 'leap_seconds' as const,
    max: 6,
  },
  {
    name: 'Google News – Technology',
    url: 'https://news.google.com/rss/search?q=technology+OR+software+OR+AI+OR+quantum+OR+chip+OR+semiconductor&hl=en-US&gl=US&ceid=US:en',
    publisher: 'Google News Tech',
    category: 'technology' as const,
    max: 8,
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
    max: 6,
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
    max: 5,
  },
  {
    name: 'NPR News',
    url: 'https://feeds.npr.org/1001/rss.xml',
    publisher: 'NPR',
    category: 'world' as const,
    max: 5,
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
    .replace(/&nbsp;/gi, ' ')
    .replace(/&/gi, '&')
    .replace(/"/gi, '"')
    .replace(/&#0*39;/g, "'")
    .replace(/'/gi, "'")
    .replace(/</gi, '<')
    .replace(/>/gi, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Pull a usable image URL from a single RSS <item> block */
function extractImageFromItem(block: string): string {
  const candidates: string[] = [];
  const push = (u?: string) => {
    if (!u) return;
    let s = u.trim().replace(/^['"]|['"]$/g, '');
    if (!s) return;
    if (s.startsWith('//')) s = 'https:' + s;
    if (!/^https?:\/\//i.test(s)) return;
    if (/1x1|pixel|spacer|favicon|\.svg(\?|$)/i.test(s)) return;
    candidates.push(s);
  };

  for (const m of block.matchAll(/<enclosure[^>]*url=["']([^"']+)["'][^>]*>/gi)) {
    const tag = m[0];
    if (/type=["']image/i.test(tag) || /\.(jpe?g|png|webp|gif)(\?|$)/i.test(m[1])) push(m[1]);
  }
  for (const m of block.matchAll(/<media:(?:content|thumbnail)[^>]*url=["']([^"']+)["'][^>]*\/?>/gi)) {
    push(m[1]);
  }
  const encoded =
    (block.match(/<content:encoded[^>]*>[\s\S]*?<!\[CDATA\[([\s\S]*?)\]\]>/i) ||
      block.match(/<content:encoded[^>]*>([\s\S]*?)<\/content:encoded>/i) ||
      [])[1] || '';
  const descRaw =
    (block.match(/<description[^>]*>[\s\S]*?<!\[CDATA\[([\s\S]*?)\]\]>/i) ||
      block.match(/<description[^>]*>([\s\S]*?)<\/description>/i) ||
      [])[1] || '';
  const htmlBlob = `${encoded}\n${descRaw}`;
  for (const m of htmlBlob.matchAll(/<img[^>]+src=["']([^"']+)["']/gi)) {
    push(m[1]);
  }

  return candidates[0] || '';
}

function parseRssItems(
  xml: string
): Array<{ title: string; link: string; pubDate: string; description: string; imageUrl: string }> {
  const items: Array<{ title: string; link: string; pubDate: string; description: string; imageUrl: string }> =
    [];
  const blocks = xml.match(/<item[\s\S]*?<\/item>/gi) || [];
  for (const block of blocks) {
    const title =
      (block.match(/<title><!\[CDATA\[([\s\S]*?)\]\]><\/title>/i) ||
        block.match(/<title>([\s\S]*?)<\/title>/i) ||
        [])[1] || '';
    const link =
      (block.match(/<link><!\[CDATA\[([\s\S]*?)\]\]><\/link>/i) ||
        block.match(/<link>([\s\S]*?)<\/link>/i) ||
        [])[1] || '';
    const pubDate = (block.match(/<pubDate>([\s\S]*?)<\/pubDate>/i) || [])[1] || '';
    const description =
      (block.match(/<description><!\[CDATA\[([\s\S]*?)\]\]><\/description>/i) ||
        block.match(/<description>([\s\S]*?)<\/description>/i) ||
        [])[1] || '';
    if (title.trim()) {
      items.push({
        title: stripHtml(title),
        link: link.trim(),
        pubDate: pubDate.trim(),
        description: stripHtml(description).slice(0, 500),
        imageUrl: extractImageFromItem(block),
      });
    }
  }
  return items;
}

function classifyArticle(
  title: string,
  summary: string,
  feedCategory: GroundedArticle['category']
): GroundedArticle['category'] {
  const text = `${title} ${summary}`.toLowerCase();
  if (/leap second|leap.?second|atomic clock|bipm|\btai\b|utc adjustment|iirs/.test(text)) return 'leap_seconds';
  if (/daylight saving|daylight-saving|\bdst\b|summer time|winter time|spring forward|fall back|clocks? (forward|back)/.test(text))
    return 'dst';
  if (/quantum|software|\bchip\b|\bai\b|artificial intelligence|cyber|semiconductor|startup|internet|\b5g\b|cloud computing|technology/.test(text))
    return 'technology';
  if (/metrolog|si unit|kilogram|second definition|\bnist\b/.test(text)) return 'metrology';
  if (/eclipse|nasa|space|astronomy|\bmoon\b|\bmars\b|satellite|\biss\b|astronaut/.test(text)) return 'astronomy';
  if (/time zone|timezone|iana|utc offset|\bzulu\b/.test(text)) return 'timezones';
  return feedCategory;
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
      content:
        'TimeGovern aggregates free public RSS from Google News, BBC, Guardian, NPR, NASA. DST, leap-second and tech feeds included.',
      keyTakeaways: ['Free multi-source RSS', 'Auto-refresh every 30s', 'No paid APIs'],
      imageUrl: '',
      sourceUrl: 'https://timegovern.com',
      publisher: 'TimeGovern',
      pubTimestamp: Date.now(),
    },
  ];
}

async function fetchWithTimeout(url: string, ms = 12000): Promise<Response> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), ms);
  try {
    return await fetch(url, {
      headers: { 'User-Agent': 'TimeGovernNewsBot/2.0' },
      signal: ctrl.signal,
    });
  } finally {
    clearTimeout(timer);
  }
}

async function fetchOneFeed(feed: (typeof RSS_FEEDS)[0]): Promise<GroundedArticle[]> {
  const urls = [feed.url, `https://api.allorigins.win/raw?url=${encodeURIComponent(feed.url)}`];
  for (const url of urls) {
    try {
      const res = await fetchWithTimeout(url, 14000);
      if (!res.ok) continue;
      const xml = await res.text();
      if (!xml.includes('<item') && !xml.includes('<entry')) continue;
      const items = parseRssItems(xml).slice(0, feed.max);
      if (items.length === 0) continue;
      return items.map((it, i) => {
        const ts = it.pubDate ? Date.parse(it.pubDate) || Date.now() : Date.now();
        return {
          id: `${feed.publisher}-${i}-${ts}`,
          title: it.title,
          category: classifyArticle(it.title, it.description || '', feed.category),
          date: new Date(ts).toISOString().slice(0, 10),
          timeAgo: timeAgo(ts),
          author: feed.publisher,
          readTime: '2 min',
          summary: it.description || it.title,
          content: it.description || it.title,
          keyTakeaways: [`Source: ${feed.publisher}`, 'Free public RSS', 'Auto-updated'],
          imageUrl: it.imageUrl || '',
          sourceUrl: it.link || feed.url,
          publisher: feed.publisher,
          pubTimestamp: ts,
        };
      });
    } catch (err) {
      console.warn(`RSS try failed: ${feed.name}`, err);
    }
  }
  return [];
}

export async function fetchGoogleSearchGroundedNews(opts?: {
  category?: string;
  q?: string;
  topic?: string;
  force?: boolean;
  forceRefresh?: boolean;
}): Promise<NewsResponsePayload> {
  const q = (opts?.q || opts?.topic || '').trim();
  const force = !!(opts?.force || opts?.forceRefresh);
  const cacheKey = `${opts?.category || 'all'}|${q}`;
  if (!force) {
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
  if (q) {
    const ql = q.toLowerCase();
    articles = articles.filter(
      (a) =>
        a.title.toLowerCase().includes(ql) ||
        a.summary.toLowerCase().includes(ql) ||
        a.content.toLowerCase().includes(ql)
    );
  }

  if (articles.length === 0) {
    articles = fallbackArticles();
  }

  const payload: NewsResponsePayload = {
    success: true,
    grounded: true,
    source: 'Free Live RSS v2 – Google News, BBC, Guardian, NPR, NASA + DST/Leap/Tech',
    model: 'rss-multi-source',
    queryTopic: q || undefined,
    updated_at: new Date().toISOString(),
    search_queries: RSS_FEEDS.map((f) => f.name),
    grounding_sources: RSS_FEEDS.map((f) => ({ title: f.publisher, url: f.url })),
    articles: articles.slice(0, 50),
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
