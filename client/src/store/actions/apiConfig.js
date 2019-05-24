/*
    Defines the base API connection URL
*/

/* ================================= SETUP ================================= */

const prodUrl = ""; // NO TRAILING SLASH
const devUrl = "http://localhost:3001"; // server url for local install
const clientUrl = "http://localhost:3000"; // client url for local install

/* ================================ EXPORTS ================================ */

// NODE_ENV is set by heroku when deployed

export const BASE_URL =
  process.env.NODE_ENV === "production" ? prodUrl : devUrl;

export const CLIENT_URL =
  process.env.NODE_ENV === "production" ? prodUrl : clientUrl;

export default BASE_URL;
