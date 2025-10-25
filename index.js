import express from "express";

import axios from "axios";

import dotenv from "dotenv";

dotenv.config();

const app = express();

const port = 3000;

app.use(express.static("public"));

app.use(express.urlencoded(true));

app.set("view engine", "ejs");

const apiKey = process.env.API_KEY;

async function getWeather(city) {
  const API = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
  const response = await axios.get(API);

  const lon = response.data.coord.lon;

  const lat = response.data.coord.lat;

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
    sunriseTime: new Date(response.data.sys.sunrise * 1000).toLocaleTimeString(
      "en-US",
      {
        hour: "2-digit",
        minute: "2-digit",
      }
    ),
    sunsetTime: new Date(response.data.sys.sunset * 1000).toLocaleTimeString(
      "en-US",
      {
        hour: "2-digit",
        minute: "2-digit",
      }
    ),
    clouds: response.data.clouds.all,
    pressure: response.data.main.pressure,
  };
}

app.get("/", async (req, res) => {
  const data = await getWeather("London");
  res.render("index", data);
});

app.post("/", async (req, res) => {
  const data = await getWeather(req.body.city);
  res.render("index", data);
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
