import { createBrowserRouter } from "react-router-dom"
import RootLayout from "@/components/RootLayout"
import Home from "@/pages/Home"
import MovieDetails from "@/pages/MovieDetails"
import NotFound from "@/pages/NotFound"

export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: "movies/:id", element: <MovieDetails /> },
      { path: "*", element: <NotFound /> },
    ],
  },
])
