import React from "react";
export default function Topbar(){

return(

<div

className="

h-20

rounded-3xl

bg-white/10

backdrop-blur-2xl

border

border-white/20

shadow-xl

flex

justify-between

items-center

px-8

text-white

">

<div>

<h2 className="text-3xl font-bold">

Dashboard

</h2>

<p className="text-white/70">

Universiti Sains Malaysia

</p>

</div>

<div className="flex gap-5">

<button className="text-2xl">

🔔

</button>

<button className="text-2xl">

⚙️

</button>

<div
className="w-12 h-12 rounded-full bg-yellow-400"/>

</div>

</div>

);

}
