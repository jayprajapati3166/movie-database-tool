import { useEffect, useState } from "react";

const movies = [
  {
    title: "Interstellar",
    description: "Ex-pilot Cooper joins a NASA mission to find a new home planet through a wormhole, as Earth faces extinction from agricultural blight.",
    image: "https://image.tmdb.org/t/p/original/rAiYTfKGqDCRIIqo664sY9XZIvQ.jpg",
  },
  {
    title: "Inception",
    description: "Dom Cobb, a professional thief who steals corporate secrets through shared dream technology.",
    image: "https://image.tmdb.org/t/p/original/s3TBrRGB1iav7gFOCNx3H31MoES.jpg",
  },
  {
  title: "Dune",
  description: "A battle for control of a desert planet.",
  image: "https://image.tmdb.org/t/p/w1280/d5NXSklXo0qyIYkgV94XAgMIckC.jpg",
},
  {
    title: "The Dark Knight",
    description: "Batman faces the Joker in Gotham City.",
    image: "https://image.tmdb.org/t/p/original/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
  },
  {
    title: "Avatar",
    description: "A marine on an alien planet becomes torn between worlds.",
    image: "https://image.tmdb.org/t/p/original/jRXYjXNq0Cs2TcJjLkki24MLp7u.jpg",
  },
  {
    title: "Avengers: Endgame",
    description: "The Avengers assemble to reverse Thanos' actions.",
    image: "https://image.tmdb.org/t/p/original/or06FN3Dka5tukK1e9sl16pB3iy.jpg",
  },
  {
    title: "Joker",
    description: "A struggling comedian descends into madness.",
    image: "https://image.tmdb.org/t/p/original/udDclJoHjfjb8Ekgsd4FDteOkCU.jpg",
  },
  {
    title: "Fight Club",
    description: "An insomniac, white-collar Narrator who, bored with consumerist life, forms an underground bare-knuckle fighting ring with charismatic soap salesman Tyler Durden.",
    image: "https://image.tmdb.org/t/p/original/hZkgoQYus5vegHoetLkCJzb17zJ.jpg",
  },
];

function HeroSlider() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % movies.length);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
  <div className="relative mb-6 h-[400px] w-full overflow-hidden rounded-xl">
    
    <img
      key={current}
      src={movies[current].image}
      alt={movies[current].title}
      className="h-full w-full object-cover transition-all duration-700"
    />

    <div className="absolute inset-0 bg-black/40" />

    <div className="absolute bottom-6 left-6 max-w-md rounded bg-black/60 p-4 text-white">
      <h2 className="text-2xl font-bold">
        {movies[current].title}
      </h2>
      <p className="mt-2 text-sm">
        {movies[current].description}
      </p>
    </div>

    <button
      onClick={() =>
        setCurrent((current - 1 + movies.length) % movies.length)
      }
      className="absolute left-4 top-1/2 -translate-y-1/2 text-3xl text-white"
    >
      ‹
    </button>

    <button
      onClick={() =>
        setCurrent((current + 1) % movies.length)
      }
      className="absolute right-4 top-1/2 -translate-y-1/2 text-3xl text-white"
    >
      ›
    </button>

    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
      {movies.map((_, index) => (
        <div
          key={index}
          onClick={() => setCurrent(index)}
          className={`h-2 w-2 rounded-full cursor-pointer ${
            current === index ? "bg-white" : "bg-white/40"
          }`}
        />
      ))}
    </div>

  </div>
);
}

export default HeroSlider;