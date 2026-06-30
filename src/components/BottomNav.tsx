import { NavLink } from "react-router-dom";
import { IconHome, IconMap, IconCamera, IconTrophy, IconUser, type IconProps } from "./icons";
import type { ComponentType } from "react";

const TABS: { to: string; label: string; Icon: ComponentType<IconProps>; end: boolean }[] = [
  { to: "/", label: "도감", Icon: IconHome, end: true },
  { to: "/map", label: "지도", Icon: IconMap, end: false },
  { to: "/identify", label: "식별", Icon: IconCamera, end: false },
  { to: "/compete", label: "경쟁", Icon: IconTrophy, end: false },
  { to: "/me", label: "내정보", Icon: IconUser, end: false },
];

export default function BottomNav() {
  return (
    <nav className="bottom-nav">
      {TABS.map((t) => (
        <NavLink
          key={t.to}
          to={t.to}
          end={t.end}
          className={({ isActive }) => "nav-item" + (isActive ? " active" : "")}
        >
          <t.Icon className="nav-icon" />
          <span className="nav-label">{t.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
