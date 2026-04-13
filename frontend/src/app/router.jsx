import { createBrowserRouter } from "react-router-dom"
import RootLayout from "@/components/RootLayout"
import Home from "@/pages/Home"
import MovieDetails from "@/pages/MovieDetails"
import NotFound from "@/pages/NotFound"
import RecentlyViewed from "@/pages/RecentlyViewed"
import Auth from "@/pages/Auth"

export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: "auth", element: <Auth /> },
      { path: "recently-viewed", element: <RecentlyViewed /> },
      { path: "movies/:id", element: <MovieDetails /> },
      { path: "*", element: <NotFound /> },
    ],
  },
])
