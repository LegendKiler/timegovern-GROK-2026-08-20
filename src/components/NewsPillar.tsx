import React, { useState } from 'react';
import { Newspaper, Calendar, ArrowRight, Tag, Bookmark, Clock, Flame, Globe, Search } from 'lucide-react';

interface Article {
  id: string;
  title: string;
  category: 'dst' | 'astronomy' | 'timezones' | 'technology';
  date: string;
  author: string;
  readTime: string;
  summary: string;
  content: string;
  imageUrl: string;
  featured?: boolean;
}

const ARTICLES: Article[] = [
  {
    id: 'dst-europe-2026',
    title: 'European Daylight Saving Time Ends: Clocks Fall Back Across EU and UK',
    category: 'dst',
    date: 'July 27, 2026',
    author: 'Elena Rostova',
    readTime: '4 min read',
    featured: true,
    summary: 'Comprehensive overview of upcoming Daylight Saving Time transitions across European Union member states and North America.',
    content: 'Millions across Europe and North America will adjust their clocks as Daylight Saving Time (DST) draws to a close for the autumn season. We analyze the economic impacts, airline schedule realignments, and automated server timezone patch deployments.',
    imageUrl: 'https://images.unsplash.com/photo-1508962914676-134849a727f0?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'perseid-meteor-shower-2026',
    title: 'Perseid Meteor Shower Peak 2026: Prime Viewing Hours & Celestial Coordinates',
    category: 'astronomy',
    date: 'July 25, 2026',
    author: 'Dr. Marcus Vance',
    readTime: '6 min read',
    featured: true,
    summary: 'The annual Perseid meteor shower reaches its pinnacle this August under optimal moonless dark night skies.',
    content: 'Stargazers worldwide can look forward to up to 100 meteors per hour during the midnight-to-dawn peak hours. Our astronomical charts calculate exact zenith hourly rates based on your latitude and local light pollution index.',
    imageUrl: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'leap-second-utc-future',
    title: 'International Earth Rotation Service (IERS) Vote on Future of Negative Leap Seconds',
    category: 'timezones',
    date: 'July 20, 2026',
    author: 'Julian Thorne',
    readTime: '5 min read',
    summary: 'Global timekeeping bodies evaluate the proposal to phase out leap second adjustments by 2035 in favor of continuous UTC atomic time.',
    content: 'With atomic clock drift and Earth rotation fluctuations presenting microsecond discrepancies, cloud computing providers and telecom networks push for unified UTC standard without manual leap second insertions.',
    imageUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'middle-east-tz-realignment',
    title: 'Middle East Time Zone Alignment: Egypt & Saudi Arabia Update DST Schedules',
    category: 'dst',
    date: 'July 15, 2026',
    author: 'Tariq Al-Mansoor',
    readTime: '3 min read',
    summary: 'Detailed IANA tzdata 2026a updates for Egypt, Jordan, and Gulf Cooperation Council countries.',
    content: 'Recent legislative adjustments in Cairo and Amman update local standard time rules. Developers are advised to update their IANA timezone database files to version 2026a to maintain precise meeting scheduling and flight system sync.',
    imageUrl: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'quantum-atomic-clocks',
    title: 'Optical Lattice Clocks Achieve 1-Second Drift in 300 Billion Years Precision',
    category: 'technology',
    date: 'July 10, 2026',
    author: 'Prof. Hiroshi Tanaka',
    readTime: '7 min read',
    summary: 'New quantum optical clocks measure gravitational time dilation down to millimeter height shifts on Earth.',
    content: 'Researchers at NIST and RIKEN have unveiled ytterbium lattice clocks capable of sub-femtosecond stability. These quantum time standards will redefine the SI Second and power deep space navigation systems.',
    imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80'
  }
];

export const NewsPillar: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeArticle, setActiveArticle] = useState<Article | null>(null);

  const filteredArticles = ARTICLES.filter((art) => {
    const matchesCat = selectedCategory === 'all' || art.category === selectedCategory;
    const matchesSearch = art.title.toLowerCase().includes(searchQuery.toLowerCase()) || art.summary.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm text-slate-900 dark:text-slate-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white font-display flex items-center gap-2.5">
              <Newspaper className="w-6 h-6 text-blue-600 dark:text-cyan-400" />
              Time, Astronomy & Space News
            </h1>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
              Latest news on Daylight Saving Time changes, IANA timezone patches, solar eclipses & quantum time standards.
            </p>
          </div>

          {/* Search bar */}
          <div className="relative max-w-xs w-full">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search news & updates..."
              className="w-full bg-slate-100 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-100 pl-9 pr-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* Categories */}
        <div className="flex items-center gap-2 mt-4 overflow-x-auto no-scrollbar text-xs font-semibold">
          {[
            { id: 'all', label: 'All Articles' },
            { id: 'dst', label: 'Daylight Saving Time' },
            { id: 'astronomy', label: 'Astronomy & Space' },
            { id: 'timezones', label: 'Time Zone Updates' },
            { id: 'technology', label: 'Quantum & Atomic Clocks' }
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-lg whitespace-nowrap cursor-pointer transition-all ${
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

      {/* Article Detail View Modal or Inline */}
      {activeArticle ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-md space-y-4">
          <button
            onClick={() => setActiveArticle(null)}
            className="text-xs text-blue-600 dark:text-cyan-400 font-bold hover:underline mb-2 cursor-pointer inline-flex items-center gap-1"
          >
            ← Back to News Feed
          </button>
          <img
            src={activeArticle.imageUrl}
            alt={activeArticle.title}
            className="w-full h-64 object-cover rounded-xl border border-slate-200 dark:border-slate-800"
          />
          <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
            <span className="bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 px-2.5 py-0.5 rounded-full font-bold uppercase text-[10px]">
              {activeArticle.category}
            </span>
            <span>• {activeArticle.date}</span>
            <span>• By {activeArticle.author}</span>
            <span>• {activeArticle.readTime}</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white font-display">
            {activeArticle.title}
          </h2>
          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
            {activeArticle.summary}
          </p>
          <hr className="border-slate-200 dark:border-slate-800" />
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            {activeArticle.content}
          </p>
          <p className="text-xs text-slate-500 italic mt-4">
            Source: TimeGovern Global Temporal News Network • Verified against UTC IANA tzdata standards.
          </p>
        </div>
      ) : (
        /* Articles Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredArticles.map((art) => (
            <div
              key={art.id}
              onClick={() => setActiveArticle(art)}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs hover:shadow-lg transition-all cursor-pointer flex flex-col group"
            >
              <div className="relative h-44 overflow-hidden">
                <img
                  src={art.imageUrl}
                  alt={art.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <span className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md text-cyan-300 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase border border-cyan-500/30">
                  {art.category}
                </span>
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-[11px] text-slate-400">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{art.date}</span>
                    <span>•</span>
                    <span>{art.readTime}</span>
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base group-hover:text-blue-600 dark:group-hover:text-cyan-400 transition-colors line-clamp-2">
                    {art.title}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                    {art.summary}
                  </p>
                </div>
                <div className="pt-2 flex items-center text-xs font-bold text-blue-600 dark:text-cyan-400 group-hover:translate-x-1 transition-transform">
                  <span>Read Full Article</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
