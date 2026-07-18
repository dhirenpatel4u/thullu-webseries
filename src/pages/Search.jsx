import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import Navbar from "../components/Navbar";
import MovieRow from "../components/MovieRow";

export default function Search() {
  const { keyword } = useParams();

  const [results, setResults] = useState([]);

  useEffect(() => {
    fetch("/data.json")
      .then((res) => res.json())
      .then((data) => {
        const filtered = data
            .map((show, index) => ({
              ...show,
              id: index,
            }))
      .filter((show) => {
        const q = keyword.toLowerCase();

        const inTitle = show.title?.toLowerCase().includes(q);

        const inDescription = show.description
          ?.toLowerCase()
          .includes(q);

        const inModels = show.models?.some((model) =>
          model.toLowerCase().includes(q)
        );

  return inTitle || inDescription || inModels;
});

        setResults(filtered);
      });
  }, [keyword]);

  return (
    <div>
      <Navbar />

      <div className="px-6 md:px-12 pt-24 pb-10">
        <h1 className="text-3xl font-bold text-white mb-8">
          Search Results for{" "}
          <span className="text-pink-500">
            "{decodeURIComponent(keyword)}"
          </span>{" "}
          <span className="text-gray-400 text-xl">
            ({results.length} {results.length === 1 ? "Result" : "Results"})
          </span>
        </h1>

        {results.length > 0 ? (
          <MovieRow title="" shows={results} />
        ) : (
          <p className="text-gray-400">
            No series found for "{decodeURIComponent(keyword)}".
          </p>
        )}
      </div>
    </div>
  );
}
