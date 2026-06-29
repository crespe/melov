import { NavLink } from "react-router-dom";

const TABS = [
  { to: "/", label: "도감", icon: "🏡", end: true },
  { to: "/map", label: "지도", icon: "🗺️", end: false },
  { to: "/identify", label: "식별", icon: "📸", end: false },
  { to: "/compete", label: "경쟁", icon: "🏆", end: false },
  { to: "/me", label: "내정보", icon: "🧑‍🌾", end: false },
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
          <span className="nav-icon">{t.icon}</span>
          <span className="nav-label">{t.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
