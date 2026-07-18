import {useState} from "react";

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


export default function EpisodeList({
    episodes,
    onSelect,
    activeIndex
}){


return (

<div className="space-y-3">


{
episodes.map((ep,index)=>(


<button

key={index}

onClick={()=>onSelect(ep,index)}

className={`
w-full
flex
items-center
gap-3
p-3
rounded-xl
transition

${
activeIndex === index
?
"bg-red-600"
:
"bg-zinc-800 hover:bg-zinc-700"
}

`}

>


<div className="relative">


<img

src={ep.poster}
alt={ep.episode}
onError={(e) => {
    e.target.onerror = null;
    e.target.src = `https://placehold.co/600x400/D3D3D3/red?font=lora&text=${placeholderTitle(ep.episode)}`;
}}

className="
w-24
h-14
rounded-lg
object-cover
"

/>


{
activeIndex === index &&

<div

className="
absolute
inset-0
bg-black/50
flex
items-center
justify-center
rounded-lg
"

>

<span className="
text-2xl
">

▶

</span>


</div>

}


</div>



<div className="text-left">


<p className="font-semibold">

{ep.episode}

</p>


<span className="
text-xs
text-gray-300
">

HD

</span>


</div>


</button>


))

}


</div>

);

}
