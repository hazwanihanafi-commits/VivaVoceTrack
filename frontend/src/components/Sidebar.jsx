import {
LayoutDashboard,
GraduationCap,
CalendarDays,
Users,
BarChart3,
Settings
} from "lucide-react";

const menu=[
{
icon:LayoutDashboard,
label:"Dashboard"
},
{
icon:GraduationCap,
label:"Students"
},
{
icon:CalendarDays,
label:"Viva"
},
{
icon:Users,
label:"Examiners"
},
{
icon:BarChart3,
label:"Reports"
},
{
icon:Settings,
label:"Settings"
}
];

export default function Sidebar(){

return(

<div
className="
w-72
h-screen
fixed
left-0
top-0

bg-white/10

backdrop-blur-2xl

border-r

border-white/20

text-white

shadow-2xl
">

<div className="text-4xl font-bold p-8">

🎓 VivaTrack

</div>

<div className="px-4 space-y-3">

{menu.map(({icon:Icon,label})=>(

<button

key={label}

className="

w-full

flex

items-center

gap-4

px-5

py-4

rounded-2xl

hover:bg-white/15

transition

duration-300

">

<Icon size={22}/>

{label}

</button>

))}

</div>

</div>

);

}
