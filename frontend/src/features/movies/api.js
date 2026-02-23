import { movies } from "@/mocks/movies"

export async function getMovies() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(movies)
    }, 300)
  })
}

export async function getMovie(id) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(
        movies.find(m => m.id == id)
      )
    }, 300)
  })
}
