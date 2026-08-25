/**
 * Experience feedback (👍/👎) — local store + moderated public wall.
 * Public posts require your approval (moderator PIN).
 */

export type ExperienceVote = 'up' | 'down';

export type ExperienceEntry = {
  id: string;
  vote: ExperienceVote;
  comment: string;
  displayName: string;
  createdAt: string;
  /** User asked to show on site */
  wantPublic: boolean;
  /** You approved for public wall */
  approved: boolean;
  rejected?: boolean;
};

const ALL_KEY = 'tg_experience_feedback_v1';
const MOD_KEY = 'tg_feedback_mod_unlocked';

/** Change this in production if you want; also shown in Trust → Feedback mod */
export const FEEDBACK_MOD_PIN = 'TG-MELB-2026';

function loadAll(): ExperienceEntry[] {
  try {
    const raw = localStorage.getItem(ALL_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveAll(list: ExperienceEntry[]) {
  localStorage.setItem(ALL_KEY, JSON.stringify(list.slice(0, 200)));
  window.dispatchEvent(new CustomEvent('tg_experience_feedback_changed'));
}

export function listFeedback(): ExperienceEntry[] {
  return loadAll().sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function listPublicApproved(): ExperienceEntry[] {
  return listFeedback().filter((e) => e.wantPublic && e.approved && !e.rejected && e.comment.trim());
}

export function listPendingPublic(): ExperienceEntry[] {
  return listFeedback().filter((e) => e.wantPublic && !e.approved && !e.rejected);
}

export function submitExperienceFeedback(input: {
  vote: ExperienceVote;
  comment: string;
  displayName: string;
  wantPublic: boolean;
}): ExperienceEntry {
  const entry: ExperienceEntry = {
    id: `fb_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    vote: input.vote,
    comment: (input.comment || '').trim().slice(0, 500),
    displayName: (input.displayName || 'Anonymous').trim().slice(0, 40) || 'Anonymous',
    createdAt: new Date().toISOString(),
    wantPublic: !!input.wantPublic,
    approved: false,
  };
  const list = loadAll();
  list.unshift(entry);
  saveAll(list);
  // Also mirror last vote for footer UI
  try {
    localStorage.setItem('tg_footer_feedback', input.vote);
    localStorage.setItem('tg_footer_feedback_at', entry.createdAt);
  } catch {
    /* ignore */
  }
  return entry;
}

export function approveFeedback(id: string) {
  const list = loadAll().map((e) =>
    e.id === id ? { ...e, approved: true, rejected: false } : e
  );
  saveAll(list);
}

export function rejectFeedback(id: string) {
  const list = loadAll().map((e) =>
    e.id === id ? { ...e, rejected: true, approved: false } : e
  );
  saveAll(list);
}

export function isFeedbackModUnlocked(): boolean {
  try {
    return localStorage.getItem(MOD_KEY) === '1';
  } catch {
    return false;
  }
}

export function unlockFeedbackMod(pin: string): boolean {
  if (pin.trim() === FEEDBACK_MOD_PIN) {
    localStorage.setItem(MOD_KEY, '1');
    return true;
  }
  return false;
}

export function lockFeedbackMod() {
  localStorage.removeItem(MOD_KEY);
}

export function feedbackMailto(entry: ExperienceEntry): string {
  const subject = encodeURIComponent(`TimeGovern experience: ${entry.vote === 'up' ? '👍' : '👎'}`);
  const body = encodeURIComponent(
    `Vote: ${entry.vote}\nName: ${entry.displayName}\nPublic request: ${entry.wantPublic}\n\n${entry.comment}\n\n— sent from timegovern.com footer`
  );
  return `mailto:support@timegovern.com?subject=${subject}&body=${body}`;
}
