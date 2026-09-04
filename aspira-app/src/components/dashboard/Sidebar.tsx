import React, { use } from "react";
import {
  Compass,
  LayoutDashboard,
  Map,
  Briefcase,
  BookOpen,
  Target,
  Users,
  CreditCard,
  Bell,
  Settings,
  LogOut,
  X,
  type LucideIcon,
  Link,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export type MenuItemId =
  | "dashboard"
  | "journey"
  | "workspace"
  | "learning"
  | "opportunities"
  | "mentors"
  | "subscription"
  | "notifications"
  | "settings";

interface MenuItem {
  id: MenuItemId;
  label: string;
  icon: LucideIcon;
}

const menuItems: MenuItem[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "journey", label: "My Journey", icon: Map },
  { id: "workspace", label: "Workspace", icon: Briefcase },
  { id: "learning", label: "Learning Hub", icon: BookOpen },
  { id: "opportunities", label: "Opportunities", icon: Target },
  { id: "mentors", label: "Mentors", icon: Users },
  { id: "subscription", label: "Subscription", icon: CreditCard },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "settings", label: "Profile & Settings", icon: Settings },
];

export interface SidebarUser {
  name: string;
  initials: string;
  year: string;
  track: string;
  score: number;
  scoreMax: number;
}

export interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeItem?: MenuItemId;
  onItemSelect?: (id: MenuItemId) => void;
  onLogout?: () => void;
  user?: SidebarUser;
}

const defaultUser: SidebarUser = {
  name: "Bryan Stone",
  initials: "AN",
  year: "SS3",
  track: "Computer science track",
  score: 91,
  scoreMax: 100,
};

const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  activeItem = "dashboard",
  onItemSelect,
  onLogout,
  user = defaultUser,
}) => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const handleLogout = async () => {
    // onLogout?.();
    await logout(); // Call the logout function from AuthContext
    navigate("/login"); // Redirect to the login page after logout
  };

  const menuItemPaths: Record<MenuItemId, string> = {
    dashboard: "/dashboard",
    journey: "/journey",
    workspace: "/workspace",
    learning: "/learning-hub",
    opportunities: "/opportunities",
    mentors: "/mentors",
    subscription: "/subscription",
    notifications: "/notifications",
    settings: "/settings",
  };

  const handleItemClick = (id: MenuItemId) => {
  onItemSelect?.(id);
  navigate(menuItemPaths[id]);
};



  return (
    <>
      {/* Overlay - shown at every breakpoint whenever the drawer is open */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />
      )}

      <aside
        className={`fixed top-0 left-0 h-screen w-\[280px\] bg-[#121D33] z-50 flex flex-col transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
              <Compass className="w-4 h-4 text-white" strokeWidth={2} />
            </div>
            <span className="text-white font-serif font-bold text-lg">
              Aspiria
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-white/60 hover:text-white transition-colors"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Profile card */}
        <div className="mx-4 mb-6 p-4 rounded-xl bg-white/5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-11 h-11 rounded-full bg-white/10 flex items-center justify-center text-white text-sm font-semibold shrink-0">
              {user.initials}
            </div>
            <div className="min-w-0">
              <p className="text-white text-sm font-semibold leading-tight truncate">
                {user.name}
              </p>
              <p className="text-white/50 text-xs mt-0.5 truncate">
                {user.year} &nbsp;•&nbsp; {user.track}
              </p>
            </div>
          </div>
          <div className="flex items-center justify-between text-xs text-white/60 mb-1.5">
            <span>Aspiria Score</span>
            <span className="text-white font-medium">
              {user.score} / {user.scoreMax}
            </span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full bg-[#E0A63C] rounded-full transition-all"
              style={{ width: `${(user.score / user.scoreMax) * 100}%` }}
            />
          </div>
        </div>

        {/* Menu */}
        <nav className="flex-1 overflow-y-auto px-3 space-y-0.5">
          {menuItems.map(({ id, label, icon: Icon }) => {
            const isActive = id === activeItem;
            return (
              <button
                key={id}
                type="button"
                onClick={() => handleItemClick(id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors
                  ${
                    isActive
                      ? "bg-white/10 text-white font-medium"
                      : "text-white/60 hover:bg-white/5 hover:text-white"
                  }`}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 ${
                    isActive ? "text-[#E0A63C]" : "text-white/50"
                  }`}
                  strokeWidth={2}
                />
                {label}
              </button>
            );
          })}
        </nav>

        {/* Upgrade card
        <div className="mx-4 mt-4 p-4 rounded-xl bg-white/5">
          <p className="text-white text-sm font-semibold mb-1">
            Upgrade to Premium
          </p>
          <p className="text-white/50 text-xs leading-relaxed mb-3">
            Unlock unlimited mentors, full resource hub &amp; more.
          </p>
          <button
            type="button"
            className="w-full bg-[#E0A63C] hover:bg-[#c99530] text-[#121D33] text-sm font-semibold rounded-lg py-2 transition-colors"
          >
            Upgrade - ₦4500/mo
          </button>
        </div> */}

        {/* Log out */}
        <div className="px-3 py-4 mt-2 border-t border-white/10">
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-white/60 hover:bg-white/5 hover:text-white transition-colors"
          >
            <LogOut className="w-4 h-4" strokeWidth={2} />
            Log Out
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
