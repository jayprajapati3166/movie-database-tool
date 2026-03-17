import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { getMovie, onDataSourceChanged } from "@/features/movies/api"
import { fetchMoviePoster, fetchMovieOverview } from "@/lib/tmdbService";

export default function MovieDetails() {
  const { id } = useParams()
  const [movie, setMovie] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [sourceTick, setSourceTick] = useState(0)
  const [posterUrl, setPosterUrl] = useState(null);
  const [overview, setOverview] = useState("");
  const [rating, setRating] = useState(null);
  const [runtime, setRuntime] = useState(null)
  const [budget, setBudget] = useState(null)
  const [revenue, setRevenue] = useState(null)

  const formatCurrency = (value) => {
    const amount = Number(value)

    if (!Number.isFinite(amount) || amount <= 0) {
      return "N/A"
    }

    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(amount)
  }

  useEffect(() => {
    const unsubscribe = onDataSourceChanged(() => {
      setSourceTick((value) => value + 1);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    const loadMovie = async () => {
      setLoading(true);
      setError("");

      try {
        const data = await getMovie(id);
        setMovie(data);
      } catch (err) {
        console.error("Failed to fetch movie:", err);
        setError("Failed to fetch movie from backend.");
      } finally {
        setLoading(false);
      }
    };

    loadMovie();
  }, [id, sourceTick]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const releaseYear = movie.release_date
          ? new Date(movie.release_date).getFullYear()
          : movie.year;

        const url = await fetchMoviePoster(movie.title, releaseYear);
        const data = await fetchMovieOverview(movie.title, releaseYear);

        setPosterUrl(url);
        setOverview(data?.overview ?? "No description available.");
        setRating(data?.rating ? Number(data.rating).toFixed(1) : (movie.avg_rating ?? "N/A"));
        setRuntime(data?.runtime ?? movie.runtime);
        setBudget(data?.budget ?? movie.budget);
        setRevenue(data?.revenue ?? movie.revenue);
      } catch (fetchError) {
        console.error("Fetch failed", fetchError)
      }
    };

    if (movie) {
      fetchData()
    }
  }, [movie])

  if (loading) return <div className="surface-panel p-8 text-center text-muted-foreground">Loading...</div>;
  if (error) return <div className="surface-panel p-8 text-center text-destructive">{error}</div>;
  if (!movie) return <div className="surface-panel p-8 text-center text-muted-foreground">Movie not found.</div>;

  const releaseYear = movie.release_date
    ? new Date(movie.release_date).getFullYear()
    : (movie.year ?? "N/A")
  const displayRating = rating ?? movie.avg_rating ?? "N/A"

  const metadata = [
    { label: "Rating", value: `${displayRating} / 10` },
    { label: "Release", value: releaseYear },
    { label: "Runtime", value: runtime ? `${runtime} mins` : "N/A" },
    { label: "Budget", value: formatCurrency(budget ?? movie.budget) },
    { label: "Revenue", value: formatCurrency(revenue ?? movie.revenue) },
  ]

  return (
    <div className="space-y-6 md:space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold md:text-4xl">{movie.title}</h1>
      </header>

      <section className="surface-panel p-4 sm:p-6">
        <div className="flex flex-col gap-6 md:flex-row">
          <div className="mx-auto w-full max-w-xs shrink-0 md:mx-0">
            {posterUrl ? (
              <img
                src={posterUrl}
                alt={`${movie.title} poster`}
                className="w-full rounded-lg border object-cover shadow-sm"
              />
            ) : (
              <div className="flex aspect-[2/3] w-full items-center justify-center rounded-lg border bg-muted text-sm text-muted-foreground">
                No poster available
              </div>
            )}
          </div>

          <dl className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2">
            {metadata.map((item) => (
              <div key={item.label} className="rounded-lg border bg-background p-3 sm:p-4">
                <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{item.label}</dt>
                <dd className="mt-1 text-base font-medium text-foreground">{item.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="surface-panel p-4 sm:p-6">
        <h2 className="text-2xl font-semibold md:text-3xl">Overview</h2>
        <p className="mt-3 text-sm text-muted-foreground md:text-base">{overview || "No description available."}</p>
        <p className="mt-4 text-sm text-muted-foreground">Ratings: {movie.rating_count ?? "N/A"} votes</p>
      </section>
    </div>
  )
}
