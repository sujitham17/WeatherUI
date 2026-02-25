import { useState } from "react";
import axios from "axios";

const weatherMap = {
  0: "Clear Sky",
  1: "Sunny",
  2: "Partly Cloudy",
  3: "Heavy Rain",
  45: "Fog",
  48: "Mist",
  51: "Light Drizzle",
  61: "Rain",
  71: "Snow",
  80: "Rain Showers",
  95: "Thunderstorm"
};

function Weather() {
  const [date, setDate] = useState("");
  const [weatherData, setWeatherData] = useState(null);

  const [year, setYear] = useState("");
  const [monthlyStats, setMonthlyStats] = useState(null);

  const fetchWeather = async () => {
    if (!date) return alert("Select a date");

    try {
      const res = await axios.get(
        `https://archive-api.open-meteo.com/v1/archive?latitude=28.61&longitude=77.23&start_date=${date}&end_date=${date}&hourly=temperature_2m,relative_humidity_2m,surface_pressure,weather_code&timezone=Asia/Kolkata`
      );

      if (!res.data.hourly) {
        alert("No data available");
        return;
      }

      setWeatherData(res.data.hourly);
    } catch {
      alert("Historical data not available for this date");
    }
  };

  const fetchYearlyStats = async () => {
    if (!year) return alert("Enter a year");

    try {
      const res = await axios.get(
        `https://archive-api.open-meteo.com/v1/archive?latitude=28.61&longitude=77.23&start_date=${year}-01-01&end_date=${year}-12-31&daily=temperature_2m_max,temperature_2m_min&timezone=Asia/Kolkata`
      );

      const maxTemps = res.data.daily.temperature_2m_max;
      const minTemps = res.data.daily.temperature_2m_min;
      const dates = res.data.daily.time;

      const monthData = {};

      dates.forEach((d, i) => {
        const month = new Date(d).getMonth();
        if (!monthData[month]) monthData[month] = [];
        monthData[month].push(maxTemps[i], minTemps[i]);
      });

      const stats = Object.keys(monthData).map((m) => {
        const values = monthData[m].sort((a, b) => a - b);
        const min = values[0];
        const max = values[values.length - 1];
        const median =
          values.length % 2 === 0
            ? (values[values.length / 2 - 1] +
                values[values.length / 2]) /
              2
            : values[Math.floor(values.length / 2)];

        return {
          month: new Date(0, m).toLocaleString("default", { month: "short" }),
          min: min.toFixed(1),
          max: max.toFixed(1),
          median: median.toFixed(1)
        };
      });

      setMonthlyStats(stats);
    } catch {
      alert("Year data not available");
    }
  };

  return (
    <div className="weather-card">
      <h1>Delhi Weather Dashboard</h1>

      <div className="controls">
        <input
          type="date"
          max={new Date().toISOString().split("T")[0]}
          onChange={(e) => setDate(e.target.value)}
        />
        <button onClick={fetchWeather}>Get Weather</button>
      </div>

      {weatherData && (
        <div className="output">
          <div className="box">
            <h3>Weather</h3>
            <p>{weatherMap[weatherData.weather_code[12]]}</p>
          </div>
          <div className="box">
            <h3>Temperature</h3>
            <p>{weatherData.temperature_2m[12]} °C</p>
          </div>
          <div className="box">
            <h3>Humidity</h3>
            <p>{weatherData.relative_humidity_2m[12]} %</p>
          </div>
          <div className="box">
            <h3>Pressure</h3>
            <p>{weatherData.surface_pressure[12]} hPa</p>
          </div>
        </div>
      )}

      <h2 className="section-title">Yearly Temperature Statistics</h2>

      <div className="controls">
        <input
          type="number"
          placeholder="Enter year"
          value={year}
          onChange={(e) => setYear(e.target.value)}
        />
        <button onClick={fetchYearlyStats}>Get Stats</button>
      </div>

      {monthlyStats && (
        <div className="stats">
          {monthlyStats.map((m, i) => (
            <div key={i} className="box">
              <h3>{m.month}</h3>
              <p>Min: {m.min} °C</p>
              <p>Max: {m.max} °C</p>
              <p>Median: {m.median} °C</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Weather;