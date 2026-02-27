export async function apiGet(path) {
  const res = await fetch(path)

  if (!res.ok) {
    throw new Error(`GET ${path} failed (${res.status})`)
  }

  return res.json()
}
