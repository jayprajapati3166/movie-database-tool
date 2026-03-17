import { Outlet } from "react-router-dom"
import Navbar from "@/components/Navbar"

export default function RootLayout() {
  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      <Navbar />
      <main className="page-shell">
        <Outlet />
      </main>
    </div>
  )
}