import React, { useState, useEffect } from 'react';
import {
  Newspaper,
  Calendar,
  ArrowRight,
  Tag,
  Globe,
  Search,
  RefreshCw,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  Copy,
  Check,
  Compass,
  Cpu,
  Clock,
  Atom,
  Orbit,
  AlertCircle
} from 'lucide-react';
import { GroundedArticle, NewsResponsePayload } from '../api/news';

function decodeEntities(s: string | undefined | null): string {
  if (!s) return '';
  let out = String(s);
  out = out.replace(/<[^>]+>/g, ' ');
  for (let i = 0; i < 3; i++) {
    out = out
      .replace(/&nbsp;/gi, ' ')
      .replace(/&/gi, '&')
      .replace(/"/gi, '"')
      .replace(/&#0*39;/g, "'")
      .replace(/&#x0*27;/gi, "'")
      .replace(/'/gi, "'")
      .replace(/</gi, '<')
      .replace(/>/gi, '>')
      .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
      .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCharCode(parseInt(h, 16)));
  }
  return out.replace(/\s+/g, ' ').trim();
}

function sanitizeArticle(a: GroundedArticle): GroundedArticle {
  return {
    ...a,
    title: decodeEntities(a.title),
    summary: decodeEntities(a.summary),
    content: decodeEntities(a.content),
    author: decodeEntities(a.author),
    publisher: decodeEntities((a as any).publisher),
  };
}

export const NewsPillar: React.FC = () => {
  const [articles, setArticles] = useState<GroundedArticle[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [customTopicInput, setCustomTopicInput] = useState<string>('');
  const [activeTopic, setActiveTopic] = useState<string>('');
  const [activeArticle, setActiveArticle] = useState<GroundedArticle | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>('Just now');
  const [isGrounded, setIsGrounded] = useState<boolean>(true);
  const [groundingQueries, setGroundingQueries] = useState<string[]>([]);
  const [groundingSources, setGroundingSources] = useState<Array<{ title: string; url: string }>>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeModel, setActiveModel] = useState<string>('rss-multi-source');
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [headlineCount, setHeadlineCount] = useState(0);

  const fetchNewsFeed = async (options?: { category?: string; topic?: string; force?: boolean }) => {
    setIsRefreshing(true);
    try {
      const params = new URLSearchParams();
      if (options?.category && options.category !== 'all') params.set('category', options.category);
      if (options?.topic && options.topic.trim()) params.set('q', options.topic.trim());
      if (options?.force) params.set('force', 'true');

      const res = await fetch(`/api/news?${params.toString()}`);
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const data: NewsResponsePayload = await res.json();

      if (data.success && Array.isArray(data.articles) && data.articles.length > 0) {
        const cleaned = data.articles.map(sanitizeArticle);
        const rank = (c: string) =>
          c === 'leap_seconds' || c === 'dst' || c === 'astronomy' || c === 'timezones' || c === 'metrology'
            ? 0
            : c === 'technology'
              ? 1
              : 2;
        cleaned.sort((a, b) => rank(a.category) - rank(b.category));
        setArticles(cleaned);
        setHeadlineCount(cleaned.length);
        setFetchError(null);
        setIsGrounded(!!data.grounded);
        if (data.model) setActiveModel(data.model);
        if (data.search_queries) setGroundingQueries(data.search_queries);
        if (data.grounding_sources) setGroundingSources(data.grounding_sources);
        setLastSyncTime(
          new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
        );
      } else if (data.success && Array.isArray(data.articles) && data.articles.length === 0) {
        setFetchError('No new headlines from feeds right now. Showing last good results if any.');
        setLastSyncTime(
          new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
        );
      } else {
        setFetchError('News feed returned an unexpected response. Keeping previous headlines.');
      }
    } catch (err: any) {
      console.warn('Free RSS news fetch fallback:', err);
      setFetchError(
        err?.message
          ? `Sync failed: ${err.message}. Showing last good headlines.`
          : 'Sync failed. Showing last good headlines.'
      );
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchNewsFeed();
    const tick = () => {
      if (typeof document !== 'undefined' && document.visibilityState === 'hidden') return;
      fetchNewsFeed({ category: selectedCategory, topic: activeTopic });
    };
    const interval = setInterval(tick, 30000);
    const onVis = () => {
      if (document.visibilityState === 'visible') {
        fetchNewsFeed({ category: selectedCategory, topic: activeTopic });
      }
    };
    document.addEventListener('visibilitychange', onVis);
    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', onVis);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat);
    fetchNewsFeed({ category: cat, topic: activeTopic, force: true });
  };

  const handleCustomTopicSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = customTopicInput.trim();
    if (!q) return;
    setActiveTopic(q);
    setSearchQuery(q);
    fetchNewsFeed({ topic: q, category: selectedCategory, force: true });
  };

  const handleQuickTopicClick = (topicText: string) => {
    setCustomTopicInput(topicText);
    setActiveTopic(topicText);
    setSearchQuery(topicText);
    fetchNewsFeed({ topic: topicText, category: selectedCategory, force: true });
  };

  const handleClearTopic = () => {
    setCustomTopicInput('');
    setActiveTopic('');
    setSearchQuery('');
    fetchNewsFeed({ category: selectedCategory, force: true });
  };

  const copyArticleCitation = (article: GroundedArticle) => {
    const citation = `"${article.title}". ${article.publisher || article.author} (${article.date}). Retrieved via TimeGovern Free Live News: ${article.sourceUrl}`;
    navigator.clipboard.writeText(citation);
    setCopiedId(article.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const filteredArticles = articles.filter((art) => {
    const matchesCat = selectedCategory === 'all' || art.category === selectedCategory;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      art.title.toLowerCase().includes(q) ||
      art.summary.toLowerCase().includes(q) ||
      art.content.toLowerCase().includes(q) ||
      art.author.toLowerCase().includes(q);
    return matchesCat && matchesSearch;
  });

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case 'leap_seconds':
        return { label: 'Leap Seconds & Metrology', icon: Clock, color: 'bg-amber-600/10 text-amber-700 dark:text-amber-300 border-amber-500/30' };
      case 'dst':
        return { label: 'Daylight Saving', icon: Compass, color: 'bg-emerald-600/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30' };
      case 'astronomy':
        return { label: 'Astronomy & Space', icon: Orbit, color: 'bg-purple-600/10 text-purple-700 dark:text-purple-300 border-purple-500/30' };
      case 'timezones':
        return { label: 'Time Zones & IANA', icon: Globe, color: 'bg-blue-600/10 text-blue-700 dark:text-blue-300 border-blue-500/30' };
      case 'technology':
        return { label: 'Quantum Tech', icon: Cpu, color: 'bg-cyan-600/10 text-cyan-700 dark:text-cyan-300 border-cyan-500/30' };
      case 'world':
        return { label: 'World News', icon: Globe, color: 'bg-sky-600/10 text-sky-700 dark:text-sky-300 border-sky-500/30' };
      default:
        return { label: 'SI Standards', icon: Atom, color: 'bg-indigo-600/10 text-indigo-700 dark:text-indigo-300 border-indigo-500/30' };
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg text-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="font-bold text-cyan-300 text-sm tracking-wide flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              Free Live News
            </span>
            {isGrounded && (
              <span className="inline-flex items-center gap-1.5 bg-emerald-500/20 text-emerald-300 border border-emerald-400/50 text-[11px] font-bold px-2.5 py-1 rounded-full">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
                </span>
                <span className="font-black tracking-wide">LIVE</span>
              </span>
            )}
            {headlineCount > 0 && (
              <span className="text-[11px] text-slate-300 font-semibold tabular-nums">{headlineCount} stories</span>
            )}
          </div>
          <p className="text-xs text-slate-300">
            Updates about every 30 seconds while this section is open. Tap a story to read the original article.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <div className="text-right hidden sm:block" title="When headlines were last refreshed">
            <span className="text-[10px] text-slate-500 block">Updated</span>
            <span className="text-xs font-medium text-slate-300 tabular-nums">{lastSyncTime}</span>
          </div>
          <button
            type="button"
            onClick={() => fetchNewsFeed({ category: selectedCategory, topic: activeTopic, force: true })}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold text-xs rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Updating…' : 'Force Live Sync'}</span>
          </button>
        </div>
      </div>

      {articles.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-emerald-500/30 bg-slate-950/80">
          <style>{`
            @keyframes tg-news-marquee {
              0% { transform: translateX(0); }
              100% { transform: translateX(-50%); }
            }
            .tg-news-marquee-track {
              display: flex;
              width: max-content;
              animation: tg-news-marquee 45s linear infinite;
            }
            .tg-news-marquee-track:hover {
              animation-play-state: paused;
            }
            @media (prefers-reduced-motion: reduce) {
              .tg-news-marquee-track { animation: none; }
            }
          `}</style>
          <div className="flex items-center gap-3 px-3 py-2.5">
            <span className="shrink-0 inline-flex items-center gap-1.5 text-[11px] font-extrabold tracking-wider text-emerald-400 uppercase">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-black">LIVE</span>
            </span>
            <div className="min-w-0 flex-1 overflow-hidden">
              <div className="tg-news-marquee-track gap-8">
                {[...articles.slice(0, 14), ...articles.slice(0, 14)].map((a, i) => (
                  <button
                    key={`${a.id}-tick-${i}`}
                    type="button"
                    onClick={() => a.sourceUrl && window.open(a.sourceUrl, '_blank', 'noopener,noreferrer')}
                    className="text-[11px] text-slate-300 hover:text-cyan-300 transition-colors cursor-pointer shrink-0"
                  >
                    <span className="text-slate-500 font-semibold">{a.publisher || a.author}</span>
                    <span className="mx-1.5 text-slate-600">·</span>
                    {a.title}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm text-slate-900 dark:text-slate-100 space-y-5">
        <div className="flex flex-col gap-4">
          <div>
            <h1 className="text-2xl font-bold font-display text-slate-900 dark:text-white flex items-center gap-2.5">
              <Newspaper className="w-6 h-6 text-blue-600 dark:text-cyan-400" />
              Live News — Time, Astronomy & World
            </h1>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
              DST, leap seconds, astronomy, time zones & world headlines.
            </p>
          </div>
          <form onSubmit={handleCustomTopicSearch} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                value={customTopicInput}
                onChange={(e) => {
                  setCustomTopicInput(e.target.value);
                  setSearchQuery(e.target.value);
                }}
                placeholder="Search live headlines (e.g. eclipse, leap second, time zone)…"
                className="w-full bg-slate-50 dark:bg-slate-800/90 border border-slate-300 dark:border-slate-700 rounded-xl pl-10 pr-3 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/40"
                aria-label="Search live headlines"
              />
            </div>
            <button
              type="submit"
              disabled={isRefreshing || !customTopicInput.trim()}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold text-xs rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center justify-center gap-1.5 shrink-0"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Search feed</span>
            </button>
            {(customTopicInput || searchQuery || activeTopic) && (
              <button type="button" onClick={handleClearTopic} className="px-3 py-2.5 text-xs font-semibold text-rose-500 hover:bg-rose-500/10 rounded-xl cursor-pointer shrink-0">
                Clear
              </button>
            )}
          </form>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 -mt-2">
            Typing filters stories on this page. <span className="font-semibold text-slate-600 dark:text-slate-300">Search feed</span> pulls matching topics from live sources.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100 dark:border-slate-800 text-xs">
          <span className="text-slate-500 dark:text-slate-400 text-[11px] font-semibold flex items-center gap-1">
            <Tag className="w-3 h-3" /> Quick topics:
          </span>
          {['leap second', 'daylight saving', 'astronomy', 'time zone', 'eclipse', 'atomic clock'].map((topicChip) => (
            <button
              key={topicChip}
              type="button"
              onClick={() => handleQuickTopicClick(topicChip)}
              className={`px-2.5 py-1 rounded-lg border text-[11px] transition-colors cursor-pointer ${
                activeTopic === topicChip
                  ? 'bg-blue-600 text-white border-blue-600 font-semibold'
                  : 'bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              {topicChip}
            </button>
          ))}
        </div>

        {fetchError && (
          <div className="flex items-start gap-2 rounded-xl border border-amber-500/40 bg-amber-500/10 px-3.5 py-2.5 text-xs text-amber-900 dark:text-amber-100">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold">Sync notice</p>
              <p className="text-amber-800/90 dark:text-amber-100/80">{fetchError}</p>
            </div>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-1.5 text-xs font-semibold pt-2">
          {[
            { id: 'all', label: 'All News' },
            { id: 'world', label: 'World' },
            { id: 'astronomy', label: 'Astronomy' },
            { id: 'timezones', label: 'Time Zones' },
            { id: 'dst', label: 'DST' },
            { id: 'leap_seconds', label: 'Leap Seconds' },
            { id: 'technology', label: 'Tech' },
          ].map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => handleCategoryChange(cat.id)}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {isRefreshing && articles.length === 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4 animate-pulse">
              <div className="h-44 bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
              <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/3"></div>
              <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredArticles.map((article) => {
          const badge = getCategoryBadge(article.category);
          const IconComp = badge.icon;
          const openArticle = () => {
            if (article.sourceUrl) window.open(article.sourceUrl, '_blank', 'noopener,noreferrer');
          };
          const hasImage = !!(article.imageUrl && String(article.imageUrl).trim());
          return (
            <article
              key={article.id}
              role="link"
              tabIndex={0}
              onClick={openArticle}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  openArticle();
                }
              }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between group cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500"
            >
              <div>
                <div className="relative h-44 sm:h-52 overflow-hidden bg-gradient-to-br from-slate-800 via-indigo-950 to-slate-900">
                  {hasImage ? (
                    <img
                      src={article.imageUrl}
                      alt=""
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center opacity-40">
                      <Newspaper className="w-14 h-14 text-slate-400" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent pointer-events-none" />
                  <div className="absolute top-3 left-3 z-10">
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border shadow-sm flex items-center gap-1 backdrop-blur-md ${badge.color}`}>
                      <IconComp className="w-3 h-3" />
                      {badge.label}
                    </span>
                  </div>
                  <div className="absolute top-3 right-3 z-10">
                    <span className="bg-slate-900/80 backdrop-blur-md text-cyan-300 text-[10px] font-mono px-2 py-0.5 rounded border border-cyan-500/30">
                      {article.timeAgo}
                    </span>
                  </div>
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[11px] text-slate-200 font-medium z-10">
                    <span className="truncate font-semibold">{article.publisher || article.author || 'Source'}</span>
                    <span className="font-mono text-[10px] text-slate-400 shrink-0">{article.readTime}</span>
                  </div>
                </div>
                <div className="p-5 space-y-3">
                  <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{article.date}</span>
                    <span>•</span>
                    <span className="text-blue-600 dark:text-cyan-400 font-semibold">{article.author}</span>
                  </div>
                  <h2 className="text-lg font-bold font-display text-slate-900 dark:text-white leading-snug group-hover:text-blue-600 dark:group-hover:text-cyan-400 transition-colors">
                    {article.title}
                  </h2>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-3">{article.summary}</p>
                </div>
              </div>
              <div className="px-5 pb-5 pt-2 flex items-center justify-between border-t border-slate-100 dark:border-slate-800/80 text-xs">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    copyArticleCitation(article);
                  }}
                  className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 text-[11px] font-medium flex items-center gap-1 cursor-pointer"
                >
                  {copiedId === article.id ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-500" />
                      <span className="text-emerald-500 font-semibold">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Cite</span>
                    </>
                  )}
                </button>
                <div className="flex items-center gap-3">
                  {article.sourceUrl && (
                    <a
                      href={article.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="text-slate-500 hover:text-blue-600 dark:hover:text-cyan-400 font-medium flex items-center gap-1 text-[11px]"
                    >
                      <span>Source</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                  <span className="text-blue-600 dark:text-cyan-400 font-bold flex items-center gap-1 text-[11px]">
                    <span>Read</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {filteredArticles.length === 0 && !isRefreshing && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-10 text-center space-y-3">
          <Newspaper className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">
            {articles.length === 0 ? 'No headlines loaded yet' : 'No Articles Match Filters'}
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            {articles.length === 0
              ? 'Feeds may be slow. Click Force Live Sync to retry.'
              : 'No headlines match your search. Clear filters or try All News.'}
          </p>
          <button type="button" onClick={handleClearTopic} className="px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-xl cursor-pointer">
            Clear search
          </button>
        </div>
      )}

      {activeArticle && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-3xl w-full p-6 space-y-5 relative max-h-[90vh] overflow-y-auto">
            <button type="button" onClick={() => setActiveArticle(null)} className="absolute top-4 right-4 text-slate-400 p-2">
              ✕
            </button>
            <h2 className="text-2xl font-bold pr-8">{activeArticle.title}</h2>
            <p className="text-sm text-slate-600 dark:text-slate-300">{activeArticle.summary}</p>
            {activeArticle.sourceUrl && (
              <a href={activeArticle.sourceUrl} target="_blank" rel="noopener noreferrer" className="inline-block px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl">
                Open Source
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
