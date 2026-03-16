import { useState } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ConfirmDialog from "./ConfirmDialog";

function Navbar() {
  const [open, setOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const { user, logout } = useAuth();

  const requestLogout = () => {
    setShowLogoutConfirm(true);
    setOpen(false);
  };

  const confirmLogout = () => {
    setShowLogoutConfirm(false);
    logout();
  };

  const links =
    user?.role === "admin"
      ? [
          { to: "/admin", label: "Admin" },
          { to: "/dashboard", label: "Dashboard" },
          { to: "/leaderboard", label: "Leaderboard" }
        ]
      : [
          { to: "/student-dashboard", label: "Dashboard" },
          { to: "/student", label: "Edit Profile" },
          { to: "/leaderboard", label: "Leaderboard" }
        ];

  const cls = ({ isActive }) =>
    `rounded-lg px-3 py-2 text-sm transition ${
      isActive
        ? "bg-accentBlue/15 text-accentBlue"
        : "text-slate-300 hover:bg-slate-800/70 hover:text-white"
    }`;

  return (
    <header className="fixed left-0 right-0 top-0 z-40 px-4 pt-3 sm:px-6">
      <div className="glass mx-auto max-w-7xl rounded-2xl px-4 py-3">
        <div className="flex items-center justify-between">
          <NavLink to={user?.role === "admin" ? "/admin" : "/student-dashboard"} className="flex items-center gap-2">
            <span className="rounded-lg bg-accentGreen/20 px-2 py-1 font-mono text-xs text-accentGreen">DPA</span>
            <span className="font-semibold text-white">Dev Profile Aggregator</span>
          </NavLink>

          <button type="button" className="rounded-lg border border-line p-2 md:hidden" onClick={() => setOpen((v) => !v)}>
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
              {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
            </svg>
          </button>

          <nav className="hidden items-center gap-1 md:flex">
            {links.map((link) => (
              <NavLink key={link.to} to={link.to} className={cls}>
                {link.label}
              </NavLink>
            ))}
            <button type="button" className="rounded-lg px-3 py-2 text-sm text-slate-300 hover:bg-slate-800/70 hover:text-white" onClick={requestLogout}>
              Logout
            </button>
          </nav>
        </div>

        {open ? (
          <nav className="mt-3 grid gap-1 border-t border-line pt-3 md:hidden">
            {links.map((link) => (
              <NavLink key={link.to} to={link.to} className={cls} onClick={() => setOpen(false)}>
                {link.label}
              </NavLink>
            ))}
            <button
              type="button"
              className="rounded-lg px-3 py-2 text-left text-sm text-slate-300 hover:bg-slate-800/70 hover:text-white"
              onClick={requestLogout}
            >
              Logout
            </button>
          </nav>
        ) : null}
      </div>
      <ConfirmDialog
        open={showLogoutConfirm}
        title="Logout Confirmation"
        message="You are about to end your session. Do you want to logout now?"
        confirmLabel="Logout"
        cancelLabel="Stay Logged In"
        onConfirm={confirmLogout}
        onCancel={() => setShowLogoutConfirm(false)}
      />
    </header>
  );
}

export default Navbar;
