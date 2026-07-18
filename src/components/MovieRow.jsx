import { useState, useEffect } from "react";
import MovieCard from "./MovieCard";


export default function MovieRow({
    title,
    shows,
    limit = false
}) {


const [showAll, setShowAll] = useState(() => {
  return sessionStorage.getItem("allSeriesShowAll") === "true";
});

const [page, setPage] = useState(() => {
  return Number(sessionStorage.getItem("allSeriesPage")) || 1;
});

useEffect(() => {
  if (!limit) return;

  sessionStorage.setItem("allSeriesShowAll", showAll);
  sessionStorage.setItem("allSeriesPage", page);
}, [showAll, page, limit]);

const perPage = 30;


let displayShows;


if (!limit) {

  // Trending & Latest
  displayShows = shows;

} else if (!showAll) {

  // All Series initial
  displayShows = shows.slice(0, 20);

} else {

  // All Series paginated
  const start = (page - 1) * perPage;

  displayShows = shows.slice(
    start,
    start + perPage
  );

}



return (

<section className="mb-12">


<div className="
flex
justify-between
items-center
mb-5
">


<h2 className="
text-2xl
font-bold
">

{title}

</h2>



{
limit && !showAll && shows.length > 20 &&

<button

onClick={() => {
  setShowAll(true);
  sessionStorage.setItem("allSeriesShowAll", "true");
}}

className="
text-red-500
hover:text-red-400
font-semibold
"

>

More →

</button>

}


</div>



<div className="
grid
grid-cols-2
sm:grid-cols-3
md:grid-cols-5
gap-5
">


{
displayShows.map((show)=>(

<MovieCard
  key={show.id}
  show={show}
  id={show.id}
/>

))
}


</div>




{
limit && showAll && shows.length > perPage &&

<div className="
flex
justify-center
gap-5
mt-8
">


<button

disabled={page===1}

onClick={()=>setPage(page-1)}

className="
bg-zinc-800
px-5
py-2
rounded-lg
disabled:opacity-40
"

>

← Previous

</button>



<button

disabled={page >= Math.ceil(shows.length/perPage)}

onClick={()=>setPage(page+1)}

className="
bg-red-600
px-5
py-2
rounded-lg
disabled:opacity-40
"

>

Next →

</button>


</div>

}


</section>

);

}
