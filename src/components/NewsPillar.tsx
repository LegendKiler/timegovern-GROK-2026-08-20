import React, { useState, useEffect } from 'react';
import { Newspaper, Calendar, ArrowRight, Tag, Bookmark, Clock, Flame, Globe, Search, RefreshCw, Zap, CheckCircle2, ExternalLink } from 'lucide-react';

interface Article {
  id: string;
  title: string;
  category: string;
  date: string;
  timeAgo?: string;
  author: string;
  readTime: string;
  summary: string;
  content: string;
  imageUrl: string;
  featured?: boolean;
  sourceUrl?: string;
}

export const NewsPillar: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeArticle, setActiveArticle] = useState<Article | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>('Just now');

  const fetchLiveNews = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch('/api/news');
      const data = await res.json();
      if (data.success && data.articles) {
        setArticles(data.articles);
        setLastSyncTime(`Updated ${new Date().toLocaleTimeString()}`);
      }
    } catch (err) {
      console.warn('News fetch fallback:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLiveNews();
    const interval = setInterval(fetchLiveNews, 180000); // 3 minutes auto-refresh
    return () => clearInterval(interval);
  }, []);

  const filteredArticles = articles.filter((art) => {
    const matchesCat = selectedCategory === 'all' || art.category === selectedCategory;
    const matchesSearch = art.title.toLowerCase().includes(searchQuery.toLowerCase()) || art.summary.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Live Sync Status Bar */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 rounded-2xl p-4 shadow-md text-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <span className="flex h-2.5 w-2.5 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <span className="font-bold text-cyan-300">Live Global Time & Astronomy News Stream</span>
          <span className="text-slate-500">•</span>
          <span className="text-slate-300 font-mono text-[11px]">Synced via Google News & IERS Bulletins</span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-slate-400 text-[11px]">{lastSyncTime}</span>
          <button
            onClick={fetchLiveNews}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-3 py-1 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-400/40 rounded-lg transition-colors cursor-pointer text-xs font-semibold"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Syncing...' : 'Refresh Feed'}</span>
          </button>
        </div>
      </div>

      {/* Main Header & Category Filter */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm text-slate-900 dark:text-slate-100 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold font-display text-slate-900 dark:text-white flex items-center gap-2.5">
              <Newspaper className="w-6 h-6 text-blue-600 dark:text-cyan-400" />
              Global Temporal News, Astronomy & Timezone Articles
            </h1>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
              Real-time updates on Daylight Saving Transitions, Astronomical Events, Quantum Atomic Clocks & IANA Tzdata Releases.
            </p>
          </div>

          <div className="relative max-w-xs w-full">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search news..."
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* Category Buttons */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold border-t border-slate-100 dark:border-slate-800 pt-3">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            All News
          </button>
          <button
            onClick={() => setSelectedCategory('dst')}
            className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${
              selectedCategory === 'dst'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            Daylight Saving
          </button>
          <button
            onClick={() => setSelectedCategory('astronomy')}
            className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${
              selectedCategory === 'astronomy'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            Astronomy & Space
          </button>
          <button
            onClick={() => setSelectedCategory('timezones')}
            className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${
              selectedCategory === 'timezones'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            Time Zones
          </button>
          <button
            onClick={() => setSelectedCategory('technology')}
            className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${
              selectedCategory === 'technology'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            Quantum Tech
          </button>
        </div>
      </div>

      {/* Articles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredArticles.map((article) => (
          <div
            key={article.id}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
          >
            <div>
              <div className="relative h-48 overflow-hidden bg-slate-900">
                <img
                  src={article.imageUrl}
                  alt={article.title}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute top-3 left-3 bg-blue-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm">
                  {article.category}
                </span>
                {article.timeAgo && (
                  <span className="absolute top-3 right-3 bg-slate-900/80 backdrop-blur-md text-cyan-300 text-[10px] font-mono px-2 py-0.5 rounded border border-cyan-500/30">
                    {article.timeAgo}
                  </span>
                )}
              </div>

              <div className="p-5 space-y-3">
                <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{article.date}</span>
                  <span>•</span>
                  <span>{article.author}</span>
                </div>

                <h2 className="text-lg font-bold font-display text-slate-900 dark:text-white leading-snug">
                  {article.title}
                </h2>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-3">
                  {article.summary}
                </p>
              </div>
            </div>

            <div className="px-5 pb-5 pt-2 flex items-center justify-between border-t border-slate-100 dark:border-slate-800/80 text-xs">
              <span className="text-slate-400 text-[11px]">{article.readTime}</span>
              {article.sourceUrl ? (
                <a
                  href={article.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-600 dark:text-cyan-400 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>Read full story on Google News</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              ) : (
                <button
                  onClick={() => setActiveArticle(article)}
                  className="text-blue-600 dark:text-cyan-400 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>Read Article</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Article Detail Modal */}
      {activeArticle && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-4 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setActiveArticle(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-white text-lg font-bold p-2 cursor-pointer"
            >
              ✕
            </button>

            <span className="inline-block bg-blue-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
              {activeArticle.category}
            </span>

            <h2 className="text-2xl font-bold font-display text-slate-900 dark:text-white">
              {activeArticle.title}
            </h2>

            <div className="text-xs text-slate-500 font-medium flex items-center gap-2">
              <span>By {activeArticle.author}</span>
              <span>•</span>
              <span>{activeArticle.date}</span>
            </div>

            <img
              src={activeArticle.imageUrl}
              alt={activeArticle.title}
              className="w-full h-56 object-cover rounded-2xl my-2"
            />

            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              {activeArticle.content}
            </p>

            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end">
              <button
                onClick={() => setActiveArticle(null)}
                className="px-5 py-2 bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-bold text-xs rounded-xl cursor-pointer"
              >
                Close Article
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
