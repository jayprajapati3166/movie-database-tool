import { createBrowserRouter } from "react-router-dom"
import Home from "@/pages/Home"
import MovieDetails from "@/pages/MovieDetails"
import NotFound from "@/pages/NotFound"

export const router = createBrowserRouter([
  { path: "/", element: <Home /> },
  { path: "/movies/:id", element: <MovieDetails /> },
  { path: "*", element: <NotFound /> },
])
