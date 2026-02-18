import { mockMovies } from "@/mocks/movies"

export async function getMovies() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockMovies)
    }, 300)
  })
}

export async function getMovie(id) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(
        mockMovies.find(m => m.movie_id === Number(id))
      )
    }, 300)
  })
}
