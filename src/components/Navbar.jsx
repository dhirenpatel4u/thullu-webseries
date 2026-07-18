import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";

export default function Navbar() {
  const [search, setSearch] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

const handleSearch = (e) => {
  e.preventDefault();

  const query = search.trim();

  if (!query) return; // Only prevent empty searches

  navigate(`/search/${encodeURIComponent(query)}`);
};

  const scrollToSection = (id) => {
    if (location.pathname !== "/") {
      navigate("/");

      setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 200);
    } else {
      document.getElementById(id)?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  return (
    <nav
      className="
      fixed
      top-0
      w-full
      z-50
      bg-black/80
      backdrop-blur-md
      px-6
      md:px-12
      py-4
      flex
      justify-between
      items-center
      gap-6
    "
    >
      <Link
        to="/"
        className="
        text-3xl
        font-bold
        text-red-600
      "
      >
        THULLU
      </Link>

      <div
        className="
        hidden
        md:flex
        gap-8
        text-gray-300
        items-center
      "
      >
        <Link to="/">Home</Link>

        <button
          onClick={() => scrollToSection("trending")}
          className="hover:text-white transition"
        >
          Trending
        </button>

        <button
          onClick={() => scrollToSection("all-series")}
          className="hover:text-white transition"
        >
          All Series
        </button>
      </div>

      <form
        onSubmit={handleSearch}
        className="flex items-center gap-2"
      >
        <input
          type="text"
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="
            w-44
            md:w-64
            px-4
            py-2
            rounded-full
            bg-gray-900
            border
            border-gray-700
            text-white
            placeholder-gray-400
            outline-none
            focus:border-red-500
          "
        />

        <button
          type="submit"
          className="
            px-4
            py-2
            rounded-full
            bg-red-600
            hover:bg-red-700
            text-white
            transition
          "
        >
          Search
        </button>
      </form>
    </nav>
  );
}
