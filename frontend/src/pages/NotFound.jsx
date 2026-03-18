import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="mx-auto max-w-lg py-12 sm:py-16">
      <div className="surface-panel p-8 text-center sm:p-10">
        <h1 className="mb-2 text-4xl font-semibold">404</h1>
        <p className="mb-6 text-sm text-muted-foreground sm:text-base">Page not found.</p>
        <Link
          to="/"
          className="inline-flex h-10 items-center rounded-md border bg-background px-4 text-sm font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Back to home
        </Link>
      </div>
    </div>
  )
}
