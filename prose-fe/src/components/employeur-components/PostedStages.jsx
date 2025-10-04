import {useEffect, useState} from "react";
import {NavLink} from "react-router-dom";
import {useAuth} from "../../context/AuthContext.jsx";
import StageSmall from "../display-components/stage-sm.jsx";
import {getEmployeurStages} from "../../services/StageService.js";

export default function PostedStages() {
    const {user} = useAuth();
    const [stages, setStages] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            const res = await getEmployeurStages(user.email, user.token);
            setStages(res.data);
        }
        fetchData();

    }, [])
    return <div className="mt-2">
        {stages.length > 0 ?
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-12 ml-8">
                {stages.map(stage => (
                    <StageSmall key={stage.id} stage={stage} />))}
            </div>
            : <div className="flex flex-col items-center justify-center h-screen">
                <h1 className="text-3xl">Pas encore de stages? Créez-en un!</h1>
                <button className="text-white bg-gradient-to-r from-teal-400 via-teal-500 to-teal-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-teal-300 dark:focus:ring-teal-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mt-3">
                    <NavLink to="creation-stage">Créer un stage</NavLink>
                </button>
            </div>
        }
    </div>
}