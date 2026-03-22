import { Outlet } from "react-router-dom"
import Navbar from "@/components/Navbar"

export default function RootLayout() {
  return (
    <div className="relative min-h-screen bg-background text-foreground transition-colors duration-300">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[24rem] bg-[radial-gradient(circle_at_top,rgba(131,92,246,0.18),transparent_58%)] dark:bg-[radial-gradient(circle_at_top,rgba(147,112,255,0.24),transparent_52%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-18 h-[30rem] bg-[linear-gradient(180deg,rgba(255,255,255,0.06),transparent_38%)] dark:bg-[linear-gradient(180deg,rgba(255,255,255,0.03),transparent_34%)]" />
      <Navbar />
      <main className="page-shell relative z-10">
        <Outlet />
      </main>
    </div>
  )
}