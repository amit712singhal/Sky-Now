/**
 * @license MIT
 * @copyright amit712singhal 2024 All rights reserved
 * @author amit712singhal <rakshit.singhal@gmail.com>
 */

"use strict";

import { fetchData, url } from "./api.js";
import * as module from "./module.js";

/**
 *  Add event listener on multiple elements
 * @param {NodeList} elements Elements node array
 * @param {string} eventType Event Type e.g.; "click", "mouseover"
 * @param {Function} callback Callback function
 */
const addEventOnElements = function (elements, eventType, callback) {
  for (const element of elements) element.addEventListener(eventType, callback);
};

/**
 * Toggle Search in mobile devices
 */
const searchView = document.querySelector("[data-search-view]");
const searchTogglers = document.querySelectorAll("[data-search-toggler]");

const toggleSearch = () => searchView.classList.toggle("active");
addEventOnElements(searchTogglers, "click", toggleSearch);

/**
 * SEARCH INTEGRATION
 */

const searchField = document.querySelector("[data-search-field]");
const searchResult = document.querySelector("[data-search-result]");

let searchTimeout = null;
const searchTimeoutDuration = 500;

searchField.addEventListener("input", function () {
  searchTimeout ?? clearTimeout(searchTimeout);
  if (!searchField.value) {
    searchResult.classList.remove("active");
    searchResult.innerHTML = "";
    searchField.classList.remove("searching");
  } else {
    searchField.classList.add("searching");
  }

  if (searchField.value) {
    searchTimeout = setTimeout(() => {
      fetchData(url.geo(searchField.value), function (locations) {
        searchField.classList.remove("searching");
        searchResult.classList.add("active");
        searchResult.innerHTML = `
          <ul class="view-list" data-search-list>
          </ul>
        `;

        const /** {NodeList} | [] */ items = [];
        for (const { name, lat, lon, country, state } of locations) {
          const searchItem = document.createElement("li");
          searchItem.classList.add("view-item");
          searchItem.innerHTML = `
            <span class="m-icon">location_on</span>
            <div>
              <p class="item-title">${name}</p>
              <p class="label-2 item-subtitle">${state || ""} ${country}</p>
            </div>
            <a href="#/weather?lat=${lat}&lon=${lon}" class="item-link has-state" aria-label="${name} weather" data-search-toggler></a>
          `;

          searchResult
            .querySelector("[data-search-list]")
            .appendChild(searchItem);
          items.push(searchItem.querySelector("[data-search-toggler]"));
        }

        addEventOnElements(items, "click", function () {
          toggleSearch();
          searchResult.classList.remove("active");
        });
      });
    }, searchTimeoutDuration);
  }
});

const container = document.querySelector("[data-container]");
const loading = document.querySelector("[data-loading]");
const currentLocationBtn = document.querySelector(
  "[data-current-location-btn]"
);
const errorContent = document.querySelector("[data-error-content]");

/**
 * Render all weather data in html page
 *
 * @param {number} lat Latitude
 * @param {number} lon Longitude
 */
export const updateWeather = function (lat, lon) {
  // loading.style.display = "grid";
  // container.style.overflowY = "hidden";
  // container.classList.contains("fade-in");
  errorContent.style.display = "none";

  const currentWeatherSection = document.querySelector(
    "[data-current-weather]"
  );
  const highlightSection = document.querySelector("[data-highlights]");
  const hourlySection = document.querySelector("[data-hourly-forecast]");
  const forecastSection = document.querySelector("[data-5-day-forecast]");

  currentWeatherSection.innerHTML = "";
  highlightSection.innerHTML = "";
  hourlySection.innerHTML = "";
  forecastSection.innerHTML = "";

  if (window.location.hash === "#/current-location") {
    currentLocationBtn.setAttribute("disabled", "");
  } else {
    currentLocationBtn.removeAttribute("disabled");
  }

  /**
   * Current Weather Section
   */

  fetchData(url.currentWeather(lat, lon), function (currentWeather) {
    const {
      weather,
      dt: dateUnix,
      sys: { sunrise: sunriseUnixUTC, sunset: sunsetUnixUTC },
      main: { temp, feels_like, pressure, humidity },
      visibility,
      timezone,
    } = currentWeather;
    const [{ description, icon }] = weather;
    const card = document.createElement("div");
    card.classList.add("card", "card-lg", "current-weather-card");

    card.innerHTML = `
      <h2 class="title-2 card-title">Now</h2>
      <div class="weapper">
        <p class="heading">${parseInt(temp)}&deg;<sup>c</sup></p>
        <img
          src="./public/images/weather_icons/${icon}.png"
          width="64"
          height="64"
          alt="${description}"
          class="weather-icon"
        />
      </div>

      <p class="body-3">${description}</p>

      <ul class="meta-list">
        <li class="meta-item">
          <span class="m-icon">calendar_today</span>
          <p class="title-3 meta-text">${module.getDate(dateUnix, timezone)}</p>
        </li>
        <li class="meta-item">
          <span class="m-icon">location_on</span>
          <p class="title-3 meta-text" data-location></p>
        </li>
      </ul>
    `;

    fetchData(url.reverseGeo(lat, lon), function ([{ name, country }]) {
      card.querySelector("[data-location]").innerHTML = `${name}, ${country}`;
    });
    currentWeatherSection.appendChild(card);

    /**
     * Today's Highlights
     */
    fetchData(url.airPollution(lat, lon), function (airPollution) {
      const [
        {
          main: { aqi },
          components: { no2, o3, so2, pm2_5 },
        },
      ] = airPollution.list;

      const card = document.createElement("div");
      card.classList.add("card", "card-lg");

      card.innerHTML = `
      <h2 class="title-2" id="highlights-label">Today's Highlights</h2>
      <div class="highlight-list">
        <div class="card card-sm highlight-card one">
          <h3 class="title-3">Air Quality Index</h3>
          <div class="wrapper">
            <span class="m-icon">air</span>
            <ul class="card-list">
              <li class="card-item">
                <p class="title-1">${Number(pm2_5).toPrecision(3)}</p>
                <p class="label-1">PM<sub>2.5</sub></p>
              </li>
              <li class="card-item">
                <p class="title-1">${Number(so2).toPrecision(3)}</p>
                <p class="label-1">SO<sub>2</sub></p>
              </li>
              <li class="card-item">
                <p class="title-1">${Number(no2).toPrecision(3)}</p>
                <p class="label-1">NO<sub>2</sub></p>
              </li>
              <li class="card-item">
                <p class="title-1">${Number(o3).toPrecision(3)}</p>
                <p class="label-1">O<sub>3</sub></p>
              </li>
            </ul>
          </div>
          <span class="badge aqi-${aqi} label-${aqi}" title="${
        module.aqiText[aqi].message
      }">
            ${module.aqiText[aqi].level}
          </span>
        </div>

        <div class="card card-sm highlight-card two">
          <h3 class="title-3">Sunrise & Sunset</h3>
          <div class="card-list">
            <div class="card-item">
              <span class="m-icon">clear_day</span>
              <div>
                <p class="label-1">Sunrise</p>
                <p class="title-1">${module.getTime(
                  sunriseUnixUTC,
                  timezone
                )}</p>
              </div>
            </div>
            <div class="card-item">
              <span class="m-icon">clear_night</span>
              <div>
                <p class="label-1">Sunset</p>
                <p class="title-1">${module.getTime(
                  sunsetUnixUTC,
                  timezone
                )}</p>
              </div>
            </div>
          </div>
        </div>

        <div class="card card-sm highlight-card">
          <h3 class="title-3">Humidity</h3>
          <div class="wrapper">
            <span class="m-icon">humidity_percentage</span>
            <p class="title-1">${humidity}<sub>%</sub></p>
          </div>
        </div>

        <div class="card card-sm highlight-card">
          <h3 class="title-3">Pressure</h3>
          <div class="wrapper">
            <span class="m-icon">airwave</span>
            <p class="title-1">${pressure}<sub>hPa</sub></p>
          </div>
        </div>

        <div class="card card-sm highlight-card">
          <h3 class="title-3">Visibility</h3>
          <div class="wrapper">
            <span class="m-icon">visibility</span>
            <p class="title-1">${visibility / 1000}<sub>km</sub></p>
          </div>
        </div>

        <div class="card card-sm highlight-card">
          <h3 class="title-3">Feels Like</h3>
          <div class="wrapper">
            <span class="m-icon">thermostat</span>
            <p class="title-1">${parseInt(feels_like)}&deg;<sup>c</sup></p>
          </div>
        </div>
      </div>
      `;
      highlightSection.appendChild(card);
    });
  });
};

export const error404 = function () {};
