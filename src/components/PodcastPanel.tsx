import React, { useMemo, useState } from 'react';
import { Mic2, ChevronDown, ChevronUp, Clock, Calendar, Radio, Headphones } from 'lucide-react';
import { podcastContent, type PodcastEpisode } from '../content/podcastContent';

const EpisodeCard: React.FC<{ ep: PodcastEpisode; open: boolean; onToggle: () => void }> = ({
  ep,
  open,
  onToggle,
}) => {
  return (
    <article className="rounded-xl border border-slate-700/80 bg-slate-900/60 overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        className="w-full text-left p-4 flex gap-3 items-start"
        aria-expanded={open}
      >
        <span className="shrink-0 h-10 w-10 rounded-xl bg-violet-500/20 border border-violet-400/40 flex items-center justify-center text-xs font-black text-violet-200">
          {String(ep.number).padStart(2, '0')}
        </span>
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-bold text-white leading-snug">{ep.title}</h3>
            <span className="text-[10px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-600">
              {ep.cadence}
            </span>
          </div>
          <p className="text-xs text-slate-400 line-clamp-2">{ep.summary}</p>
          <div className="flex flex-wrap gap-3 text-[11px] text-slate-500">
            <span className="inline-flex items-center gap-1">
              <Calendar className="w-3 h-3" /> {ep.published}
            </span>
            <span className="inline-flex items-center gap-1">
              <Clock className="w-3 h-3" /> {ep.durationMin} min
            </span>
          </div>
        </div>
        <span className="text-slate-500 shrink-0">
          {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </span>
      </button>
      {open && (
        <div className="px-4 pb-4 border-t border-slate-800 pt-3 space-y-3 text-xs text-slate-300">
          <div className="flex flex-wrap gap-1.5">
            {ep.topics.map((t) => (
              <span
                key={t}
                className="px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-200 border border-violet-500/30 text-[10px] font-semibold"
              >
                {t}
              </span>
            ))}
          </div>
          <div>
            <h4 className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-1">Show notes</h4>
            <ul className="space-y-1 list-disc pl-4">
              {ep.showNotes.map((n) => (
                <li key={n}>{n}</li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-1">Takeaways</h4>
            <ul className="space-y-1 list-disc pl-4 text-slate-400">
              {ep.takeaways.map((n) => (
                <li key={n}>{n}</li>
              ))}
            </ul>
          </div>
          {ep.audioUrl ? (
            <a
              href={ep.audioUrl}
              className="inline-flex items-center gap-1.5 text-cyan-400 font-semibold hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Headphones className="w-3.5 h-3.5" /> Listen
            </a>
          ) : (
            <p className="text-[11px] text-slate-500 inline-flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5" /> Show notes published — audio link coming when hosting is connected
            </p>
          )}
        </div>
      )}
    </article>
  );
};

export const PodcastPanel: React.FC = () => {
  const eps = podcastContent.episodes;
  const [filter, setFilter] = useState<'all' | 'weekly' | 'monthly' | 'special'>('all');
  const [openId, setOpenId] = useState<string | null>(eps[0]?.id ?? null);

  const list = useMemo(() => {
    if (filter === 'all') return eps;
    return eps.filter((e) => e.cadence === filter);
  }, [eps, filter]);

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-violet-500/30 bg-gradient-to-br from-slate-950 via-slate-900 to-violet-950/40 p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <div className="h-11 w-11 rounded-2xl bg-violet-500/20 border border-violet-400/40 flex items-center justify-center shrink-0">
            <Mic2 className="w-5 h-5 text-violet-300" />
          </div>
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-violet-300">Podcast</p>
            <h2 className="text-lg sm:text-xl font-black text-white">{podcastContent.showName}</h2>
            <p className="text-sm text-slate-300 mt-1">{podcastContent.tagline}</p>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed max-w-2xl">{podcastContent.description}</p>
            <p className="text-[11px] text-slate-500 mt-2">{podcastContent.hostNote}</p>
            <p className="text-[11px] text-slate-500 mt-1">{podcastContent.subscribeHint}</p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {(['all', 'weekly', 'monthly', 'special'] as const).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={`px-2.5 py-1.5 rounded-lg text-[11px] font-semibold border capitalize ${
              filter === f
                ? 'bg-violet-500/20 border-violet-400 text-violet-200'
                : 'border-slate-700 text-slate-400 hover:border-slate-500'
            }`}
          >
            {f}
          </button>
        ))}
        <span className="text-[11px] text-slate-500 self-center ml-1">{list.length} episodes</span>
      </div>

      <div className="space-y-2.5">
        {list.map((ep) => (
          <EpisodeCard
            key={ep.id}
            ep={ep}
            open={openId === ep.id}
            onToggle={() => setOpenId((id) => (id === ep.id ? null : ep.id))}
          />
        ))}
      </div>
    </div>
  );
};

export default PodcastPanel;
