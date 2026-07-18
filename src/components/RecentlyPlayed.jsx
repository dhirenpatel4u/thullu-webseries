import { useEffect, useState } from "react";
import { getRecentlyPlayed } from "../utils/recentlyPlayed";
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

export default function RecentlyPlayed() {

  const [recent, setRecent] = useState([]);

  useEffect(() => {
    setRecent(getRecentlyPlayed());
  }, []);

  if (recent.length === 0) {
    return null;
  }

  return (
    <section className="px-6 md:px-12 py-8">

      <h2 className="text-2xl font-bold mb-5">
        ▶ Recently Played
      </h2>

      <div
        className="
          grid
          grid-cols-2
          sm:grid-cols-3
          md:grid-cols-5
          gap-5
        "
      >
        {recent.map((item) => (

          <div
            key={`${item.id}-${item.episodeIndex}`}
            className="relative"
          >

<Link
  to={`/watch/${item.id}?episode=${item.episodeIndex}`}
  className="
    block
    rounded-xl
    overflow-hidden
    bg-zinc-900
    transition
    duration-300
    hover:scale-105
  "
>
  <img
    src={item.poster}
    alt={item.title}
    onError={(e) => {
      e.target.onerror = null;
      e.target.src = `https://placehold.co/600x400/D3D3D3/red?font=lora&text=${placeholderTitle(item.title)}`;
    }}
    className="
      w-full
      h-[180px]
      object-cover
    "
  />

  <div className="p-3">
    <h3 className="font-semibold truncate">
      {item.title}
    </h3>
  </div>
</Link>

            <div
              className="
                absolute
                bottom-2
                left-2
                right-2
                bg-black/80
                rounded-lg
                p-2
                text-xs
              "
            >
              <div>{item.episodeTitle}</div>

              <div className="text-gray-400">
                Resume {formatTime(item.time)}
              </div>
            </div>

          </div>

        ))}
      </div>

    </section>
  );

}

function formatTime(seconds) {

  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);

  if (h > 0) {
    return `${h}:${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`;
  }

  return `${m}:${String(s).padStart(2,"0")}`;

}
