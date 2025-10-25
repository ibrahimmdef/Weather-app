import express from "express";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config(); // Load API key from .env

const app = express();
const port = 3000;

app.use(express.static("public")); // Serve static files
app.use(express.urlencoded({ extended: true })); // Parse form data
app.set("view engine", "ejs"); // Set EJS as templating engine

const apiKey = process.env.API_KEY; // OpenWeatherMap API key

// 🌤 Forecast API: fetch 4-day forecast
async function forecastApi(lat, lon, apiKey) {
  const dailyApi = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
  const resData = await axios.get(dailyApi);
  const response = resData.data;
  const dailyData = {};

  for (let i = 0; i < response.list.length; i++) {
    const item = response.list[i];
    const date = new Date(item.dt * 1000).toLocaleDateString("en-us", {
      day: "numeric",
      month: "numeric",
    });
    const today = new Date().toLocaleDateString("en-us", {
      day: "numeric",
      month: "numeric",
    });
    if (date === today) continue; // skip today

    if (!dailyData[date])
      dailyData[date] = {
        temps: [],
        icons: [],
        descriptions: [],
      };

    dailyData[date].temps.push(item.main.temp);
    dailyData[date].icons.push(item.weather[0].icon);
    dailyData[date].descriptions.push(item.weather[0].description);
  }

  // Prepare 4-day forecast array
  const dates = Object.keys(dailyData);

  const forecast = [];

  for (let i = 0; i < dates.length; i++) {
    if (forecast.length === 4) break;

    const date = dates[i];

    const data = dailyData[date];

    const temps = data.temps;

    const maxTemps = Math.max(...temps).toFixed(0);

    const minTemps = Math.min(...temps).toFixed(0);

    const middleIndex = Math.floor(data.icons.length / 2);

    forecast.push({
      weeklyDate: new Date(date).toLocaleDateString("en-us", {
        weekday: "long",
        month: "long",
        day: "numeric",
      }),
      icon: `https://openweathermap.org/img/wn/${data.icons[middleIndex]}@2x.png`,
      tempMax: maxTemps,
      tempMin: minTemps,
      description: data.descriptions[middleIndex],
    });
  }

  return forecast;
}

// Main weather: current weather + forecast
async function getWeather(city) {
  try {
    const API = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
    const response = await axios.get(API);

    const { lon, lat } = response.data.coord;
    const forecast = await forecastApi(lat, lon, apiKey);

    return {
      time: new Date(response.data.dt * 1000).toLocaleDateString("en-us", {
        weekday: "long",
        day: "numeric",
        month: "long",
        hour: "2-digit",
        minute: "2-digit",
      }),
      todayIcon: `https://openweathermap.org/img/wn/${response.data.weather[0].icon}@4x.png`,
      temperature: response.data.main.temp.toFixed(0),
      feels: response.data.main.feels_like.toFixed(0),
      description: response.data.weather[0].description,
      city: response.data.name,
      country: response.data.sys.country,
      humidity: response.data.main.humidity,
      windSpeed: response.data.wind.speed,
      sunriseTime: new Date(
        response.data.sys.sunrise * 1000
      ).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      sunsetTime: new Date(response.data.sys.sunset * 1000).toLocaleTimeString(
        "en-US",
        {
          hour: "2-digit",
          minute: "2-digit",
        }
      ),
      clouds: response.data.clouds.all,
      lat,
      lon,
      pressure: response.data.main.pressure,
      forecast,
    };
  } catch (error) {
    console.error("Weather API Error:", error.message);
    return { error: "City not found or API error" }; // return error to template
  }
}

app.get("/", async (req, res) => {
  const data = await getWeather("London"); // default city
  res.render("index", data);
});

app.post("/", async (req, res) => {
  try {
    const data = await getWeather(req.body.city); // user input city
    res.render("index", data);
  } catch (error) {
    console.error(error.message);
  }
});

app.listen(port, () => console.log(`Server is running on port ${port}`));
