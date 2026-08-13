import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";

const placeholderTitle = (title) => {
    const words = title
        .trim()
        .split(/\s+/);

    if (words.length < 4) {
        return encodeURIComponent(title);
    }

    const middle =
        Math.ceil(words.length / 2);

    return encodeURIComponent(
        words
            .slice(0, middle)
            .join(" ") +
            "\n" +
            words
                .slice(middle)
                .join(" ")
    );
};

export default function Hero({ movies }) {
    const [slides, setSlides] = useState([]);
    const [current, setCurrent] = useState(0);

    const touchStartX = useRef(0);
    const touchEndX = useRef(0);
    const isSwiping = useRef(false);
    const timerRef = useRef(null);

    // Random 5 movies
    useEffect(() => {
        if (!movies || !movies.length) {
            return;
        }

        const randomMovies = [...movies]
            .sort(
                () =>
                    Math.random() - 0.5
            )
            .slice(0, 5);

        setSlides(randomMovies);
        setCurrent(0);
    }, [movies]);

    // Auto slider
    const startAutoSlide = () => {
        clearInterval(
            timerRef.current
        );

        if (slides.length <= 1) {
            return;
        }

        timerRef.current =
            setInterval(() => {
                setCurrent((prev) => {
                    return (
                        (prev + 1) %
                        slides.length
                    );
                });
            }, 5000);
    };

    useEffect(() => {
        if (slides.length <= 1) {
            return;
        }

        startAutoSlide();

        return () => {
            clearInterval(
                timerRef.current
            );
        };
    }, [slides]);

    // Next
    const nextSlide = () => {
        if (slides.length <= 1) {
            return;
        }

        setCurrent((prev) => {
            return (
                (prev + 1) %
                slides.length
            );
        });

        startAutoSlide();
    };

    // Previous
    const prevSlide = () => {
        if (slides.length <= 1) {
            return;
        }

        setCurrent((prev) => {
            return (
                (prev -
                    1 +
                    slides.length) %
                slides.length
            );
        });

        startAutoSlide();
    };

    // Touch Start
    const handleTouchStart = (e) => {
        isSwiping.current = false;

        touchStartX.current =
            e.touches[0].clientX;

        touchEndX.current =
            e.touches[0].clientX;
    };

    // Touch Move
    const handleTouchMove = (e) => {
        touchEndX.current =
            e.touches[0].clientX;

        if (
            Math.abs(
                touchStartX.current -
                    touchEndX.current
            ) > 20
        ) {
            isSwiping.current = true;
        }
    };

    // Touch End
    const handleTouchEnd = () => {
        if (!isSwiping.current) {
            touchStartX.current = 0;
            touchEndX.current = 0;
            return;
        }

        const diff =
            touchStartX.current -
            touchEndX.current;

        if (Math.abs(diff) < 50) {
            touchStartX.current = 0;
            touchEndX.current = 0;
            return;
        }

        // Swipe left
        if (diff > 0) {
            nextSlide();
        }

        // Swipe right
        else {
            prevSlide();
        }

        touchStartX.current = 0;
        touchEndX.current = 0;
        isSwiping.current = false;
    };

    if (!slides.length) {
        return null;
    }

    const movie =
        slides[current];

    const posterUrl =
        `https://m.media-amazon.com/images/M/${movie.Poster}`;

    return (
        <div
            onTouchStart={
                handleTouchStart
            }
            onTouchMove={
                handleTouchMove
            }
            onTouchEnd={
                handleTouchEnd
            }
            className="
                hero-slider
            "
        >
            {/* Background Image */}

            <img
                src={posterUrl}
                alt={
                    movie[
                        "Movie Name"
                    ]
                }
                onError={(e) => {
                    e.currentTarget.onerror =
                        null;

                    e.currentTarget.src =
                        `https://placehold.co/1200x700/111/fff?font=lora&text=${placeholderTitle(
                            movie[
                                "Movie Name"
                            ]
                        )}`;
                }}
                className="
                    hero-background
                "
            />

            {/* Dark Overlay */}

            <div
                className="
                    hero-overlay
                "
            />

            {/* Content */}

            <div
                className="
                    hero-content
                "
            >
                <h1>
                    {
                        movie[
                            "Movie Name"
                        ]
                    }
                </h1>

                <div
                    className="
                        hero-meta
                    "
                >
                    <span>
                        {
                            movie.Year
                        }
                    </span>

                    {movie.Actors &&
                        movie.Actors.length >
                            0 && (
                            <span>
                                •{" "}
                                {movie.Actors
                                    .slice(
                                        0,
                                        2
                                    )
                                    .join(
                                        ", "
                                    )}
                            </span>
                        )}
                </div>

                <p>
                    {movie.Description ||
                        "Watch this movie in HD quality."}
                </p>

                <Link
                    to={`/watch/${
                        movie[
                            "IMDB ID"
                        ]
                    }`}
                    className="
                        hero-watch-btn
                    "
                >
                    ▶ Watch Now
                </Link>
            </div>

            {/* Left Arrow */}

            <button
                onClick={prevSlide}
                className="
                    hero-arrow
                    hero-arrow-left
                "
                aria-label="Previous movie"
            >
                ❮
            </button>

            {/* Right Arrow */}

            <button
                onClick={nextSlide}
                className="
                    hero-arrow
                    hero-arrow-right
                "
                aria-label="Next movie"
            >
                ❯
            </button>

            {/* Indicators */}

            <div
                className="
                    hero-indicators
                "
            >
                {slides.map(
                    (_, index) => (
                        <button
                            key={index}
                            onClick={() => {
                                setCurrent(
                                    index
                                );

                                startAutoSlide();
                            }}
                            className={
                                current ===
                                index
                                    ? "hero-indicator active"
                                    : "hero-indicator"
                            }
                            aria-label={`Go to slide ${
                                index + 1
                            }`}
                        />
                    )
                )}
            </div>
        </div>
    );
}
