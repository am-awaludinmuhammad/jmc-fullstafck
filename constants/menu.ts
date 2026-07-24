import {
  LayoutDashboard,
  User,
  Database,
  Users,
  History,
  type LucideIcon,
} from "lucide-react"

type MenuChild = {
  title: string
  url: string
}

type MenuItem = {
  title: string
  icon: LucideIcon
  url?: string
  children?: MenuChild[]
}

export const menuItems: MenuItem[] = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    url: "/",
  },
  {
    title: "Data Pegawai",
    icon: User,
    url: "/pegawai",
  },
  {
    title: "Tunjangan",
    icon: Database,
    children: [
      { title: "Setting Tunjangan Transport", url: "/tunjangan/setting" },
      { title: "Tunjangan Transport", url: "/tunjangan/transport" },
    ],
  },
  {
    title: "Manajemen User",
    icon: Users,
    children: [
      { title: "Manajemen Role", url: "/user/role" },
      { title: "Manajemen User", url: "/user/manage" },
    ],
  },
  {
    title: "Log Aktifitas",
    icon: History,
    url: "/log",
  },
]
