
import {logout} from "../services/AuthService.js";
import {useNavigate} from "react-router-dom";
import {Outlet} from "react-router";

export default function Dashboard() {
    const user = JSON.parse(sessionStorage.getItem("user"));
    const nav = useNavigate();

    async function userLogout() {
        await logout();
        nav('/login');
    }

    return <>
        <header className="p-2">
            <nav className="relative bg-teal-700/95 rounded-xl shadow-black shadow-sm">
                <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
                    <div className="relative flex h-16 items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div
                                className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
                                <button className="relative flex rounded-full">
                                    <img
                                        src="/glaucon.png"
                                        alt="Glaucon"
                                        className="size-11 rounded-full outline -outline-offset-1 outline-white/10 h-19 w-10"/>
                                </button>
                                <p className="text-white pl-4 text-2xl">Prose</p>
                            </div>
                        </div>
                        <div className="ml-auto">
                            <p className="text-white text-lg">Bienvenue {user.firstName + " " + user.lastName}
                                <button type="button"
                                        className="text-white bg-gradient-to-r
                                    from-red-400 via-red-500 to-red-600
                                    hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-red-300
                                    dark:focus:ring-red-800 font-medium rounded-lg text-sm px-3 py-2.5 text-center me-2 ml-4"
                                        onClick={userLogout}
                                >Logout</button>
                            </p>
                        </div>
                    </div>
                </div>
            </nav>
            <nav className="relative bg-teal-700/95 rounded-xl mt-2 shadow-black shadow-sm">
                <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
                    <div className="relative flex h-12 items-center justify-around">
                        {user.role === "EMPLOYEUR" ? (
                            <>
                                {/*Ex: <button onClick(() => {navigate('/create-stage')})>*/}
                                {/*Mettre mes options ici*/}
                            </>
                        ) : <></>}
                        {user.role === "ETUDIANT" ? (
                            <>
                                {/*Mettre mes options ici*/}
                            </>
                        ) : <></>}
                        {user.role === "GESTIONNAIRE" ? (
                            <>
                                {/*Mettre mes options ici*/}
                            </>
                        ) : <></>}
                        {user.role === "PROFESSEUR" ? (
                            <>
                                {/*Mettre mes options ici*/}
                            </>
                        ) : <></>}
                    </div>
                </div>
            </nav>
        </header>
        <main className="flex">
            <div className="mx-auto">
                <Outlet/>
            </div>
            <div className="ml-4 mr-6">
                {/*Notifications*/}
            </div>
        </main>
    </>
}
