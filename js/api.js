/**
 * @license MIT
 * @fileoverview All API related stuff like API_key, API_request etc.
 * @copyright amit712singhal 2024 All rights reserved
 * @author amit712singhal <rakshit.singhal@gmail.com>
 */

"use strict";

const API_key = "af0348ed3ad216d028627277b50db13f";

/**
 * Fetch Data From Server
 * @param { string } URL API url
 * @param { Function } callback callback
 */

export const fetchData = function (URL, callback) {
  fetch(`${URL}&appid=${API_key}`)
    .then((res) => res.json())
    .then((data) => callback(data));
};

export const url = {
  currentWeather(lat, lon) {
    return `https://api.openweathermap.org/data/2.5/weather?${lat}&${lon}&units=metric`;
  },
  forecast(lat, lon) {
    return `https://api.openweathermap.org/data/2.5/forecast?${lat}&${lon}&units=metric`;
  },
  airPollution(lat, lon) {
    return `https://api.openweathermap.org/data/2.5/air_pollution?${lat}&${lon}`;
  },
  reverseGeo(lat, lon) {
    return `https://api.openweathermap.org/geo/1.0/reverse?${lat}&${lon}&limit=5`;
  },

  /**
   * @param {string} query Search Query For ex :- "New Delhi", "Thailand"
   */
  geo(query) {
    return `https://api.openweathermap.org/geo/1.0/direct?q=${query}&limit=5`;
  },
};
