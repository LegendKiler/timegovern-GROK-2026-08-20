/**
 * TimeAndDate Platform Type Definitions
 */

export interface City {
  id: string;
  name: string;
  country: string;
  countryCode: string;
  state?: string;
  timezone: string; // e.g. "America/New_York"
  lat: number;
  lng: number;
  population: number;
  isCapital?: boolean;
}

export interface TimezoneOffsetInfo {
  tzId: string;
  displayName: string;
  abbreviation: string;
  offsetMinutes: number;
  offsetFormatted: string; // e.g. "UTC-5", "UTC+05:30"
  isDst: boolean;
  dstShiftMinutes: number;
  nextTransition?: {
    date: Date;
    type: 'DST_START' | 'DST_END';
    newOffsetFormatted: string;
  };
}

export interface CityTimeData {
  city: City;
  localTime: Date;
  offsetInfo: TimezoneOffsetInfo;
  currentWeatherTempC: number;
  weatherCondition: string;
}

export interface MeetingPlannerParticipant {
  cityId: string;
  city: City;
  customLabel?: string;
}

export interface SharedEvent {
  id: string;
  title: string;
  description?: string;
  targetTimestamp: number; // UTC timestamp
  originCityId: string;
  createdIso: string;
}

export interface PublicHoliday {
  date: string; // "YYYY-MM-DD"
  name: string;
  localName?: string;
  countryCode: string;
  type: 'NATIONAL' | 'REGIONAL' | 'OBSERVANCE';
  description?: string;
}

export interface SunEphemeris {
  sunrise: Date | null;
  sunset: Date | null;
  solarNoon: Date | null;
  civilDawn: Date | null;
  civilDusk: Date | null;
  nauticalDawn: Date | null;
  nauticalDusk: Date | null;
  astronomicalDawn: Date | null;
  astronomicalDusk: Date | null;
  goldenHourStart: Date | null;
  goldenHourEnd: Date | null;
  dayLengthMinutes: number;
  solarAzimuth: number; // degrees
  solarElevation: number; // degrees
}

export interface SolarNoonDetails {
  solarNoonUtc: Date;
  solarNoonLocalStr: string;
  solarNoonUtcStr: string;
  solarDeclinationDeg: number;
  equationOfTimeMinutes: number;
  equationOfTimeFormatted: string;
  longitudeOffsetMinutes: number; // Longitude in time (lng * 4 min)
  standardMeridianDeg: number; // Central meridian of timezone (e.g. -75° for UTC-5)
  meridianOffsetMinutes: number; // Difference between city longitude and standard timezone meridian
  maxSolarElevationDeg: number;
  zenithAngleDeg: number;
  shadowRatio: number; // Shadow length multiplier (shadow length = height * shadowRatio)
  culminationDirection: 'Due South' | 'Due North' | 'Directly Overhead (Zenith)';
  clockNoonDifferenceMinutes: number; // Difference between 12:00:00 clock noon and true solar noon
  clockNoonDifferenceFormatted: string;
  dayOfYear: number;
}

export interface MoonData {
  phaseName: string; // 'New Moon', 'Waxing Crescent', 'First Quarter', 'Waxing Gibbous', 'Full Moon', 'Waning Gibbous', 'Third Quarter', 'Waning Crescent'
  phaseFraction: number; // 0.0 to 1.0
  illuminationPercent: number; // 0 to 100
  moonAgeDays: number; // 0 to 29.53
  moonrise: Date | null;
  moonset: Date | null;
  distanceKm: number;
}

export interface LunarDayInfo {
  day: number;
  date: Date;
  dateStr: string;
  isCurrentMonth: boolean;
  isToday: boolean;
  phaseName: string;
  phaseFraction: number; // 0.0 to 1.0
  illuminationPercent: number; // 0 to 100
  moonAgeDays: number;
  distanceKm: number;
  moonrise: Date | null;
  moonset: Date | null;
  isMajorPhase: boolean;
  majorPhaseType: 'NEW_MOON' | 'FIRST_QUARTER' | 'FULL_MOON' | 'THIRD_QUARTER' | null;
  isSupermoon: boolean;
  isMicroMoon: boolean;
  isBlueMoon: boolean;
  traditionalMoonName: string | null;
  zodiacSign: string;
  zodiacSymbol: string;
}

export interface MajorLunarPhaseEvent {
  phaseType: 'NEW_MOON' | 'FIRST_QUARTER' | 'FULL_MOON' | 'THIRD_QUARTER';
  phaseName: string;
  date: Date;
  dateStr: string;
  exactTimeUtcStr: string;
  exactTimeLocalStr: string;
  illuminationPercent: number;
  distanceKm: number;
  traditionalName?: string;
  isSupermoon?: boolean;
}

export interface MonthlyLunarCalendarData {
  year: number;
  month: number; // 0-11
  monthName: string;
  days: LunarDayInfo[];
  majorPhases: MajorLunarPhaseEvent[];
  traditionalFullMoonName: string;
  totalDaysInMonth: number;
  supermoonCount: number;
}

export interface CelestialBodyPosition {
  name: string;
  azimuth: number; // degrees 0-360
  altitude: number; // degrees -90 to +90
  magnitude: number;
  visible: boolean;
  constellation?: string;
}

export interface EclipseEvent {
  id: string;
  title: string;
  date: string;
  type: 'TOTAL_SOLAR' | 'ANNULAR_SOLAR' | 'PARTIAL_SOLAR' | 'TOTAL_LUNAR' | 'PARTIAL_LUNAR' | 'PENUMBRAL_LUNAR';
  maxEclipseUtc: string;
  description: string;
  pathCoordinates: [number, number][]; // [lat, lng] array for visibility zone
}

export interface WeatherCondition {
  date: string;
  tempC: number;
  tempF: number;
  tempMinC: number;
  tempMaxC: number;
  condition: string; // 'Clear', 'Partly Cloudy', 'Cloudy', 'Rain', 'Thunderstorm', 'Snow'
  iconName: string;
  humidityPercent: number;
  windSpeedKmh: number;
  windDirection: string;
  pressureHpa: number;
  visibilityKm: number;
  uvIndex: number;
}

export interface AlarmItem {
  id: string;
  timeStr: string; // "HH:MM" 24hr format
  label: string;
  enabled: boolean;
  repeatDays: number[]; // 0=Sunday, 1=Monday ... 6=Saturday
  soundPreset: 'classic' | 'digital' | 'chime' | 'marimba';
}

export interface LapItem {
  lapNumber: number;
  lapTimeMs: number;
  totalTimeMs: number;
  diffFromPrevMs: number;
}

export interface TimerItem {
  id: string;
  title: string;
  durationSeconds: number;
  remainingSeconds: number;
  isRunning: boolean;
  soundPreset: 'classic' | 'bell' | 'digital' | 'chime' | 'marimba';
}
