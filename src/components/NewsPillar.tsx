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
  Radio, 
  Sparkles, 
  Copy, 
  Check, 
  Compass, 
  Cpu, 
  Clock, 
  Atom, 
  Orbit
} from 'lucide-react';
import { GroundedArticle, NewsResponsePayload } from '../api/news';

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

  const fetchNewsFeed = async (options?: { category?: string; topic?: string; force?: boolean }) => {
    setIsRefreshing(true);
    try {
      const params = new URLSearchParams();
      if (options?.category && options.category !== 'all') {
        params.set('category', options.category);
      }
      if (options?.topic && options.topic.trim()) {
        params.set('q', options.topic.trim());
      }
      if (options?.force) {
        params.set('force', 'true');
      }

      const res = await fetch(`/api/news?${params.toString()}`);
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const data: NewsResponsePayload = await res.json();
      
      if (data.success && Array.isArray(data.articles)) {
        setArticles(data.articles);
        setIsGrounded(data.grounded);
        if (data.model) setActiveModel(data.model);
        if (data.search_queries) setGroundingQueries(data.search_queries);
        if (data.grounding_sources) setGroundingSources(data.grounding_sources);
        setLastSyncTime(new Date().toLocaleTimeString());
      }
    } catch (err) {
      console.warn('Free RSS news fetch fallback:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchNewsFeed();
    // Auto-refresh every 60 seconds for live feel
    const interval = setInterval(() => {
      fetchNewsFeed({ category: selectedCategory, topic: activeTopic });
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat);
    fetchNewsFeed({ category: cat, topic: activeTopic, force: true });
  };

  const handleCustomTopicSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTopicInput.trim()) return;
    setActiveTopic(customTopicInput.trim());
    fetchNewsFeed({ topic: customTopicInput.trim(), category: selectedCategory, force: true });
  };

  const handleQuickTopicClick = (topicText: string) => {
    setCustomTopicInput(topicText);
    setActiveTopic(topicText);
    fetchNewsFeed({ topic: topicText, category: selectedCategory, force: true });
  };

  const handleClearTopic = () => {
    setCustomTopicInput('');
    setActiveTopic('');
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
    const matchesSearch = 
      art.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      art.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.author.toLowerCase().includes(searchQuery.toLowerCase());
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
      case 'metrology':
      default:
        return { label: 'SI Standards', icon: Atom, color: 'bg-indigo-600/10 text-indigo-700 dark:text-indigo-300 border-indigo-500/30' };
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Live Free RSS Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg text-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="font-bold text-cyan-300 text-sm tracking-wide flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              Free Live News (Multi-Source RSS)
            </span>
            <span className="bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 text-[10px] font-mono px-2 py-0.5 rounded-full font-bold">
              {activeModel}
            </span>
            {isGrounded && (
              <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 text-[10px] font-mono px-2 py-0.5 rounded-full flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Live RSS Active
              </span>
            )}
          </div>
          <p className="text-xs text-slate-300">
            Free public feeds: Google News, BBC, The Guardian, NPR — auto-refreshes every 60 seconds. No paid API keys.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <div className="text-right hidden sm:block">
            <span className="text-[10px] text-slate-400 block font-mono">Last Sync</span>
            <span className="text-xs font-semibold text-slate-200">{lastSyncTime}</span>
          </div>

          <button
            onClick={() => fetchNewsFeed({ category: selectedCategory, topic: activeTopic, force: true })}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold text-xs rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Fetching RSS...' : 'Force Live Sync'}</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm text-slate-900 dark:text-slate-100 space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold font-display text-slate-900 dark:text-white flex items-center gap-2.5">
              <Newspaper className="w-6 h-6 text-blue-600 dark:text-cyan-400" />
              Live News — Time, Astronomy & World
            </h1>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
              Headlines from free public RSS sources. Filter by topic or category.
            </p>
          </div>

          <form onSubmit={handleCustomTopicSearch} className="flex items-center gap-2 w-full lg:max-w-md">
            <div className="relative flex-1">
              <Sparkles className="w-4 h-4 absolute left-3 top-2.5 text-cyan-600 dark:text-cyan-400" />
              <input
                type="text"
                value={customTopicInput}
                onChange={(e) => setCustomTopicInput(e.target.value)}
                placeholder="Filter topic (e.g. leap second, eclipse)..."
                className="w-full bg-slate-50 dark:bg-slate-800/90 border border-slate-300 dark:border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500"
              />
            </div>
            <button
              type="submit"
              disabled={isRefreshing || !customTopicInput.trim()}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold text-xs rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Search</span>
            </button>
          </form>
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100 dark:border-slate-800 text-xs">
          <span className="text-slate-500 dark:text-slate-400 text-[11px] font-semibold flex items-center gap-1">
            <Tag className="w-3 h-3" /> Quick topics:
          </span>
          {[
            'leap second',
            'daylight saving',
            'astronomy',
            'time zone',
            'eclipse',
            'atomic clock'
          ].map((topicChip) => (
            <button
              key={topicChip}
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
          {activeTopic && (
            <button
              onClick={handleClearTopic}
              className="text-[11px] text-rose-500 hover:underline font-semibold ml-1 cursor-pointer"
            >
              Clear (✕)
            </button>
          )}
        </div>

        {groundingQueries.length > 0 && (
          <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 rounded-xl p-3.5 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-cyan-500 shrink-0" />
              <div className="space-y-0.5">
                <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider block">
                  Active free sources:
                </span>
                <span className="font-mono text-slate-800 dark:text-slate-200 text-[11px]">
                  {groundingQueries.join(' • ')}
                </span>
              </div>
            </div>
            {groundingSources.length > 0 && (
              <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                <span className="font-bold text-slate-700 dark:text-slate-200">{groundingSources.length}</span> sources
              </div>
            )}
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
          <div className="flex flex-wrap items-center gap-1.5 text-xs font-semibold">
            {[
              { id: 'all', label: 'All News' },
              { id: 'world', label: 'World' },
              { id: 'astronomy', label: 'Astronomy' },
              { id: 'timezones', label: 'Time Zones' },
              { id: 'dst', label: 'DST' },
              { id: 'leap_seconds', label: 'Leap Seconds' },
              { id: 'technology', label: 'Tech' }
            ].map((cat) => (
              <button
                key={cat.id}
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

          <div className="relative max-w-xs w-full">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter headlines..."
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {isRefreshing && articles.length === 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4 animate-pulse">
              <div className="h-44 bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
              <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/3"></div>
              <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-3/4"></div>
              <div className="h-16 bg-slate-200 dark:bg-slate-800 rounded"></div>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredArticles.map((article) => {
          const badge = getCategoryBadge(article.category);
          const IconComp = badge.icon;

          return (
            <div
              key={article.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="relative h-52 overflow-hidden bg-slate-950">
                  <img
                    src={article.imageUrl}
                    alt={article.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1504711434719-226ed3222c1d?auto=format&fit=crop&w=1200&q=80';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent"></div>

                  <div className="absolute top-3 left-3 flex items-center gap-1.5">
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border shadow-sm flex items-center gap-1 backdrop-blur-md ${badge.color}`}>
                      <IconComp className="w-3 h-3" />
                      {badge.label}
                    </span>
                    {article.featured && (
                      <span className="bg-amber-500 text-slate-950 text-[10px] font-extrabold px-2 py-0.5 rounded-full shadow-sm">
                        Featured
                      </span>
                    )}
                  </div>

                  <div className="absolute top-3 right-3">
                    <span className="bg-slate-900/80 backdrop-blur-md text-cyan-300 text-[10px] font-mono px-2 py-0.5 rounded border border-cyan-500/30">
                      {article.timeAgo}
                    </span>
                  </div>

                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[11px] text-slate-300 font-medium">
                    <span className="truncate">{article.publisher || article.author}</span>
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

                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-3">
                    {article.summary}
                  </p>
                </div>
              </div>

              <div className="px-5 pb-5 pt-2 flex items-center justify-between border-t border-slate-100 dark:border-slate-800/80 text-xs">
                <button
                  onClick={() => copyArticleCitation(article)}
                  className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 text-[11px] font-medium flex items-center gap-1 cursor-pointer transition-colors"
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
                      rel="noreferrer"
                      className="text-slate-500 hover:text-blue-600 dark:hover:text-cyan-400 font-medium flex items-center gap-1 cursor-pointer text-[11px]"
                    >
                      <span>Source</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}

                  <button
                    onClick={() => setActiveArticle(article)}
                    className="text-blue-600 dark:text-cyan-400 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>Read</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredArticles.length === 0 && !isRefreshing && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-10 text-center space-y-3">
          <Newspaper className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">No Articles Found</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            No headlines match your filters. Try clearing search or click Force Live Sync.
          </p>
          <button
            onClick={() => { setSearchQuery(''); setSelectedCategory('all'); handleClearTopic(); }}
            className="px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-xl cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      )}

      {activeArticle && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-3xl w-full p-6 sm:p-8 space-y-5 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setActiveArticle(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-white text-lg font-bold p-2 cursor-pointer rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              ✕
            </button>

            <div className="flex flex-wrap items-center gap-2">
              <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border shadow-sm ${getCategoryBadge(activeArticle.category).color}`}>
                {getCategoryBadge(activeArticle.category).label}
              </span>
              <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-mono px-2.5 py-1 rounded-full">
                {activeArticle.readTime}
              </span>
              <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[10px] font-mono px-2 py-0.5 rounded-full flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Free Live RSS
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold font-display text-slate-900 dark:text-white leading-tight">
              {activeArticle.title}
            </h2>

            <div className="text-xs text-slate-500 font-medium flex flex-wrap items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
              <span><strong>Publisher:</strong> {activeArticle.publisher || activeArticle.author}</span>
              <span>•</span>
              <span><strong>Date:</strong> {activeArticle.date}</span>
              <span>•</span>
              <span><strong>Age:</strong> {activeArticle.timeAgo}</span>
            </div>

            <div className="relative rounded-2xl overflow-hidden h-64 bg-slate-950">
              <img
                src={activeArticle.imageUrl}
                alt={activeArticle.title}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="bg-blue-50/70 dark:bg-blue-950/30 border-l-4 border-blue-600 p-4 rounded-r-xl text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
              <span className="font-bold text-blue-900 dark:text-cyan-300 block mb-1">Summary</span>
              {activeArticle.summary}
            </div>

            <div className="space-y-3 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              <p>{activeArticle.content}</p>
            </div>

            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <button
                onClick={() => copyArticleCitation(activeArticle)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                {copiedId === activeArticle.id ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedId === activeArticle.id ? 'Copied' : 'Copy Citation'}</span>
              </button>

              <div className="flex items-center gap-2">
                {activeArticle.sourceUrl && (
                  <a
                    href={activeArticle.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer transition-colors shadow-sm"
                  >
                    <span>Open Source</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
                <button
                  onClick={() => setActiveArticle(null)}
                  className="px-5 py-2 bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-bold text-xs rounded-xl cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
