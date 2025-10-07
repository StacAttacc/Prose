export default function StageSmall({ stage }) {
    return (
        <div className="card w-48 bg-base-100 shadow-black shadow-lg border-2 rounded-xl mb-2 p-2">
            <div className="card-body">
                <h2 className="card-title text-center text-xl font-bold">{stage.title}</h2>
                <p className="text-center my-1">Salaire {stage.compensation}</p>
                <p className="text-center my-1"> Se trouve a: {stage.location}</p>
                <p className="text-center my-1">Offert par: {stage.employeur.company}</p>
                <hr />
                <div className="card-actions justify-end">
                    {/**Future: Page de détails pour appliquer pour un stage.**/}
                </div>
            </div>
        </div>
    )
}