/**
 * @license MIT
 * @fileoverview Manage all routes
 * @copyright amit712singhal 2024 All rights reserved
 * @author amit712singhal <rakshit.singhal@gmail.com>
 */

"use strict";

import { updateWeather, error404 } from "./app.js";

const defaultLocation = "#/weather?lat=28.6138954&lon=77.2090057"; // New Delhi

const currentLocation = function () {
  window.navigator.geolocation.getCurrentPosition(
    (res) => {
      const { latitude, longitude } = res.coords;
      updateWeather(`lat=${latitude}`, `lon=${longitude}`);
    },
    (err) => {
      window.location.hash = defaultLocation;
    }
  );
};

/**
 * @param {string} query Searched Query
 */
const searchedLocation = (query) => updateWeather(...query.split("&"));
//updateWeather("lat=28.6138954", "lon=77.2090057")

const routes = new Map([
  ["/current-location", currentLocation],
  ["/weather", searchedLocation],
]);

const checkHash = function () {
  const requestURL = window.location.hash.slice(1);
  const [route, query] = requestURL.includes
    ? requestURL.split("?")
    : [requestURL];

  routes.get(route) ? routes.get(route)(query) : error404();
};

window.addEventListener("hashchange", checkHash);

window.addEventListener("load", function () {
  if (!window.location.hash) {
    window.location.hash = "#/current-location";
  } else {
    checkHash();
  }
} );
