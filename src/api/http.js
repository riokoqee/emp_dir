export const API_URL = "http://localhost:8080";

export async function apiGet(path) {
  const res = await fetch(API_URL + path);
  return res.json();
}

export async function apiPost(path, body) {
  const res = await fetch(API_URL + path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  return res.json();
}

export async function apiUpload(path, file) {
  const form = new FormData();
  form.append("file", file);

  const res = await fetch(API_URL + path, {
    method: "POST",
    body: form
  });

  return res.json();
}
