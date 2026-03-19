import {
  BaggageClaim, BarChart3, Building2, IdCardLanyard,
  LayoutDashboard, Package, Settings, ShoppingBag,
  Truck, Contact,
} from "lucide-react";

/**
 * countKey — tells the sidebar which API count to show for this item.
 * The sidebar fetches each unique key once and maps it here.
 *   "inventory"  → GET /api/materials        (total items)
 *   "orders"     → GET /api/dashboard-orders (total orders)
 *   "employees"  → GET /api/employees        (total employees)
 */
const menuItems = [
  {
    id: "dashboard",
    icon: LayoutDashboard,
    label: "Dashboard",
    roles: ["admin"],
    badge: "New",
  },
  {
    id: "analytics",
    icon: BarChart3,
    label: "Analytics",
    roles: ["admin"],
    subMenu: [
      { id: "overview", label: "Overview" },
    ],
  },
  {
    id: "customers",
    icon: Contact,
    label: "Customer",
    roles: ["admin", "user"],
  },
  {
    id: "billing",
    icon: ShoppingBag,
    label: "Billing",
    roles: ["admin", "user"],
    subMenu: [
      { id: "bill", label: "Generate New Bill" },
    ],
  },
  {
    id: "inventory",
    icon: Package,
    label: "Inventory",
    roles: ["admin", "user"],
    countKey: "inventory",   // fetched live
  },
  {
    id: "orders",
    icon: BaggageClaim,
    label: "Orders",
    roles: ["admin", "user"],
    countKey: "orders",      // fetched live
  },
  {
    id: "employees",
    icon: IdCardLanyard,
    label: "Employees",
    roles: ["admin", "user"],
    countKey: "employees",   // fetched live
  },
  {
    id: "transportation",
    icon: Truck,
    label: "Transportation",
    roles: ["admin", "user"],
  },
  {
    id: "settings",
    icon: Settings,
    label: "Settings",
    roles: ["admin", "user"],
  },
  {
    id: "register-company",
    icon: Building2,
    label: "Register Company",
    roles: ["admin"],
  },
];

export default menuItems;