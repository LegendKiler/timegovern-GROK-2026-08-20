import { WeatherCondition } from '../types';

/**
 * Weather Engine generating realistic climatological current, forecast, and historical weather data
 */

const CONDITIONS = [
  'Clear',
  'Partly Cloudy',
  'Cloudy',
  'Light Rain',
  'Moderate Rain',
  'Thunderstorm',
  'Sunny'
];

/**
 * Generate current weather for a city based on latitude and current month
 */
export function getCurrentWeatherForCity(lat: number, cityName: string): WeatherCondition {
  const month = new Date().getMonth();
  // Simple latitude seasonal model
  const isNorthern = lat >= 0;
  const seasonalMultiplier = isNorthern ? Math.sin(((month - 3) / 12) * 2 * Math.PI) : -Math.sin(((month - 3) / 12) * 2 * Math.PI);
  const baseTempC = Math.round(22 - Math.abs(lat) * 0.35 + seasonalMultiplier * 12);

  const hash = cityName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const condition = CONDITIONS[hash % CONDITIONS.length];

  return {
    date: new Date().toISOString().split('T')[0],
    tempC: baseTempC,
    tempF: Math.round((baseTempC * 9) / 5 + 32),
    tempMinC: baseTempC - 4,
    tempMaxC: baseTempC + 5,
    condition,
    iconName: condition.toLowerCase().includes('rain') ? 'CloudRain' : condition.toLowerCase().includes('cloud') ? 'Cloud' : 'Sun',
    humidityPercent: 45 + (hash % 35),
    windSpeedKmh: 10 + (hash % 20),
    windDirection: ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'][hash % 8],
    pressureHpa: 1012 + (hash % 10) - 5,
    visibilityKm: 10,
    uvIndex: Math.max(1, Math.min(11, Math.round(6 + seasonalMultiplier * 4)))
  };
}

/**
 * Generate 14-day weather forecast
 */
export function get14DayForecast(lat: number, cityName: string): WeatherCondition[] {
  const forecast: WeatherCondition[] = [];
  const base = getCurrentWeatherForCity(lat, cityName);
  const today = new Date();

  for (let i = 0; i < 14; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const dayIso = d.toISOString().split('T')[0];

    const tempVariation = Math.sin(i * 0.8) * 3 + (i % 3 === 0 ? -2 : 1);
    const dayTempC = Math.round(base.tempC + tempVariation);
    const hash = (cityName.length + i * 17) % CONDITIONS.length;
    const cond = CONDITIONS[hash];

    forecast.push({
      date: dayIso,
      tempC: dayTempC,
      tempF: Math.round((dayTempC * 9) / 5 + 32),
      tempMinC: dayTempC - 4,
      tempMaxC: dayTempC + 4,
      condition: cond,
      iconName: cond.toLowerCase().includes('rain') ? 'CloudRain' : cond.toLowerCase().includes('cloud') ? 'Cloud' : 'Sun',
      humidityPercent: Math.max(30, Math.min(95, base.humidityPercent + (i % 5) * 3 - 5)),
      windSpeedKmh: Math.max(5, base.windSpeedKmh + (i % 4) * 2 - 3),
      windDirection: ['NE', 'E', 'SE', 'SW', 'NW', 'N'][i % 6],
      pressureHpa: base.pressureHpa + (i % 3) - 1,
      visibilityKm: 10,
      uvIndex: Math.max(1, Math.min(11, base.uvIndex + (i % 2 === 0 ? 1 : -1)))
    });
  }

  return forecast;
}

/**
 * Lookup historical weather by city and date
 */
export function getHistoricalWeather(cityName: string, lat: number, dateStr: string): WeatherCondition {
  const dateObj = new Date(dateStr);
  const month = dateObj.getMonth();
  const year = dateObj.getFullYear();

  const isNorthern = lat >= 0;
  const seasonalMultiplier = isNorthern ? Math.sin(((month - 3) / 12) * 2 * Math.PI) : -Math.sin(((month - 3) / 12) * 2 * Math.PI);
  const baseTempC = Math.round(20 - Math.abs(lat) * 0.35 + seasonalMultiplier * 14 + (year % 3));

  const hash = (cityName.length + dateObj.getDate() + month) % CONDITIONS.length;
  const condition = CONDITIONS[hash];

  return {
    date: dateStr,
    tempC: baseTempC,
    tempF: Math.round((baseTempC * 9) / 5 + 32),
    tempMinC: baseTempC - 5,
    tempMaxC: baseTempC + 4,
    condition,
    iconName: condition.toLowerCase().includes('rain') ? 'CloudRain' : condition.toLowerCase().includes('cloud') ? 'Cloud' : 'Sun',
    humidityPercent: 50 + (hash * 5) % 40,
    windSpeedKmh: 12 + (hash * 3) % 15,
    windDirection: ['N', 'E', 'S', 'W', 'NW', 'SE'][hash % 6],
    pressureHpa: 1013,
    visibilityKm: 10,
    uvIndex: Math.max(1, Math.round(5 + seasonalMultiplier * 3))
  };
}
