// Time-Synchronization Drift Tolerance & Critical Infrastructure Warning Zones
// Standards: IEEE 1588-2019 (PTP), ITU-T G.8271.1 (5G Telecom), MiFID II RTS 25 (FinTech),
// Google TrueTime / CockroachDB Spanner (Cloud DBs), IERS ITU-R TF.460 (DUT1 Boundary)

export interface TimeSyncWarningPreset {
  id: string;
  name: string;
  shortName: string;
  thresholdMicros: number; // in microseconds (µs)
  thresholdSeconds: number; // in seconds (s)
  category: 'ptp' | 'telecom' | 'finance' | 'database' | 'astronomy' | 'leap_step' | 'civil_drift';
  standardBody: string;
  severity: 'critical' | 'high' | 'moderate' | 'macro';
  icon: string;
  description: string;
  operationalImpact: string;
  consequencesOfExceedance: string;
  recommendedMitigation: string;
  accentColor: string; // e.g. "#f43f5e"
  badgeClass: string;
}

export const TIME_SYNC_WARNING_PRESETS: TimeSyncWarningPreset[] = [
  {
    id: 'ptp-power-grid',
    name: 'IEEE 1588 PTP / Smart Grid PMUs',
    shortName: '1 µs (PTP IEEE 1588)',
    thresholdMicros: 1,
    thresholdSeconds: 0.000001,
    category: 'ptp',
    standardBody: 'IEEE 1588-2019 & IEEE C37.118.1',
    severity: 'critical',
    icon: '⚡',
    description: 'Precision Time Protocol (PTP) sub-microsecond synchronization required for synchrophasor Phasor Measurement Units (PMUs) and optical telecom networks.',
    operationalImpact: 'Synchrophasor phase angle calculation error of 1 degree at 60 Hz occurs with just 26 µs drift. Sub-microsecond drift guarantees grid stability monitoring.',
    consequencesOfExceedance: 'False trip commands in high-voltage circuit breakers, miscalculated grid transmission power flow, and risk of regional blackouts during fault conditions.',
    recommendedMitigation: 'Hardware-timestamped IEEE 1588 Grandmaster clocks with dual GNSS disciplined atomic rubidium/cesium oscillators.',
    accentColor: '#f43f5e',
    badgeClass: 'bg-rose-500/20 text-rose-300 border-rose-500/40'
  },
  {
    id: 'telecom-5g-fronthaul',
    name: '5G Telecom TDD Fronthaul',
    shortName: '1.5 µs (5G ITU-T G.8271.1)',
    thresholdMicros: 1.5,
    thresholdSeconds: 0.0000015,
    category: 'telecom',
    standardBody: 'ITU-T G.8271.1 / 3GPP Rel-16 Class C',
    severity: 'critical',
    icon: '📡',
    description: 'Ultra-strict phase and time alignment tolerance between adjacent Time Division Duplex (TDD) base stations and massive MIMO antenna arrays.',
    operationalImpact: '5G beamforming requires antenna elements across neighboring cell sites to be in phase coherence within ±1.5 µs of primary reference time (PRTC-B).',
    consequencesOfExceedance: 'Destructive inter-cell interference, massive MIMO phase cancellation, cross-slot interference, dropped VoIP/data connections, and degraded throughput.',
    recommendedMitigation: 'Deploy ITU-T G.8275.1 PTP Telecom Profile over synchronous Ethernet (SyncE) with boundary clocks at every cell node.',
    accentColor: '#fb7185',
    badgeClass: 'bg-rose-500/20 text-rose-300 border-rose-500/40'
  },
  {
    id: 'mifid-ii-fintech',
    name: 'MiFID II High-Frequency Trading',
    shortName: '100 µs (MiFID II RTS 25)',
    thresholdMicros: 100,
    thresholdSeconds: 0.0001,
    category: 'finance',
    standardBody: 'ESMA RTS 25 / EU MiFID II Directive',
    severity: 'high',
    icon: '🏛️',
    description: 'European Securities and Markets Authority mandate requiring algorithmic and high-frequency trading venues to timestamp orders within 100 µs of UTC.',
    operationalImpact: 'Prevents race conditions, predatory front-running, and enables unambiguous reconstruction of consolidated order books and cross-venue executions.',
    consequencesOfExceedance: 'Immediate regulatory non-compliance fines (up to €5,000,000 or 10% annual turnover), suspension of trading venue licenses, and forensic invalidation of trade sequence order.',
    recommendedMitigation: 'Stratum-1 PTP network cards with PTPv2 hardware timestamping feeding order-matching engines calibrated against UTC(BIPM).',
    accentColor: '#f59e0b',
    badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-500/40'
  },
  {
    id: 'database-truetime',
    name: 'Distributed Cloud DBs (Google TrueTime)',
    shortName: '1,000 µs / 1 ms (TrueTime Epsilon)',
    thresholdMicros: 1000,
    thresholdSeconds: 0.001,
    category: 'database',
    standardBody: 'Google Spanner & CockroachDB Bounded Uncertainty',
    severity: 'high',
    icon: '☁️',
    description: 'Maximum clock uncertainty bound (epsilon ε) for distributed multi-region databases providing external consistency without central locks.',
    operationalImpact: 'Spanner waits out 2ε before committing transactions (commit wait). Lower drift uncertainty directly reduces database write transaction latency.',
    consequencesOfExceedance: 'Transaction stall latency spikes (commit wait explosion), potential stale reads, and split-brain serializability violations if clock uncertainty exceeds safe bounds.',
    recommendedMitigation: 'Deploy synchronized GPS and atomic rubidium time masters in every data center with continuous drift boundary polling.',
    accentColor: '#eab308',
    badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-500/40'
  },
  {
    id: 'public-ntp-jitter',
    name: 'Public Enterprise NTP Internet Bound',
    shortName: '10,000 µs / 10 ms (NTP Boundary)',
    thresholdMicros: 10000,
    thresholdSeconds: 0.01,
    category: 'database',
    standardBody: 'IETF RFC 5905 (NTPv4)',
    severity: 'moderate',
    icon: '🌐',
    description: 'Standard enterprise target accuracy for NTP-synchronized web servers, authentication tokens (TOTP/Kerberos), and logging daemons over wide-area networks.',
    operationalImpact: 'Ensures TLS certificates, multi-factor auth codes, syslog chronological correlation, and distributed caching TTLs remain valid across nodes.',
    consequencesOfExceedance: 'Kerberos ticket rejection (5-minute skew window breached), TOTP 30-second token verification failures, and broken distributed cache invalidations.',
    recommendedMitigation: 'Configure multiple stratum-1 Anycast NTP/NTS servers with Chrony daemon and aggressive root dispersion filters.',
    accentColor: '#38bdf8',
    badgeClass: 'bg-sky-500/20 text-sky-300 border-sky-500/40'
  },
  {
    id: 'iers-dut1-boundary',
    name: 'IERS Astronomical DUT1 Limit',
    shortName: '900,000 µs / 0.9s (IERS DUT1 Limit)',
    thresholdMicros: 900000,
    thresholdSeconds: 0.9,
    category: 'astronomy',
    standardBody: 'ITU-R TF.460 & BIPM IERS Bulletin C',
    severity: 'macro',
    icon: '🌍',
    description: 'The international regulatory boundary for civil UTC. Whenever Earth rotation drift (|UT1 - UTC|) approaches 0.9 seconds (900,000 µs), IERS mandates a leap second insertion.',
    operationalImpact: 'Preserves agreement between atomic clocks and Earth\'s physical day/night orientation for celestial navigation and astronomy.',
    consequencesOfExceedance: 'Triggers mandatory IERS Bulletin C announcement of a +1s (or theoretical -1s) leap second insertion worldwide.',
    recommendedMitigation: 'Leap second smearing (linear slew over 24 hours) or discrete UTC step handling in POSIX tzdata/kernel tables.',
    accentColor: '#06b6d4',
    badgeClass: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
  },
  {
    id: 'leap-second-step',
    name: 'Leap Second Step Discontinuity',
    shortName: '1,000,000 µs / 1.0s (Leap Step)',
    thresholdMicros: 1000000,
    thresholdSeconds: 1.0,
    category: 'leap_step',
    standardBody: 'POSIX / UTC 23:59:60 Specification',
    severity: 'macro',
    icon: '⏱️',
    description: 'The instantaneous 1,000,000 µs step insertion into civil UTC at 23:59:60.',
    operationalImpact: 'Creates a non-monotonic time stamp (the 60th second), causing legacy operating systems and database servers to experience duplicate timestamps or CPU kernel lockups (e.g. Linux 2012 futex bug).',
    consequencesOfExceedance: 'Major internet web outages, airline scheduling glitches, and financial settlement mismatch between continuous-time GPS systems and civil UTC.',
    recommendedMitigation: 'Adopt Google/AWS linear leap second smearing or migrate to CGPM 2035 continuous atomic timescale.',
    accentColor: '#10b981',
    badgeClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
  },
  {
    id: 'initial-1972-baseline',
    name: '1972 Initial UTC Baseline Divergence',
    shortName: '10,000,000 µs / 10.0s (1972 Epoch)',
    thresholdMicros: 10000000,
    thresholdSeconds: 10.0,
    category: 'civil_drift',
    standardBody: 'CCIR Recommendation 460 (1972)',
    severity: 'macro',
    icon: '📜',
    description: 'The initial 10-second divergence between TAI and UTC established on January 1, 1972 when modern UTC with integer leap seconds began.',
    operationalImpact: 'Marks the separation of atomic metrology from astronomical earth rotation.',
    consequencesOfExceedance: 'Civil clocks are permanently offset from atomic time by at least 10 full seconds.',
    recommendedMitigation: 'Reference TAI for uninterrupted physics timestamps and UTC for civil calendar display.',
    accentColor: '#8b5cf6',
    badgeClass: 'bg-purple-500/20 text-purple-300 border-purple-500/40'
  },
  {
    id: 'current-2026-total-drift',
    name: 'Current Total Atomic Lag (2026)',
    shortName: '37,000,000 µs / 37.0s (Current TAI-UTC)',
    thresholdMicros: 37000000,
    thresholdSeconds: 37.0,
    category: 'civil_drift',
    standardBody: 'IERS Bulletin C 68 Active Standard',
    severity: 'macro',
    icon: '🚀',
    description: 'The current accumulated offset between International Atomic Time (TAI) and Coordinated Universal Time (UTC) as of 2026.',
    operationalImpact: 'Civil UTC lags atomic clocks by exactly 37,000,000 microseconds (37 seconds), while GPS lags TAI by 19 seconds and UTC lags GPS by 18 seconds.',
    consequencesOfExceedance: 'High-precision GNSS receivers must calculate TAI/GPS/UTC conversion matrices in real time.',
    recommendedMitigation: 'BIPM CGPM Resolution 4 (2022) to freeze leap seconds by 2035.',
    accentColor: '#a855f7',
    badgeClass: 'bg-purple-500/20 text-purple-300 border-purple-500/40'
  }
];

export interface DriftExceedanceEvaluation {
  isExceeded: boolean;
  driftMicros: number;
  thresholdMicros: number;
  deltaMicros: number;
  exceedanceMultiplier: number;
  severity: 'normal' | 'caution' | 'warning' | 'critical' | 'extreme';
  statusText: string;
  consequencesSummary: string;
  matchedPreset?: TimeSyncWarningPreset;
}

export function evaluateDriftExceedance(driftSeconds: number, thresholdMicros: number): DriftExceedanceEvaluation {
  const driftMicros = Math.round(driftSeconds * 1_000_000);
  const isExceeded = driftMicros > thresholdMicros;
  const deltaMicros = Math.max(0, driftMicros - thresholdMicros);
  const exceedanceMultiplier = thresholdMicros > 0 ? Number((driftMicros / thresholdMicros).toFixed(1)) : 1;

  let severity: 'normal' | 'caution' | 'warning' | 'critical' | 'extreme' = 'normal';
  if (isExceeded) {
    if (thresholdMicros <= 5) {
      severity = 'extreme';
    } else if (thresholdMicros <= 1000) {
      severity = 'critical';
    } else if (thresholdMicros <= 900000) {
      severity = 'warning';
    } else {
      severity = 'caution';
    }
  }

  // Find matching or nearest preset
  const matchedPreset = TIME_SYNC_WARNING_PRESETS.find(p => p.thresholdMicros === thresholdMicros);

  let statusText = 'Within Configured Tolerance';
  let consequencesSummary = 'Time synchronization is compliant with configured microsecond tolerance.';

  if (isExceeded) {
    statusText = `Breaches ${formatMicroseconds(thresholdMicros)} threshold (+${formatMicroseconds(deltaMicros)} excess / ${exceedanceMultiplier.toLocaleString()}×)`;
    if (matchedPreset) {
      consequencesSummary = matchedPreset.consequencesOfExceedance;
    } else if (thresholdMicros < 100) {
      consequencesSummary = 'Exceeds sub-millisecond telecom/PTP/FinTech tolerances. Phase cancelation and regulatory violations active.';
    } else if (thresholdMicros < 1000000) {
      consequencesSummary = 'Exceeds sub-second astronomical and distributed database uncertainty bounds.';
    } else {
      consequencesSummary = 'Exceeds multi-second civil timescale divergence threshold.';
    }
  }

  return {
    isExceeded,
    driftMicros,
    thresholdMicros,
    deltaMicros,
    exceedanceMultiplier,
    severity,
    statusText,
    consequencesSummary,
    matchedPreset
  };
}

export function formatMicroseconds(micros: number): string {
  if (micros >= 1_000_000) {
    const s = micros / 1_000_000;
    return `${s.toFixed(s % 1 === 0 ? 0 : 3)} s (${micros.toLocaleString()} µs)`;
  }
  if (micros >= 1_000) {
    const ms = micros / 1_000;
    return `${ms.toFixed(ms % 1 === 0 ? 0 : 3)} ms (${micros.toLocaleString()} µs)`;
  }
  return `${micros.toLocaleString()} µs`;
}

export function formatDriftPrecision(seconds: number): {
  secondsStr: string;
  millisStr: string;
  microsStr: string;
  nanosStr: string;
} {
  const micros = Math.round(seconds * 1_000_000);
  const millis = seconds * 1_000;
  const nanos = Math.round(seconds * 1_000_000_000);

  return {
    secondsStr: `+${seconds.toFixed(6)} s`,
    millisStr: `+${millis.toLocaleString(undefined, { minimumFractionDigits: 3, maximumFractionDigits: 3 })} ms`,
    microsStr: `+${micros.toLocaleString()} µs`,
    nanosStr: `+${nanos.toLocaleString()} ns`
  };
}
