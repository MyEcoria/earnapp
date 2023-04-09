const axios = require('axios');

const baseUrl = 'https://earnapp.com/dashboard/api';
const appid = 'earnapp';
const version = '1.370.150';

const configEarnapp = require('../config/earnapp.json');

const cookies = {
  "oauth-refresh-token": configEarnapp["oauth-refresh-token"],
  "auth-method": configEarnapp["auth-method"],
  "auth": 1,
  "oauth-token": configEarnapp["oauth-token"],
  "xsrf-token": configEarnapp["xsrf-token"]
};

function devices() {
  const url = `${baseUrl}/devices?appid=${appid}&version=${version}`;
  return axios.get(url, { headers: { Cookie: getCookies() } }).then(response => response.data);
}

function user() {
  const url = `${baseUrl}/user_data?appid=${appid}&version=${version}`;
  return axios.get(url, { headers: { Cookie: getCookies() } }).then(response => response.data);
}

function money() {
  const url = `${baseUrl}/money?appid=${appid}&version=${version}`;
  return axios.get(url, { headers: { Cookie: getCookies() } }).then(response => response.data);
}

function add(uuid) {
  const url = `${baseUrl}/link_device?appid=${appid}&version=${version}`;
  const data = { uuid: uuid };
  return axios.post(url, data, { headers: { Cookie: getCookies(), 'xsrf-token': configEarnapp["xsrf-token"] } }).then(response => response.data);
}

function getCookies() {
  const cookieStrings = [];
  for (const [cookieName, cookieValue] of Object.entries(cookies)) {
    cookieStrings.push(`${cookieName}=${cookieValue}`);
  }
  return cookieStrings.join('; ');
}

module.exports = {
  devices,
  user,
  money,
  add,
};

