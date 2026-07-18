import { useEffect,useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";

import Navbar from "../components/Navbar";
import VideoPlayer from "../components/VideoPlayer";
import EpisodeList from "../components/EpisodeList";


export default function Watch(){

const {id}=useParams();

const [show,setShow]=useState(null);
const [selectedEpisode,setSelectedEpisode]=useState(null);
const [selectedIndex,setSelectedIndex] = useState(0);
const location = useLocation();


useEffect(() => {

  fetch("/data.json")
    .then(res => res.json())
    .then(data => {

      const selectedShow = data
        .map((show, index) => ({
          ...show,
          id: index
        }))
        .find(show => show.id === Number(id));

      const params = new URLSearchParams(location.search);
      const epIndex = Number(params.get("episode") || 0);

      setShow(selectedShow);
      setSelectedIndex(epIndex);
      setSelectedEpisode(
        selectedShow.episodes[epIndex] || selectedShow.episodes[0]
      );

    });

}, [id, location.search]);   


if(!show){

return <h1 className="p-10">
Loading...
</h1>

}


return (

<div>

<Navbar/>


<div className="pt-24 px-5 md:px-12 pb-16">


<h1 className="text-3xl font-bold mb-5">
{show.title}
</h1>


<div className="grid md:grid-cols-3 gap-8">


<div className="md:col-span-2">

<VideoPlayer
  episode={selectedEpisode}
  showId={show.id}
  showTitle={show.title}
  episodeIndex={selectedIndex}
/>


<div className="mt-5 space-y-3 text-gray-300">

  <p>
    Watch <span className="font-semibold">{show.title}</span> online.
    Select episodes and enjoy streaming.
  </p>

  {show.description && (
    <p>
      <span className="font-semibold text-white">Description:</span>{" "}
      {show.description}
    </p>
  )}

  {show.ott && (
    <p>
      <span className="font-semibold text-white">OTT:</span>{" "}
      {show.ott}
    </p>
  )}

  {show.models?.length > 0 && (
    <p>
      <span className="font-semibold text-white">Models:</span>{" "}
      {show.models.map((model, index) => (
        <span key={model}>
          <Link
            to={`/search/${encodeURIComponent(model)}`}
            className="text-pink-400 hover:text-pink-300 hover:underline"
          >
            {model}
          </Link>
          {index < show.models.length - 1 && ", "}
        </span>
      ))}
    </p>
  )}

</div>


</div>



<div>

<h2 className="text-xl font-bold mb-4">
Episodes
</h2>


<EpisodeList
    episodes={show.episodes}
    onSelect={(ep,index)=>{
        setSelectedEpisode(ep);
        setSelectedIndex(index);
    }}
    activeIndex={selectedIndex}
/>


</div>


</div>


</div>


</div>

);

}
