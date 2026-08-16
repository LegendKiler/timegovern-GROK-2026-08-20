import { getTimeScaleOffsets, HISTORICAL_LEAP_SECONDS, IERS_BULLETIN_INFO, CURRENT_TAI_UTC_OFFSET, CURRENT_GPS_UTC_OFFSET, CURRENT_TT_UTC_OFFSET } from '../lib/leapSecondData';

export async function handleLeapSeconds(request: Request): Promise<Response> {
  const now = new Date();
  const offsets = getTimeScaleOffsets(now);

  const payload = {
    status: 'success',
    timestamp: now.toISOString(),
    iers_bulletin: {
      bulletin: IERS_BULLETIN_INFO.bulletinNumber,
      published_date: IERS_BULLETIN_INFO.publishedDate,
      announcement: IERS_BULLETIN_INFO.announcement,
      next_evaluation_epoch: IERS_BULLETIN_INFO.nextOpportunityIso,
      subsequent_evaluation_epoch: IERS_BULLETIN_INFO.subsequentOpportunityIso,
      leap_second_scheduled: IERS_BULLETIN_INFO.leapSecondScheduled,
    },
    offsets: {
      tai_minus_utc_seconds: CURRENT_TAI_UTC_OFFSET, // 37
      gps_minus_utc_seconds: CURRENT_GPS_UTC_OFFSET, // 18
      tt_minus_utc_seconds: CURRENT_TT_UTC_OFFSET,   // 69.184
      dut1_ut1_minus_utc_seconds: offsets.dut1Seconds, // ~0.038
      length_of_day_deviation_ms: offsets.lengthOfDayDeviationMs,
    },
    live_clocks: {
      utc: offsets.utcFormatted,
      tai: offsets.taiFormatted,
      gps: offsets.gpsFormatted,
      tt: offsets.ttFormatted,
      ut1: offsets.ut1Formatted,
    },
    cgpm_resolution: {
      title: 'CGPM Resolution 4 (2022) on the extension of the maximum tolerance for (UT1 - UTC)',
      year_effective: 2035,
      target_date: IERS_BULLETIN_INFO.cgpm2035HorizonIso,
      summary: 'The General Conference on Weights and Measures voted to relax the 0.9 second UT1-UTC limit by 2035, eliminating frequent leap seconds in favor of atomic time continuity.',
    },
    historical_count: HISTORICAL_LEAP_SECONDS.length,
    historical_leap_seconds: HISTORICAL_LEAP_SECONDS,
  };

  return new Response(JSON.stringify(payload, null, 2), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=10, s-maxage=30',
      'Access-Control-Allow-Origin': '*',
    },
  });
}
