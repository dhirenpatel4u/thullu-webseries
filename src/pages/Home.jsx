import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import MovieRow from "../components/MovieRow";
import RecentlyPlayed from "../components/RecentlyPlayed";

const nav = performance.getEntriesByType("navigation")[0];

if (nav?.type === "reload") {
  sessionStorage.removeItem("allSeriesPage");
  sessionStorage.removeItem("allSeriesShowAll");
}

export default function Home() {

  const [shows, setShows] = useState([]);
  const [trending, setTrending] = useState([]);
  const [latest, setLatest] = useState([]);


  useEffect(() => {

    // Load from sessionStorage if available
    const savedShows = sessionStorage.getItem("shuffledShows");
    const savedTrending = sessionStorage.getItem("trendingShows");
    const savedLatest = sessionStorage.getItem("latestShows");

    if (savedShows && savedTrending && savedLatest) {
      setShows(JSON.parse(savedShows));
      setTrending(JSON.parse(savedTrending));
      setLatest(JSON.parse(savedLatest));
      return;
    }

    fetch("/data.json")
      .then(res => res.json())
      .then(data => {

        // Add stable id
        const withIds = data.map((show, index) => ({
          ...show,
          id: index
        }));

        // Shuffle All Series once
        const shuffledShows = [...withIds]
          .sort(() => Math.random() - 0.5);

        // Random Trending once
        const trendingShows = [...withIds]
          .sort(() => Math.random() - 0.5)
          .slice(0, 10);

        // Random Latest Releases (2026 only) once
        const latestShows = [...withIds]
          .filter(show => String(show.year).includes("2026"))
          .sort(() => Math.random() - 0.5)
          .slice(0, 10);

        setShows(shuffledShows);
        setTrending(trendingShows);
        setLatest(latestShows);

        sessionStorage.setItem(
          "shuffledShows",
          JSON.stringify(shuffledShows)
        );

        sessionStorage.setItem(
          "trendingShows",
          JSON.stringify(trendingShows)
        );

        sessionStorage.setItem(
          "latestShows",
          JSON.stringify(latestShows)
        );

      });

  }, []);

  return (

    <div>

      <Navbar />

      <Hero shows={shows} />

      <RecentlyPlayed />

      <div className="px-6 md:px-12 py-10">

<MovieRow
  key="latest"
  title="⭐ Latest Releases"
  shows={latest}
/>

<div id="trending">
  <MovieRow
    key="trending"
    title="🔥 Trending"
    shows={trending}
  />
</div>

<div id="all-series">
  <MovieRow
    key="all-series"
    title="🎬 All Series"
    shows={shows}
    limit={true}
  />
</div>

      </div>

    </div>

  );

}
