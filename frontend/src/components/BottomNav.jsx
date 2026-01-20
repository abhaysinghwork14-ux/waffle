import { useNavigate } from "react-router-dom";
import { Home, Gift, Gamepad2, Trophy } from "lucide-react";

export const BottomNav = ({ active }) => {
  const navigate = useNavigate();

  const navItems = [
    { id: "home", icon: Home, label: "Home", path: "/dashboard" },
    { id: "redeem", icon: Gift, label: "Redeem", path: "/redeem" },
    { id: "game", icon: Gamepad2, label: "Game", path: "/game" },
    { id: "leaderboard", icon: Trophy, label: "Ranks", path: "/leaderboard" },
  ];

  return (
    <nav className="bottom-nav" data-testid="bottom-nav">
      <div className="flex items-center justify-around py-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = active === item.id;
          return (
            <button
              key={item.id}
              data-testid={`nav-${item.id}`}
              onClick={() => navigate(item.path)}
              className={`nav-item flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-colors ${
                isActive
                  ? "text-amber-600 bg-amber-50"
                  : "text-gray-400 hover:text-amber-500"
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? "fill-current" : ""}`} />
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
