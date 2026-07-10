import { Outlet } from "react-router-dom"

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-muted/40 dark:bg-slate-950">
      <main className="mx-auto max-w-6xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  )
}
