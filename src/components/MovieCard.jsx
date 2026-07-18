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


export default function MovieCard({show,id}){


return (

<Link
to={`/watch/${id}`}
className="
min-w-[180px]
md:min-w-[220px]
group
"
>


<div className="
rounded-xl
overflow-hidden
bg-zinc-900
transition
duration-300
group-hover:scale-105
">


<div className="w-full aspect-video overflow-hidden">
  <img
    src={show.episodes[0].poster}
    alt={show.title}
    onError={(e) => {
      e.target.onerror = null;
      e.target.src = `https://placehold.co/600x400/D3D3D3/red?font=lora&text=${placeholderTitle(show.title)}`;
    }}
    className="
      w-full
      h-full
      object-cover
      transition-transform
      duration-300
      group-hover:scale-110
    "
    loading="lazy"
  />
</div>


<div className="
p-3
">

<h3 className="
font-semibold
truncate
">

{show.title}

</h3>

</div>


</div>


</Link>

);

}
