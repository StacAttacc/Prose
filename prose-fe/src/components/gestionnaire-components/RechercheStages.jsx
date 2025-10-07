import {useEffect, useState} from "react";
import StageSmall from "../display-components/stage-sm.jsx";
import {useAuth} from "../../context/AuthContext.jsx";
import {getAllStages} from "../../services/GestionnaireService.js";

export default function GestRechercheStages() {
    const { user } = useAuth();

    const [allStages, setAllStages] = useState([]);

    const [stages, setStages] = useState([]);

    const [searchField, setSearchField] = useState("");

    useEffect(() => {
        const fetchData = async () => {
            const res = await getAllStages(user.token);
            setAllStages(res.data);
            setStages(res.data);
        }
        fetchData();
    }, [])

    function applySearch() {
        if (searchField === "") {
            setStages(allStages);
        } else {
            const filtered = allStages.filter((stage) => stage.employeur.company.includes(searchField));
            setStages(filtered);
        }

    }

    return <>
        <h2 className="text-center text-xl font-bold mb-8">Recherche de stages</h2>

        <label className="block mb-6">
            <span className="block text-sm mb-1 text-center">Nom de l'employeur</span>
            <input type="text" className="w-full rounded-xl bg-transparent border px-4 py-3 outline-none focus:border-teal-500 border-black mb-1" value={searchField} onChange={(e) => setSearchField(e.target.value)} />
            <div className="flex justify-center">
                <button onClick={() => {applySearch()}} className="text-white bg-gradient-to-r from-teal-400 via-teal-500 to-teal-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-teal-300 dark:focus:ring-teal-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2">
                    Rechercher
                </button>
            </div>
        </label>

        {stages.length > 0 ?
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-12 ml-8">
                {stages.map(stage => (
                    <StageSmall key={stage.id} stage={stage} />))}
            </div>
            : <div className="flex flex-col items-center justify-center h-screen">
                <h1 className="text-3xl">Aucun stage trouvé.</h1>
            </div>
        }
    </>
}