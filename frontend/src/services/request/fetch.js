// Description: This file contains the fetch function to make HTTP requests.
// It uses the Fetch API to send requests to the server and handle responses.
// It adds the base URL from the environment variable and handles errors.
// It adds authentication headers if needed.
// import { process } from "process";

// const base = process.env.VUE_APP_API_BASE_URL; // e.g. "http://localhost:3000"
// if (!base) {
//   base = "http://localhost:3000"; // Default to localhost if not defined
//   //   throw new Error('VUE_APP_API_BASE_URL is not defined');
// }

const AUTH_TOKEN = "RANDOM_AUTH_TOKEN";
const currentAY = 1;

function appendQueryParams(url, params = {}) {
  const query = new URLSearchParams({
    ...params,
    academicYearId: currentAY,
  }).toString();
  return `${url}?${query}`;
}

async function fetchAPI(url, { method = "GET", body = null } = {}) {
  const fullUrl = appendQueryParams(url);

  const options = {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${AUTH_TOKEN}`,
    },
  };

  if (body && method !== "GET") {
    options.body = JSON.stringify(body);
  }

  const res = await fetch(fullUrl, options);
  const data = await res.json();

  if (!res.ok) throw new Error(data.error || "API request failed");

  return data;
}

export default fetchAPI;
