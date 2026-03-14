import { BaggageClaim, BarChart3, Building2, IdCardLanyard, LayoutDashboard, Package, Settings, ShoppingBag, Truck, Contact } from "lucide-react";


const menuItems=[
  {
    id: "dashboard",
    icon : LayoutDashboard,
    label :"Dashboard",
    active: true,
    roles:["admin"],
    badge:"New"
  },
  {
    id:"analytics",
    icon:BarChart3,
    label: "Analytics",
    roles:["admin"],
    subMenu:[
      {id: "overview",label:"Overview"},
    ],
  },

  {
    id:"customers",
    icon: Contact,
    label:"Customer",
    roles:["admin","user"],
  

  },
   {
    id:"billing",
    icon: ShoppingBag,
    label:"Billing",
    roles:["admin","user"],
    subMenu: [
      {id:"bill", label:"Generate New Bill"},
    ],

  },
  {
    id:"inventory",
    icon: Package,
    label: "Inventory",
    count:99,
    roles:["admin","user"],
  },
  {
    id:"orders",
    icon: BaggageClaim,
    label: "Orders",
    count:99,
    roles:["admin","user"],
  },
  {
    id:"employees",
    icon:IdCardLanyard,
    label:"Employees",
    count: " 5 ",
    roles:["admin","user"],
  },
  {
    id:"transportation",
    icon:Truck,
    label:"Transportation",
    roles:["admin", "user"],
  },
  {
    id:"settings",
    icon:Settings,
    label:"Settings",
    roles:["admin","user"],
  },
  {
    id:"register-company",
    icon:Building2,
    label:"Register Company",
    roles:["admin"],
  }
]

export default menuItems