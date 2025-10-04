import { logout } from "../services/AuthService.js";
import { useNavigate, NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Dashboard() {
    const { user } = useAuth();
    const nav = useNavigate();

    async function userLogout() {
        await logout();
        nav('/login');
    }

    const linkBase =
        "px-3 py-2 text-sm font-medium rounded-md transition hover:bg-gray-100";
    const linkActive =
        "text-gray-900";
    const linkInactive =
        "text-gray-600";

    return (<>
        {/* HEADER */}
        <header className="sticky top-0 z-40 w-full border-b bg-white/95 backdrop-blur">
            <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between">
                    {/* Left: Logo + Brand */}
                    <div className="flex items-center gap-3 cursor-pointer" onClick={() => nav("/")}>
                        <img
                            src="/glaucon.png"
                            alt="Glaucon"
                            className="h-10 w-10 rounded-full ring-1 ring-black/5"
                        />
                        <span className="text-lg font-semibold tracking-wide">
                            Prose
                        </span>
                    </div>

                    {/* Center: Main nav */}
                    <div className="hidden md:flex items-center gap-1">
                        <NavLink
                            to="/"
                            className={({ isActive }) =>
                                `${linkBase} ${isActive ? linkActive : linkInactive}`
                            }
                            end
                        >
                            Home
                        </NavLink>

                        {/* EMPLOYEUR */}
                        {user?.data?.role === "EMPLOYEUR" && (
                            <button
                                onClick={() => nav("post-internship")}
                                className={`${linkBase} ${linkInactive}`}
                            >
                                Post Internship
                            </button>
                        )}

                        {/* ETUDIANT */}
                        {user?.data?.role === "ETUDIANT" && (
                            <button
                                onClick={() => nav("televersement-cv")}
                                className={`${linkBase} ${linkInactive}`}
                            >
                                Upload CV
                            </button>
                        )}

                        {/* Commun */}
                        <button
                            onClick={() => nav("internships")}
                            className={`${linkBase} ${linkInactive}`}
                        >
                            Internship Listings
                        </button>
                        <button
                            onClick={() => nav("profile")}
                            className={`${linkBase} ${linkInactive}`}
                        >
                            Profile
                        </button>
                    </div>

                    {/* Right: Welcome + Logout */}
                    <div className="flex items-center gap-3">
                        <span className="hidden sm:block text-sm text-gray-700">
                            Bienvenue{" "}
                            <strong>
                                {user?.data?.firstName} {user?.data?.lastName}
                            </strong>
                        </span>
                        <button
                            type="button"
                            onClick={userLogout}
                            className="rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-red-400"
                        >
                            Logout
                        </button>
                    </div>
                </div>

                {/* Mobile nav */}
                <div className="md:hidden pb-3 flex flex-wrap gap-2">
                    <NavLink
                        to="/"
                        className={({ isActive }) =>
                            `text-sm ${isActive ? "text-gray-900" : "text-gray-600"}`
                        }
                        end
                    >
                        Home
                    </NavLink>
                    {user?.data?.role === "EMPLOYEUR" && (
                        <button
                            onClick={() => nav("post-internship")}
                            className="text-sm text-gray-600"
                        >
                            Post Internship
                        </button>
                    )}
                    {user?.data?.role === "ETUDIANT" && (
                        <button
                            onClick={() => nav("televersement-cv")}
                            className="text-sm text-gray-600"
                        >
                            Upload CV
                        </button>
                    )}
                    <button
                        onClick={() => nav("internships")}
                        className="text-sm text-gray-600"
                    >
                        Internship Listings
                    </button>
                    <button
                        onClick={() => nav("profile")}
                        className="text-sm text-gray-600"
                    >
                        Profile
                    </button>
                </div>
            </nav>
        </header>

        {/* MAIN */}
        <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
            <Outlet />
        </main>
    </>
    )
}
