import React, { useEffect, useState } from 'react';
import { ThumbsUp, ThumbsDown, Shield, Check, X, MessageSquare } from 'lucide-react';
import {
  listFeedback,
  listPublicApproved,
  listPendingPublic,
  approveFeedback,
  rejectFeedback,
  isFeedbackModUnlocked,
  unlockFeedbackMod,
  lockFeedbackMod,
  FEEDBACK_MOD_PIN,
  type ExperienceEntry,
} from '../lib/experienceFeedback';

/** Company hub → Feedback: public wall (approved only) + your moderation queue */
export const ExperienceFeedbackPanel: React.FC = () => {
  const [publicList, setPublicList] = useState<ExperienceEntry[]>([]);
  const [pending, setPending] = useState<ExperienceEntry[]>([]);
  const [all, setAll] = useState<ExperienceEntry[]>([]);
  const [mod, setMod] = useState(false);
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState<string | null>(null);

  const refresh = () => {
    setPublicList(listPublicApproved());
    setPending(listPendingPublic());
    setAll(listFeedback());
    setMod(isFeedbackModUnlocked());
  };

  useEffect(() => {
    refresh();
    const onChange = () => refresh();
    window.addEventListener('tg_experience_feedback_changed', onChange);
    return () => window.removeEventListener('tg_experience_feedback_changed', onChange);
  }, []);

  return (
    <div className="rounded-2xl border border-slate-700 bg-slate-950/80 p-5 space-y-5 text-sm text-slate-200">
      <div>
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-cyan-400" /> Experience feedback
        </h3>
        <p className="text-xs text-slate-400 mt-1">
          Visitors rate the site from the footer (👍 / 👎). Comments marked “share on site” only appear here
          after <strong className="text-slate-200">you approve</strong> them. Nothing is published without your permission.
        </p>
      </div>

      <section className="space-y-2">
        <h4 className="text-xs font-bold uppercase tracking-wide text-emerald-400">Public wall (approved)</h4>
        {publicList.length === 0 ? (
          <p className="text-xs text-slate-500">No approved public comments yet.</p>
        ) : (
          <ul className="space-y-2">
            {publicList.map((e) => (
              <li key={e.id} className="rounded-xl border border-slate-700 bg-slate-900/80 p-3 text-xs">
                <div className="flex items-center gap-2 font-semibold">
                  {e.vote === 'up' ? (
                    <ThumbsUp className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <ThumbsDown className="w-3.5 h-3.5 text-rose-400" />
                  )}
                  {e.displayName}
                  <span className="text-slate-500 font-normal">
                    {new Date(e.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="mt-1 text-slate-300">{e.comment}</p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-xl border border-amber-500/30 bg-amber-950/20 p-4 space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wide text-amber-300 flex items-center gap-2">
          <Shield className="w-3.5 h-3.5" /> Moderator (you only)
        </h4>
        {!mod ? (
          <div className="flex flex-wrap gap-2 items-center">
            <input
              type="password"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="Moderator PIN"
              className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-600 text-xs text-white"
            />
            <button
              type="button"
              className="px-3 py-1.5 rounded-lg bg-amber-600 text-white text-xs font-bold"
              onClick={() => {
                if (unlockFeedbackMod(pin)) {
                  setMod(true);
                  setPinError(null);
                  refresh();
                } else setPinError('Wrong PIN');
              }}
            >
              Unlock queue
            </button>
            {pinError && <span className="text-rose-400 text-xs">{pinError}</span>}
            <p className="text-[10px] text-slate-500 w-full">
              Default PIN for lab: <code className="text-slate-400">{FEEDBACK_MOD_PIN}</code> — change in{' '}
              <code className="text-slate-400">src/lib/experienceFeedback.ts</code>
            </p>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center">
              <span className="text-xs text-emerald-300">Queue unlocked · {pending.length} pending</span>
              <button type="button" className="text-[10px] text-slate-400 underline" onClick={() => { lockFeedbackMod(); setMod(false); }}>
                Lock
              </button>
            </div>
            {pending.length === 0 ? (
              <p className="text-xs text-slate-500">No pending public requests.</p>
            ) : (
              <ul className="space-y-2">
                {pending.map((e) => (
                  <li key={e.id} className="rounded-lg border border-slate-600 p-3 text-xs space-y-2">
                    <div className="flex items-center gap-2">
                      {e.vote === 'up' ? <ThumbsUp className="w-3.5 h-3.5 text-emerald-400" /> : <ThumbsDown className="w-3.5 h-3.5 text-rose-400" />}
                      <strong>{e.displayName}</strong>
                      <span className="text-slate-500">{new Date(e.createdAt).toLocaleString()}</span>
                    </div>
                    <p className="text-slate-300">{e.comment || '(no comment)'}</p>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 px-2 py-1 rounded bg-emerald-600 text-white text-[10px] font-bold"
                        onClick={() => { approveFeedback(e.id); refresh(); }}
                      >
                        <Check className="w-3 h-3" /> Approve for site
                      </button>
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 px-2 py-1 rounded bg-slate-700 text-slate-200 text-[10px] font-bold"
                        onClick={() => { rejectFeedback(e.id); refresh(); }}
                      >
                        <X className="w-3 h-3" /> Reject
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            <p className="text-[10px] text-slate-500">All responses (private): {all.length}</p>
          </>
        )}
      </section>
    </div>
  );
};

export default ExperienceFeedbackPanel;
