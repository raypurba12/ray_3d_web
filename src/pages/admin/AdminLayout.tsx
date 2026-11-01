import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import {
  ArrowLeft,
  Briefcase,
  Cpu,
  FileText,
  FolderKanban,
  Images,
  KeyRound,
  LayoutDashboard,
  LogOut,
  Mail,
  Menu,
  Quote,
  UserRound,
  X,
} from "lucide-react";

import { useAuth } from "../../features/admin/auth/useAuth";
import {
  getUnreadMessageCount,
  MESSAGES_UPDATED_EVENT,
} from "../../features/admin/messages/api";

const NAV_ITEMS = [
  { to: "/admin", end: true, icon: LayoutDashboard, label: "Dashboard" },
  { to: "/admin/messages", end: false, icon: Mail, label: "Messages" },
  { to: "/admin/projects", end: false, icon: FolderKanban, label: "Projects" },
  { to: "/admin/gallery", end: false, icon: Images, label: "Gallery" },
  { to: "/admin/experiences", end: false, icon: Briefcase, label: "Experiences" },
  { to: "/admin/technologies", end: false, icon: Cpu, label: "Technologies" },
  { to: "/admin/testimonials", end: false, icon: Quote, label: "Testimonials" },
  { to: "/admin/site-content", end: false, icon: FileText, label: "Site Content" },
  { to: "/admin/profile", end: false, icon: UserRound, label: "Profile" },
  { to: "/admin/account", end: false, icon: KeyRound, label: "Account" },
] as const;

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
    isActive
      ? "bg-acid text-black"
      : "text-secondary hover:bg-white/[0.06] hover:text-white"
  }`;

const sidebarFooterClass =
  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-secondary transition hover:bg-white/[0.06] hover:text-white";

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const { pathname } = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState(0);

  useEffect(() => {
    window.scrollTo({ top: 0 });
    setSidebarOpen(false);
  }, [pathname]);

  useEffect(() => {
    let cancelled = false;

    const loadUnread = () => {
      getUnreadMessageCount()
        .then(({ count }) => {
          if (!cancelled) setUnreadMessages(count);
        })
        .catch(() => undefined);
    };

    loadUnread();
    window.addEventListener(MESSAGES_UPDATED_EVENT, loadUnread);
    window.addEventListener("focus", loadUnread);

    return () => {
      cancelled = true;
      window.removeEventListener(MESSAGES_UPDATED_EVENT, loadUnread);
      window.removeEventListener("focus", loadUnread);
    };
  }, [pathname]);

  useEffect(() => {
    if (!sidebarOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSidebarOpen(false);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [sidebarOpen]);

  return (
    <div className="relative min-h-screen bg-primary text-white">
      <div className="pointer-events-none fixed inset-x-0 top-0 z-0 h-72 bg-[radial-gradient(circle_at_top,rgba(212,255,0,0.08),transparent_60%)]" />

      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-white/5 bg-primary/80 px-5 backdrop-blur-md lg:hidden">
        <Link
          to="/admin"
          className="font-display text-lg font-bold tracking-tight text-white"
        >
          Ray<span className="text-acid">.</span>Admin
        </Link>
        <button
          type="button"
          aria-label="Open admin menu"
          aria-expanded={sidebarOpen}
          onClick={() => setSidebarOpen(true)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-white transition hover:bg-white/[0.08]"
        >
          <Menu size={18} />
        </button>
      </header>

      <div
        aria-hidden
        onClick={() => setSidebarOpen(false)}
        className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity lg:hidden ${
          sidebarOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-white/5 bg-[#0b0b0e]/95 backdrop-blur-xl transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-white/5 px-5">
          <Link
            to="/admin"
            className="font-display text-lg font-bold tracking-tight text-white"
          >
            Ray<span className="text-acid">.</span>Admin
          </Link>
          <button
            type="button"
            aria-label="Close admin menu"
            onClick={() => setSidebarOpen(false)}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-secondary transition hover:bg-white/[0.06] hover:text-white lg:hidden"
          >
            <X size={16} />
          </button>
        </div>

        <p className="px-5 pb-2 pt-6 font-mono text-[10px] uppercase tracking-[0.25em] text-white/30">
          Manage content
        </p>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3">
          {NAV_ITEMS.map(({ to, end, icon: Icon, label }) => (
            <NavLink key={to} to={to} end={end} className={navLinkClass}>
              {({ isActive }) => (
                <>
                  <Icon size={17} />
                  {label}
                  {label === "Messages" && unreadMessages > 0 && (
                    <span
                      className={`ml-auto rounded-full px-1.5 py-0.5 font-mono text-[10px] font-bold ${
                        isActive
                          ? "bg-black/15 text-black"
                          : "bg-acid text-black"
                      }`}
                    >
                      {unreadMessages}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="shrink-0 space-y-1 border-t border-white/5 p-3">
          {user?.email && (
            <p className="truncate px-3 pb-2 font-mono text-[10px] uppercase tracking-[0.15em] text-white/30">
              {user.email}
            </p>
          )}
          <Link to="/" className={sidebarFooterClass}>
            <ArrowLeft size={16} />
            View site
          </Link>
          <button
            type="button"
            onClick={logout}
            className={`${sidebarFooterClass} w-full hover:text-red-300`}
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </aside>

      <main className="relative z-10 lg:pl-64">
        <div className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
