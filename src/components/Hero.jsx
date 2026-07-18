import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";

const placeholderTitle = (title) => {
  const words = title.trim().split(/\s+/);

  if (words.length < 4) {
    return encodeURIComponent(title);
  }

  const middle = Math.ceil(words.length / 2);

  return encodeURIComponent(
    words.slice(0, middle).join(" ") +
      "\n" +
      words.slice(middle).join(" ")
  );
};

export default function Hero({ shows }) {
  const [slides, setSlides] = useState([]);
  const [current, setCurrent] = useState(0);

  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  useEffect(() => {
    if (shows.length) {
      const randomShows = [...shows]
        .sort(() => Math.random() - 0.5)
        .slice(0, 5);

      setSlides(randomShows);
    }
  }, [shows]);

  useEffect(() => {
    if (slides.length <= 1) return;

    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [slides]);

  if (!slides.length) return null;

  const nextSlide = () => {
    setCurrent((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current;

    if (Math.abs(diff) < 50) return;

    if (diff > 0) {
      nextSlide();
    } else {
      prevSlide();
    }
  };

  const show = slides[current];

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="
        h-[80vh]
        relative
        flex
        items-center
        overflow-hidden
      "
    >
      <img
        src={show.episodes[0].poster}
        alt={show.title}
        onError={(e) => {
          e.target.onerror = null;
          e.target.src = `https://placehold.co/600x400/D3D3D3/red?font=lora&text=${placeholderTitle(
            show.title
          )}`;
        }}
        className="
          absolute
          w-full
          h-full
          object-cover
          opacity-40
          transition
          duration-700
        "
      />

      <div
        className="
          absolute
          inset-0
          bg-gradient-to-r
          from-black
          via-black/70
          to-transparent
        "
      />

      <div
        className="
          relative
          z-10
          px-8
          md:px-16
          max-w-xl
          pt-20
        "
      >
        <h1
          className="
            text-5xl
            md:text-7xl
            font-bold
            mb-5
          "
        >
          {show.title}
        </h1>

        <p
          className="
            text-gray-300
            mb-8
          "
        >
          Watch latest episodes in HD quality.
        </p>

        <Link
          to={`/watch/${show.id}`}
          className="
            bg-red-600
            px-8
            py-3
            rounded-full
            font-bold
            hover:bg-red-700
          "
        >
          ▶ Watch Now
        </Link>
      </div>

      {/* Left Arrow */}
      <button
        onClick={prevSlide}
        className="
          hidden
          md:flex
          absolute
          left-4
          top-1/2
          -translate-y-1/2
          z-20
          w-12
          h-12
          rounded-full
          bg-black/50
          hover:bg-black/70
          text-2xl
          text-white
          items-center
          justify-center
        "
      >
        ❮
      </button>

      {/* Right Arrow */}
      <button
        onClick={nextSlide}
        className="
          hidden
          md:flex
          absolute
          right-4
          top-1/2
          -translate-y-1/2
          z-20
          w-12
          h-12
          rounded-full
          bg-black/50
          hover:bg-black/70
          text-2xl
          text-white
          items-center
          justify-center
        "
      >
        ❯
      </button>

      <div
        className="
          absolute
          bottom-10
          left-1/2
          -translate-x-1/2
          flex
          gap-2
        "
      >
        {slides.map((_, index) => (
          <div
            key={index}
            onClick={() => setCurrent(index)}
            className={`
              h-2
              rounded-full
              transition-all
              cursor-pointer
              ${
                current === index
                  ? "w-8 bg-red-600"
                  : "w-2 bg-white"
              }
            `}
          />
        ))}
      </div>
    </div>
  );
}
