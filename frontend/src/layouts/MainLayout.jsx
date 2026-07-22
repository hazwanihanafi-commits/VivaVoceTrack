import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import { Outlet } from "react-router-dom";

export default function MainLayout(){

return(

<div>

<Sidebar/>

<div className="ml-72 p-8">

<Topbar/>

<div className="mt-8">

<Outlet/>

</div>

</div>

</div>

);

}
