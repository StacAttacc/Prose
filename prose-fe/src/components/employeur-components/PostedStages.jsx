import {useEffect, useState} from "react";
import {NavLink} from "react-router-dom";
import {useAuth} from "../../context/AuthContext.jsx";
import StageSmall from "../display-components/stage-sm.jsx";
import {getEmployeurStages} from "../../services/StageService.js";
export default function PostedStages() {
    const {user} = useAuth();
    const [stages, setStages] = useState([]);
    const [loading, setLoading] = useState(true);


    const fetchStages = async () => {
        try {
            const data = await getEmployeurStages(user.email, user.token);
            setStages(data.data);
        } catch (error) {
            console.error("Erreur lors du chargement des stages:", error);
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        fetchStages();
    }, []);


    if (loading) return <div className="p-4">Chargement…</div>;


    return (
        <div className="p-4 md:p-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Mes offres publiées</h1>
            </div>


            <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {stages?.length ? stages.map((s) => (
                    <div key={s.id} className="rounded-2xl border bg-white shadow-sm p-4 flex flex-col">
                        <StageSmall stage={s}/>
                        <div className="mt-4 flex justify-center gap-2">
                            <NavLink
                                to={`/employeur/stages/${s.id}/candidatures`}
                                className="px-4 py-1.5 text-sm rounded-lg border border-teal-600 text-shadow-black hover:bg-teal-50 transition"
                            >Voir les candidatures
                            </NavLink>
                        </div>
                    </div>
                )) : (
                    <div>Aucune offre publiée.</div>
                )}
            </div>
        </div>
    )
}