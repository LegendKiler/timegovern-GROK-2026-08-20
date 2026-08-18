import React from 'react';
import { CloudRain, Sun, Wind, Droplets, Thermometer } from 'lucide-react';

export const WeatherPage: React.FC = () => {
  const forecast = [
    { day: 'Mon, Aug 17', temp: '24°C / 15°C', condition: 'Sunny', rain: '0%', wind: '12 km/h' },
    { day: 'Tue, Aug 18', temp: '26°C / 16°C', condition: 'Partly Cloudy', rain: '10%', wind: '14 km/h' },
    { day: 'Wed, Aug 19', temp: '22°C / 14°C', condition: 'Light Rain', rain: '65%', wind: '18 km/h' },
    { day: 'Thu, Aug 20', temp: '21°C / 13°C', condition: 'Scattered Showers', rain: '45%', wind: '15 km/h' },
    { day: 'Fri, Aug 21', temp: '23°C / 15°C', condition: 'Sunny Intervals', rain: '15%', wind: '11 km/h' },
    { day: 'Sat, Aug 22', temp: '25°C / 16°C', condition: 'Clear Skies', rain: '5%', wind: '9 km/h' },
    { day: 'Sun, Aug 23', temp: '27°C / 17°C', condition: 'Warm & Sunny', rain: '0%', wind: '10 km/h' },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white border border-[#d9e2ec] rounded-xl p-5 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[#102a43] font-display flex items-center gap-2">
            <CloudRain className="w-6 h-6 text-[#0056b3]" />
            <span>Global Weather & Atmospheric Forecasts</span>
          </h1>
          <p className="text-xs text-[#627d98] mt-0.5">
            14-day hourly meteorological predictions, wind vectors, barometer readings, and historical climate tables.
          </p>
        </div>
      </div>

      {/* 7-Day Forecast Table */}
      <div className="bg-white border border-[#d9e2ec] rounded-xl p-6 shadow-xs overflow-x-auto">
        <h3 className="font-display font-bold text-base text-[#102a43] mb-4">7-Day Global Weather Outlook</h3>
        <table className="tad-table">
          <thead>
            <tr>
              <th>Day & Date</th>
              <th>High / Low</th>
              <th>Forecast Conditions</th>
              <th>Precipitation</th>
              <th>Wind Speed</th>
            </tr>
          </thead>
          <tbody>
            {forecast.map((item, idx) => (
              <tr key={idx}>
                <td className="font-bold font-display">{item.day}</td>
                <td className="font-mono font-bold text-[#0056b3]">{item.temp}</td>
                <td>{item.condition}</td>
                <td className="font-mono text-blue-600 font-semibold">{item.rain}</td>
                <td className="font-mono">{item.wind}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
