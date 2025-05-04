// // src/services/api/http.js
// const base = process.env.VUE_APP_API_BASE_URL  // e.g. "http://localhost:3000"
// async function request(path, opts) {
//   const res = await fetch(`${base}${path}`, opts)
//   if (!res.ok) throw new Error(res.statusText)
//   return await res.json()
// }
// export default {
//   student: {
//     getAll: ()    => request('/students',      { method: 'GET' }),
//     create: (d)   => request('/students',      { method: 'POST', body: JSON.stringify(d), headers:{'Content-Type':'application/json'} }),
//     update: (d)   => request(`/students/${d.id}`, { method: 'PUT', body: JSON.stringify(d), headers:{'Content-Type':'application/json'} }),
//     delete: (id)  => request(`/students/${id}`,   { method: 'DELETE' }),
//   },
//   fee: {
//     getAll: ()    => request('/fees',      { method: 'GET' }),
//     create: (d)   => request('/fees',      { method: 'POST', body: JSON.stringify(d), headers:{'Content-Type':'application/json'} }),
//     // …etc…
//   }
// }
import fetchAPI from "../request/fetch";

const BASE_URL = "http://localhost:3000/api/crud";

export default {
  student: {
    getAll: () => fetchAPI(`${BASE_URL}/students`),
    create: (data) =>
      fetchAPI(`${BASE_URL}/students`, { method: "POST", body: data }),
    update: (id, data) =>
      fetchAPI(`${BASE_URL}/students/${id}`, { method: "PUT", body: data }),
    delete: (id) =>
      fetchAPI(`${BASE_URL}/students/${id}`, { method: "DELETE" }),
  },
  fee: {
    getAll: () => fetchAPI(`${BASE_URL}/fees`),
    create: (data) =>
      fetchAPI(`${BASE_URL}/fees`, { method: "POST", body: data }),
    update: (id, data) =>
      fetchAPI(`${BASE_URL}/fees/${id}`, { method: "PUT", body: data }),
    delete: (id) => fetchAPI(`${BASE_URL}/fees/${id}`, { method: "DELETE" }),
  },
  getDropdownLabels: (entity) =>
    fetchAPI(`${BASE_URL}/dropdown`, { method: "POST", body: entity }),
};
