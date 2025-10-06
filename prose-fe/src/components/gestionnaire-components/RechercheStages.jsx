import {useEffect, useState} from "react";
import StageSmall from "../display-components/stage-sm.jsx";
import {getEmployeurStages} from "../../services/StageService.js";
import {useAuth} from "../../context/AuthContext.jsx";

export default function GestRechercheStages() {
    const { user } = useAuth();

    const [stages, setStages] = useState([]);

    const [page, setPage] = useState(1);

    useEffect(() => {
        const fetchData = async () => {
            const res = await getEmployeurStages("jemployeur1@gmail.com", user.token);
            setStages(res.data);
        }
        fetchData();
    })

    return <>
        {stages.length > 0 ?
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-12 ml-8">
                {stages.map(stage => (
                    <StageSmall key={stage.id} stage={stage} />))}
            </div>
            : <div className="flex flex-col items-center justify-center h-screen">
                <h1 className="text-3xl">Aucun stage trouvé.</h1>
            </div>
        }
        <div className="flex items-center justify-around">
            <button onClick={() => {
                if (page !== 1){
                    setPage(page - 1)
                }
            }}>&larr;</button>
            <span>{page}</span>
            <button onClick={() => {setPage(page + 1)}}>&rarr;</button>
        </div>
    </>
}