import { useEffect, useState } from "react"
import { CalendarDays, Clock3, Coins, ReceiptText, Star } from "lucide-react"
import { useParams } from "react-router-dom"
import { getMovie, onDataSourceChanged } from "@/features/movies/api"
import { addRecentlyViewedMovie } from "@/features/movies/recentlyViewed"
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

  useEffect(() => {
    if (movie) {
      addRecentlyViewedMovie(movie)
    }
  }, [movie])

  if (loading) return <div className="surface-panel p-8 text-center text-muted-foreground">Loading...</div>;
  if (error) return <div className="surface-panel p-8 text-center text-destructive">{error}</div>;
  if (!movie) return <div className="surface-panel p-8 text-center text-muted-foreground">Movie not found.</div>;

  const releaseYear = movie.release_date
    ? new Date(movie.release_date).getFullYear()
    : (movie.year ?? "N/A")
  const displayRating = rating ?? movie.avg_rating ?? "N/A"
  const synopsis = overview || "No description available."

  const heroMetrics = [
    { label: "Release", value: releaseYear, icon: CalendarDays },
    { label: "Rating", value: `${displayRating} / 10`, icon: Star },
    { label: "Runtime", value: runtime ? `${runtime} mins` : "N/A", icon: Clock3 },
  ]

  const metadata = [
    { label: "Rating", value: `${displayRating} / 10`, icon: Star },
    { label: "Release", value: releaseYear, icon: CalendarDays },
    { label: "Runtime", value: runtime ? `${runtime} mins` : "N/A", icon: Clock3 },
    { label: "Budget", value: formatCurrency(budget ?? movie.budget), icon: Coins },
    { label: "Revenue", value: formatCurrency(revenue ?? movie.revenue), icon: ReceiptText },
  ]

  return (
    <div className="space-y-6 md:space-y-8">
      <section className="surface-panel relative overflow-hidden p-5 sm:p-6 md:p-8">
        <div className="absolute inset-0">
          {posterUrl ? (
            <>
              <div
                className="absolute inset-0 scale-110 bg-cover bg-center opacity-30 blur-2xl"
                style={{ backgroundImage: `url(${posterUrl})` }}
              />
              <div className="absolute inset-0 bg-[linear-gradient(110deg,rgba(8,8,9,0.96),rgba(8,8,9,0.84)_46%,rgba(8,8,9,0.38))]" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(147,112,255,0.22),transparent_34%)]" />
            </>
          ) : (
            <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(118,81,214,0.28),rgba(12,12,12,0.92)_42%,rgba(12,12,12,0.86))]" />
          )}
        </div>

        <div className="relative grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-8">
          <div className="mx-auto w-full max-w-[17.5rem] lg:mx-0">
            {posterUrl ? (
              <img
                src={posterUrl}
                alt={`${movie.title} poster`}
                className="w-full rounded-[1.5rem] border border-white/12 object-cover shadow-[0_32px_80px_-36px_rgba(0,0,0,0.95)]"
              />
            ) : (
              <div className="flex aspect-[2/3] w-full items-center justify-center rounded-[1.5rem] border border-white/12 bg-white/6 px-6 text-center text-sm text-white/65">
                No poster available
              </div>
            )}
          </div>

          <div className="flex flex-col justify-end text-white">
            <span className="eyebrow text-primary">Movie details</span>
            <h1 className="mt-3 max-w-4xl text-5xl leading-none sm:text-6xl md:text-7xl">{movie.title}</h1>
            <div className="mt-5 flex flex-wrap gap-3 text-sm text-white/78">
              {heroMetrics.map(({ label, value, icon: Icon }) => (
                <span
                  key={label}
                  className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/6 px-4 py-2 backdrop-blur-sm"
                >
                  <Icon className={`size-4 ${label === "Rating" ? "fill-primary text-primary" : "text-primary"}`} />
                  {value}
                </span>
              ))}
            </div>
            <p className="mt-6 max-w-2xl text-sm leading-relaxed text-white/72 md:text-base">{synopsis}</p>
            <p className="mt-4 text-xs uppercase tracking-[0.28em] text-white/45">
              Based on {movie.rating_count ?? "N/A"} ratings
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {metadata.map(({ label, value, icon: Icon }) => (
          <div key={label} className="surface-panel p-5">
            <div className="inline-flex rounded-full border border-primary/20 bg-primary/10 p-2 text-primary">
              <Icon className={`size-4 ${label === "Rating" ? "fill-primary text-primary" : "text-primary"}`} />
            </div>
            <dt className="mt-4 text-[0.68rem] font-semibold uppercase tracking-[0.32em] text-muted-foreground">{label}</dt>
            <dd className="mt-2 text-3xl leading-none text-foreground">{value}</dd>
          </div>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.3fr)_340px]">
        <div className="surface-panel p-5 sm:p-6">
          <span className="eyebrow">Overview</span>
          <h2 className="mt-2 text-3xl leading-none sm:text-4xl">Synopsis</h2>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground md:text-base">{synopsis}</p>
        </div>

        <aside className="surface-panel p-5 sm:p-6">
          <span className="eyebrow">Key figures</span>
          <h2 className="mt-2 text-3xl leading-none sm:text-4xl">Summary</h2>
          <dl className="mt-5 space-y-4">
            {metadata.map(({ label, value }) => (
              <div key={label} className="flex items-start justify-between gap-4 border-b border-border/60 pb-4 last:border-b-0 last:pb-0">
                <dt className="text-xs font-semibold uppercase tracking-[0.26em] text-muted-foreground">{label}</dt>
                <dd className="text-right text-sm font-medium text-foreground">{value}</dd>
              </div>
            ))}
            <div className="flex items-start justify-between gap-4 border-b border-border/60 pb-4 last:border-b-0 last:pb-0">
              <dt className="text-xs font-semibold uppercase tracking-[0.26em] text-muted-foreground">Votes</dt>
              <dd className="text-right text-sm font-medium text-foreground">{movie.rating_count ?? "N/A"}</dd>
            </div>
          </dl>
        </aside>
      </section>
    </div>
  )
}
