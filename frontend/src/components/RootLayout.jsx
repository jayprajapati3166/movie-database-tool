import { Outlet } from "react-router-dom"
import Navbar from "@/components/Navbar"

export default function RootLayout() {
  return (
    <div className="min-h-screen bg-white text-black dark:bg-gray-900 dark:text-white">
      <Navbar />
      <main className="container mx-auto w-full px-4 py-8">
        <Outlet />
      </main>
    </div>
  )
}