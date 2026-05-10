import { Link, useLocation, Outlet } from "react-router-dom";

const DashboardLayout = () => {
  const location = useLocation();

  const navItems = [
    { name: "My Profile", path: "/profile" },
    { name: "Manage Services", path: "/dashboard/services" },
    { name: "My Bookings", path: "/dashboard/bookings" },
  ];

  return (
    <div className="flex min-h-[calc(100vh-64px)] w-full">
      {/* SIDEBAR */}
      <aside className="w-[280px] bg-[#111111] text-[#ffffff] border-r border-[#1a1a1a] flex flex-col shrink-0">
        <div className="p-6 border-b border-[#2a2a2a]">
          <h2 className="text-sm font-bold uppercase tracking-widest text-[#6b6b6b]">
            Provider Portal
          </h2>
        </div>
        <nav className="flex flex-col flex-1 p-4 gap-2">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`px-4 py-3 text-sm font-bold uppercase border transition-colors ${
                location.pathname.includes(item.path)
                  ? "bg-[#ff4d2d] border-[#ff4d2d] text-white"
                  : "border-transparent text-[#bdbdbd] hover:border-[#2a2a2a] hover:bg-[#1a1a1a] hover:text-white"
              }`}
            >
              {item.name}
            </Link>
          ))}
        </nav>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 bg-[#f4f1eb] p-6 md:p-8 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;