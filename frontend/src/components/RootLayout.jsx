import { Outlet } from "react-router-dom"
import Navbar from "@/components/Navbar"

export default function RootLayout() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="page-shell">
        <Outlet />
      </main>
    </div>
  )
}