import { titles } from "@/mocks/movies"

export async function apiGet(path) {
  if (path.startsWith("/titles/")) {
    const id = path.split("/")[2]
    return titles.find(t => t.id === id)
  }

  if (path.startsWith("/search")) {
    const query = path.split("?q=")[1]
    return titles.filter(t =>
      t.title.toLowerCase().includes(query.toLowerCase())
    )
  }

  throw new Error("Unknown route")
}
