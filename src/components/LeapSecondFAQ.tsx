import React, { useState, useMemo } from 'react';
import {
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Search,
  BookOpen,
  ShieldCheck,
  Globe,
  Radio,
  Zap,
  Cpu,
  Award,
  Sparkles,
  Layers,
  ArrowRight,
  ExternalLink,
  Clock,
  Compass,
  FileText
} from 'lucide-react';

export interface FAQItem {
  id: string;
  category: 'future-2035' | 'utc-maintenance' | 'physics-earth' | 'infrastructure-tech';
  question: string;
  shortAnswer: string;
  detailedAnswer: React.ReactNode;
  tags: string[];
  authority: string;
  updatedDate: string;
}

export const LEAP_SECOND_FAQS: FAQItem[] = [
  {
    id: 'cgpm-2035-resolution',
    category: 'future-2035',
    question: 'Will leap seconds be officially eliminated in 2035? What is CGPM Resolution 4?',
    shortAnswer: 'Yes. In November 2022, the 27th CGPM voted to increase the allowed |UT1 - UTC| difference by 2035, effectively pausing leap second insertions for at least 100 years.',
    tags: ['CGPM', 'BIPM', 'Resolution 4', '2035', 'Deprecation'],
    authority: 'BIPM 27th General Conference on Weights and Measures (Versailles, 2022)',
    updatedDate: 'August 2026',
    detailedAnswer: (
      <div className="space-y-3 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
        <p>
          At the <strong>27th General Conference on Weights and Measures (CGPM)</strong> in Versailles (November 2022), delegates representing member states unanimously adopted <strong>Resolution 4</strong>: <em>"On the use and future development of UTC"</em>.
        </p>
        <div className="bg-slate-100 dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1.5">
          <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5 text-cyan-500" /> Core Mandates of Resolution 4:
          </div>
          <ul className="list-disc list-inside space-y-1 text-slate-700 dark:text-slate-300 pl-1">
            <li><strong>Relax the 0.9s tolerance limit:</strong> Increase the maximum permitted divergence between astronomical time (<code className="font-mono text-cyan-600 dark:text-cyan-400">UT1</code>) and atomic time (<code className="font-mono text-cyan-600 dark:text-cyan-400">UTC</code>) starting no later than <strong>2035</strong>.</li>
            <li><strong>Consult International Bodies:</strong> Collaborate with the <em>International Telecommunication Union (ITU-R)</em>, <em>IERS</em>, and astronomical unions to determine whether the new limit will be 1 minute, 1 hour, or continuous without bound.</li>
            <li><strong>100+ Year Stability:</strong> Under an expanded ~1 minute threshold, Earth rotation drift will not trigger any discontinuous time steps until at least <strong>2135</strong>.</li>
          </ul>
        </div>
        <p>
          This historic decision aims to eliminate the severe risks of distributed server outages, telecom race conditions, and financial market desynchronization caused by irregular <code className="font-mono bg-slate-200 dark:bg-slate-800 px-1 py-0.5 rounded">:60</code> second insertions.
        </p>
      </div>
    )
  },
  {
    id: 'how-utc-is-maintained',
    category: 'utc-maintenance',
    question: 'How is UTC+0 (Coordinated Universal Time) actually calculated and maintained?',
    shortAnswer: 'UTC is calculated monthly by the BIPM in France through a weighted ensemble of over 450 atomic clocks across 80 national metrology institutes, synchronized via satellite time transfers.',
    tags: ['BIPM', 'Circular T', 'Cesium-133', 'NIST', 'NPL', 'PTB'],
    authority: 'Bureau International des Poids et Mesures (BIPM), S+�vres, France',
    updatedDate: 'August 2026',
    detailedAnswer: (
      <div className="space-y-3 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
        <p>
          Unlike a physical master clock sitting in a room, <strong>UTC is a computed paper time scale</strong> generated retrospectively each month by the <strong>BIPM Time Department</strong> in S+�vres, France.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <div className="bg-slate-100 dark:bg-slate-950 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
            <span className="font-bold text-slate-900 dark:text-white block mb-1">1. Global Clock Ensemble</span>
            <p className="text-[11px] text-slate-600 dark:text-slate-400">
              Over <strong>450 atomic clocks</strong> (hydrogen masers, Cesium-133 beam standards) in ~80 institutes (NIST, NPL, PTB, NICT) transmit continuous tick data to BIPM.
            </p>
          </div>
          <div className="bg-slate-100 dark:bg-slate-950 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
            <span className="font-bold text-slate-900 dark:text-white block mb-1">2. Primary Frequency Standards</span>
            <p className="text-[11px] text-slate-600 dark:text-slate-400">
              Laser-cooled Cesium fountain clocks and optical lattice clocks (Strontium-87) provide absolute frequency calibration accurate to 1 second in 300 million years.
            </p>
          </div>
          <div className="bg-slate-100 dark:bg-slate-950 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
            <span className="font-bold text-slate-900 dark:text-white block mb-1">3. EAL & TAI Computation</span>
            <p className="text-[11px] text-slate-600 dark:text-slate-400">
              Weighted averaging creates the Free Atomic Scale (<code className="font-mono">EAL</code>), steering it to form International Atomic Time (<code className="font-mono">TAI</code>).
            </p>
          </div>
          <div className="bg-slate-100 dark:bg-slate-950 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
            <span className="font-bold text-slate-900 dark:text-white block mb-1">4. Monthly Circular T</span>
            <p className="text-[11px] text-slate-600 dark:text-slate-400">
              BIPM issues the official <em>Circular T</em> publication comparing each nation's real-time realization [UTC(k)] against the true mathematical UTC.
            </p>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 'iers-bulletin-c-role',
    category: 'utc-maintenance',
    question: 'Who decides when a leap second occurs, and how much advance notice is provided?',
    shortAnswer: 'The IERS Earth Orientation Center in Paris decides and announces leap seconds exactly 6 months in advance via semi-annual Bulletin C.',
    tags: ['IERS', 'Bulletin C', 'Observatoire de Paris', 'UT1', 'Earth Orientation'],
    authority: 'International Earth Rotation and Reference Systems Service (IERS)',
    updatedDate: 'July 2026',
    detailedAnswer: (
      <div className="space-y-3 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
        <p>
          The mandate to schedule leap seconds belongs exclusively to the <strong>Earth Orientation Center of the IERS</strong>, based at the <em>Observatoire de Paris</em>.
        </p>
        <p>
          Every six months (in early <strong>January</strong> and <strong>July</strong>), the IERS publishes <strong>Bulletin C</strong>. It evaluates Very Long Baseline Interferometry (VLBI) observations of distant quasars and satellite laser ranging to measure Earth's orientation angle:
        </p>
        <ul className="list-disc list-inside space-y-1 pl-1 text-slate-700 dark:text-slate-300">
          <li>If predictions show <code className="font-mono">|UT1 - UTC|</code> will exceed <strong>0.6 seconds</strong>, a leap second is scheduled for the end of June or December.</li>
          <li>If the difference remains safely below the threshold, Bulletin C formally states: <em>"NO LEAP SECOND WILL BE INTRODUCED AT THE END OF [MONTH YEAR]"</em>.</li>
          <li>The active <strong>Bulletin C 68</strong> confirms no leap second through at least December 31, 2026.</li>
        </ul>
      </div>
    )
  },
  {
    id: 'negative-leap-second',
    category: 'physics-earth',
    question: 'Could we ever have a Negative Leap Second (-1s), and why has it never happened?',
    shortAnswer: 'Yes, if Earth spins faster than 86,400 SI seconds per day. While unprecedented in history, recent rotational acceleration in 2020-2024 brought the possibility into scientific discussion.',
    tags: ['Negative Leap', 'Acceleration', '23:59:58', 'Climate Melting', 'Core Dynamics'],
    authority: 'Nature Geoscience & IERS Earth Rotation Studies',
    updatedDate: 'August 2026',
    detailedAnswer: (
      <div className="space-y-3 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
        <p>
          All 27 leap seconds inserted between 1972 and 2016 were <strong>positive leap seconds (+1s)</strong>, where second <code className="font-mono bg-slate-200 dark:bg-slate-800 px-1 rounded">23:59:60</code> was added because Earth was rotating slightly slower than atomic standard time.
        </p>
        <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 p-3 rounded-xl space-y-1.5">
          <span className="font-bold text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-500" /> What happens during a Negative Leap Second?
          </span>
          <p className="text-[11px] text-amber-800 dark:text-amber-200">
            If Earth accelerates, a second must be skipped: the minute would progress from <code className="font-mono">23:59:58</code> directly to <code className="font-mono">00:00:00</code>, omitting second 59 entirely.
          </p>
        </div>
        <p>
          <strong>Why hasn't one occurred?</strong> Fluid core deceleration and polar ice sheet melting (which redistributes mass toward the equator, increasing moment of inertia and slowing rotation) have counteracted short-term speedups, delaying any potential negative leap until post-2030, by which time CGPM Resolution 4 will likely take effect.
        </p>
      </div>
    )
  },
  {
    id: 'leap-smearing-vs-steps',
    category: 'infrastructure-tech',
    question: 'What is NTP leap smearing and why do large platforms use it?',
    shortAnswer: 'Leap Smearing spreads the 1-second adjustment continuously over 12 to 24 hours at tiny parts-per-million rates, avoiding system crashes from illegal 23:59:60 timestamps.',
    tags: ['Leap Smear', 'POSIX', 'Google', 'Meta', 'CDN operators', 'HFT'],
    authority: 'NIST Special Publication & Cloud Infrastructure Working Group',
    updatedDate: 'August 2026',
    detailedAnswer: (
      <div className="space-y-3 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
        <p>
          The POSIX standard defines a day as strictly <strong>86,400 integer seconds</strong>. Systems encountering a 61st second (<code className="font-mono">:60</code>) often either crash (e.g., the 2012 Linux kernel futex livelock) or repeat timestamp 86,400, leading to database lock corruption.
        </p>
        <div className="bg-slate-100 dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
          <span className="font-bold text-slate-900 dark:text-white block">Major Cloud Smearing Profiles:</span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
            <div className="border border-slate-200 dark:border-slate-800 p-2 rounded-lg bg-white dark:bg-slate-900">
              <span className="font-bold text-cyan-600 dark:text-cyan-400">Google & AWS Linear Smear (24h)</span>
              <p className="text-slate-500 mt-0.5">Slows clocks by 11.574 microseconds per second starting 12h before the event and ending 12h after.</p>
            </div>
            <div className="border border-slate-200 dark:border-slate-800 p-2 rounded-lg bg-white dark:bg-slate-900">
              <span className="font-bold text-blue-600 dark:text-blue-400">Meta and major CDNs (17h / 12h slew)</span>
              <p className="text-slate-500 mt-0.5">Uses bounded frequency steering to ensure high-frequency trading platforms maintain monotonic order.</p>
            </div>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 'gps-galileo-continuous-time',
    category: 'infrastructure-tech',
    question: 'How do GPS, Galileo, and military satellite constellations handle leap seconds?',
    shortAnswer: 'GPS, Galileo, and BeiDou run on continuous atomic time without leap seconds. They broadcast the current UTC offset in satellite navigation subframes.',
    tags: ['GPS Time', 'Galileo', 'GLONASS', 'GNSS', '18 Seconds', 'Subframe Telemetry'],
    authority: 'US Space Force & European Space Agency (ESA) GNSS Directorate',
    updatedDate: 'July 2026',
    detailedAnswer: (
      <div className="space-y-3 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
        <p>
          Global Navigation Satellite Systems (GNSS) require uninterrupted nanosecond time continuity for trilateration. Stopping or stepping a satellite clock by 1 second would cause a <strong>300,000-kilometer positioning error</strong>.
        </p>
        <ul className="list-disc list-inside space-y-1.5 pl-1 text-slate-700 dark:text-slate-300">
          <li><strong>GPS Time:</strong> Tied to TAI with a fixed 19.000s offset (<code className="font-mono">GPS = TAI - 19s</code>). GPS has had zero leap seconds since its zero epoch on <strong>January 6, 1980</strong>. Currently, <strong>GPS is +18s ahead of UTC</strong>.</li>
          <li><strong>Galileo System Time (GST):</strong> Runs continuously synchronized with TAI.</li>
          <li><strong>GLONASS (Russian):</strong> Uniquely applies leap seconds directly to satellite clocks, which historically caused satellite constellation outages during leap events.</li>
        </ul>
      </div>
    )
  },
  {
    id: 'ut1-vs-tai-vs-utc-differences',
    category: 'physics-earth',
    question: 'What is the precise difference between UT1, TAI, UTC, and Terrestrial Time (TT)?',
    shortAnswer: 'UT1 measures true Earth rotation angle; TAI is pure atomic time; UTC is TAI with integer leap seconds added to match UT1; TT is the astronomical ephemeris time.',
    tags: ['UT1', 'TAI', 'UTC', 'TT', 'DUT1', 'Time Scales'],
    authority: 'IAU Commission A3 on Fundamental Standards',
    updatedDate: 'August 2026',
    detailedAnswer: (
      <div className="space-y-3 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
        <div className="overflow-x-auto">
          <table className="w-full text-[11px] border border-slate-200 dark:border-slate-800 rounded-lg">
            <thead className="bg-slate-100 dark:bg-slate-950 font-bold text-slate-900 dark:text-white">
              <tr>
                <th className="p-2 text-left">Time Scale</th>
                <th className="p-2 text-left">Basis</th>
                <th className="p-2 text-left">Leap Seconds?</th>
                <th className="p-2 text-left">Current Offset to UTC</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-mono">
              <tr>
                <td className="p-2 font-bold text-blue-600 dark:text-cyan-400">UT1</td>
                <td className="p-2 text-slate-600 dark:text-slate-400 font-sans">Earth Rotation Angle</td>
                <td className="p-2 text-slate-500 font-sans">Continuous Natural</td>
                <td className="p-2 text-slate-800 dark:text-slate-200">DUT1 ��� +0.038s</td>
              </tr>
              <tr>
                <td className="p-2 font-bold text-emerald-600 dark:text-emerald-400">TAI</td>
                <td className="p-2 text-slate-600 dark:text-slate-400 font-sans">450+ Cesium/Optical Clocks</td>
                <td className="p-2 text-emerald-600 font-sans font-bold">Never</td>
                <td className="p-2 text-emerald-600 dark:text-emerald-400 font-bold">+37.000s exactly</td>
              </tr>
              <tr>
                <td className="p-2 font-bold text-slate-900 dark:text-white">UTC</td>
                <td className="p-2 text-slate-600 dark:text-slate-400 font-sans">Civil Standard (Atomic + Steps)</td>
                <td className="p-2 text-amber-600 font-sans font-bold">Yes (27 past)</td>
                <td className="p-2 text-slate-900 dark:text-white">Reference Base (0s)</td>
              </tr>
              <tr>
                <td className="p-2 font-bold text-purple-600 dark:text-purple-400">TT</td>
                <td className="p-2 text-slate-600 dark:text-slate-400 font-sans">Astronomical Ephemeris (TAI+32.184s)</td>
                <td className="p-2 text-purple-600 font-sans font-bold">Never</td>
                <td className="p-2 text-purple-600 dark:text-purple-400 font-bold">+69.184s exactly</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    )
  },
  {
    id: 'post-2035-astronomical-drift',
    category: 'future-2035',
    question: 'If leap seconds end in 2035, will the Sun eventually rise at night?',
    shortAnswer: 'No. At Earth���s current deceleration rate (~1.7ms/century), it will take over 5,000 years for the difference to accumulate to a single hour.',
    tags: ['Solar Noon', '2135', 'Sun Drift', 'Astronomy', 'Long Term'],
    authority: 'Royal Astronomical Society (RAS) & US Naval Observatory',
    updatedDate: 'August 2026',
    detailedAnswer: (
      <div className="space-y-3 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
        <p>
          A common misconception is that abolishing leap seconds will quickly desynchronize civil clocks from the day-night cycle.
        </p>
        <p>
          In reality, the divergence between atomic time and true solar noon accumulates at approximately <strong>0.5 to 1 second per year</strong>. Over a span of <strong>100 years</strong>, the difference between clock noon and solar noon will be less than <strong>1.5 minutes</strong>���far less than the 60-minute seasonal shift caused by Daylight Saving Time.
        </p>
        <div className="bg-slate-100 dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
          <span className="font-bold text-slate-900 dark:text-white block mb-1">The 100-Year Re-evaluation Clause:</span>
          <p className="text-[11px] text-slate-600 dark:text-slate-400">
            Resolution 4 specifies that international metrology conferences in the 2130s can schedule a planned, coordinated multi-minute or 1-hour adjustment if deemed necessary by future civil societies.
          </p>
        </div>
      </div>
    )
  }
];

export const LeapSecondFAQ: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set(['cgpm-2035-resolution', 'how-utc-is-maintained']));

  const categories = [
    { id: 'all', label: 'All Topics', icon: Layers, count: LEAP_SECOND_FAQS.length },
    { id: 'future-2035', label: '2035 Deprecation & Future', icon: ShieldCheck, count: LEAP_SECOND_FAQS.filter(f => f.category === 'future-2035').length },
    { id: 'utc-maintenance', label: 'UTC & standards', icon: Clock, count: LEAP_SECOND_FAQS.filter(f => f.category === 'utc-maintenance').length },
    { id: 'physics-earth', label: 'Earth Physics & Rotation', icon: Globe, count: LEAP_SECOND_FAQS.filter(f => f.category === 'physics-earth').length },
    { id: 'infrastructure-tech', label: 'Tech, NTP & GNSS', icon: Cpu, count: LEAP_SECOND_FAQS.filter(f => f.category === 'infrastructure-tech').length },
  ];

  const filteredFAQs = useMemo(() => {
    return LEAP_SECOND_FAQS.filter(faq => {
      const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      if (!q) return matchesCategory;
      const matchesSearch =
        faq.question.toLowerCase().includes(q) ||
        faq.shortAnswer.toLowerCase().includes(q) ||
        faq.tags.some(t => t.toLowerCase().includes(q)) ||
        faq.authority.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  const toggleExpand = (id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const expandAll = () => {
    setExpandedIds(new Set(filteredFAQs.map(f => f.id)));
  };

  const collapseAll = () => {
    setExpandedIds(new Set());
  };

  return (
    <div id="leap-second-expert-faq" className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-5 text-slate-800 dark:text-slate-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-blue-100 dark:bg-cyan-950/60 text-blue-600 dark:text-cyan-400 border border-blue-200 dark:border-cyan-800/60">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                Leap seconds FAQ
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Expert-curated answers on CGPM Resolution 4, 2035 deprecation, BIPM UTC+0 maintenance, and planetary rotation.
              </p>
            </div>
          </div>
        </div>

        {/* Global Expand / Collapse */}
        <div className="flex items-center gap-2 self-start sm:self-auto text-xs">
          <button
            onClick={expandAll}
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer font-medium"
          >
            Expand All
          </button>
          <button
            onClick={collapseAll}
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer font-medium"
          >
            Collapse All
          </button>
        </div>
      </div>

      {/* Category Pills & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          {categories.map(cat => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-blue-600 dark:bg-cyan-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{cat.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                  isSelected ? 'bg-white/25 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                }`}>
                  {cat.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search Field */}
        <div className="relative min-w-[220px]">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search questions, BIPM, 2035..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 dark:focus:border-cyan-400"
          />
        </div>
      </div>

      {/* Accordion FAQ List */}
      <div className="space-y-3">
        {filteredFAQs.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 text-xs">
            No matching questions found for "{searchQuery}". Try clearing search or selecting "All Topics".
          </div>
        ) : (
          filteredFAQs.map((faq) => {
            const isExpanded = expandedIds.has(faq.id);
            return (
              <div
                key={faq.id}
                className={`border rounded-2xl transition-all ${
                  isExpanded
                    ? 'border-blue-300 dark:border-cyan-500/40 bg-slate-50/50 dark:bg-slate-950/60 shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                {/* Question Header */}
                <button
                  onClick={() => toggleExpand(faq.id)}
                  className="w-full p-4 text-left flex items-start justify-between gap-4 cursor-pointer"
                >
                  <div className="space-y-1 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        faq.category === 'future-2035'
                          ? 'bg-purple-100 dark:bg-purple-950/70 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800'
                          : faq.category === 'utc-maintenance'
                          ? 'bg-blue-100 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                          : faq.category === 'physics-earth'
                          ? 'bg-amber-100 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                          : 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                      }`}>
                        {faq.category === 'future-2035' ? '2035 Deprecation' : faq.category === 'utc-maintenance' ? 'UTC Maintenance' : faq.category === 'physics-earth' ? 'Earth Physics' : 'Infrastructure'}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {faq.authority.split(',')[0]}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900 dark:text-white pt-0.5">
                      {faq.question}
                    </h4>

                    {!isExpanded && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                        {faq.shortAnswer}
                      </p>
                    )}
                  </div>

                  <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 shrink-0 mt-0.5">
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </button>

                {/* Expanded Content Body */}
                {isExpanded && (
                  <div className="px-4 pb-4 pt-1 border-t border-slate-200/80 dark:border-slate-800/80 space-y-3">
                    {faq.detailedAnswer}

                    {/* Metadata & Tag Footer */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-slate-200/60 dark:border-slate-800/60 text-[10px] text-slate-500 dark:text-slate-400">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="font-semibold text-slate-600 dark:text-slate-300">Tags:</span>
                        {faq.tags.map(tag => (
                          <span
                            key={tag}
                            className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-600 dark:text-slate-300 font-mono"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                      <div className="font-mono text-slate-400">
                        Authority: <span className="text-slate-600 dark:text-slate-300 font-semibold">{faq.authority}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
