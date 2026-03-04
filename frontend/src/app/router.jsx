import { createBrowserRouter } from "react-router-dom"
import Home from "@/pages/Home"
import MovieDetails from "@/pages/MovieDetails"
import NotFound from "@/pages/NotFound"
import { Outlet } from  "react-router-dom"
import MovieCard from "@/components/MovieCard"
import { Link } from "react-router-dom"
import Navbar from "@/components/Navbar"
 
export const router = createBrowserRouter([
  { 
    path: "/",
    element: <Layout />, // <--
    children: [
      {index: true, element: <Home /> },
      { path: "/movies/:id", element: <MovieDetails /> },
      { path: "*", element: <NotFound /> },
    ]
  }
])

export default function Layout() {
  return (
    <>
     <div className="min-h-screen bg-white text-black dark:bg-gray-900 dark:text-white">
       <header><Navbar /></header>

       <main>
        <Outlet />
       </main>

     </div>
    </>
  )
}