import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="py-16 text-center">
      <h1 className="text-3xl font-bold mb-3">404</h1>
      <p className="text-gray-600 dark:text-gray-300 mb-6">Page not found.</p>
      <Link to="/" className="text-indigo-600 dark:text-indigo-400 hover:underline">
        Back to home
      </Link>
    </div>
  )
}
