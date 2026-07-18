import {
Routes,
Route
} from "react-router-dom";


import Home from "./pages/Home";
import Watch from "./pages/Watch";
import Search from "./pages/Search";   // NEW


function App(){

return (

<Routes>

<Route 
path="/"
element={<Home/>}
/>


<Route
path="/watch/:id"
element={<Watch/>}
/>

<Route
path="/search/:keyword"
element={<Search />}
/>

</Routes>

);

}


export default App;
