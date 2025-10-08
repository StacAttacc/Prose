import {useState, useEffect} from "react";
import {useNavigate} from "react-router-dom";
import {useAuth} from "../../context/AuthContext.jsx";
import {updateStage} from "../../services/StageService.js";

export default function StageModification({ stage, onClose }) {
    const {user} = useAuth();
    const nav = useNavigate();

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [prerequisites, setPrerequisites] = useState("");
    const [skills, setSkills] = useState([""]);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [location, setLocation] = useState("");
    const [workType, setWorkType] = useState("");
    const [salary, setSalary] = useState("");

    // Préremplir les champs avec les données du stage
    useEffect(() => {
        if (stage) {
            setTitle(stage.title || "");
            setDescription(stage.description || "");
            setPrerequisites(stage.requirements || "");
            setSkills(stage.skills && stage.skills.length > 0 ? stage.skills : [""]);
            
            // Formater les dates pour les inputs de type date
            if (stage.startDate) {
                const startDateFormatted = new Date(stage.startDate).toISOString().split('T')[0];
                setStartDate(startDateFormatted);
            }
            if (stage.endDate) {
                const endDateFormatted = new Date(stage.endDate).toISOString().split('T')[0];
                setEndDate(endDateFormatted);
            }
            
            setLocation(stage.location || "");
            setWorkType(stage.workMode || "");
            setSalary(stage.compensation || "");
        }
    }, [stage]);

    const canSubmit = title.length > 0 &&
        description.length > 0 &&
        prerequisites.length > 0 &&
        skills.every((skill) => skill.length > 0) &&
        startDate &&
        endDate &&
        workType.length > 0 &&
        salary.length > 0;

    async function submit(e) {
        e.preventDefault();
        
        let updatedStage = {
            "id": stage.id,
            "title": title,
            "description": description,
            "requirements": prerequisites,
            "skills": skills,
            "startDate": startDate,
            "endDate": endDate,
            "location": location,
            "compensation": salary,
            "employeur": user,
            "workMode": workType,
            "status": "SOUMISE" // Remettre le statut à SOUMISE après modification
        }

        try {
            await updateStage(updatedStage, user.token);
            alert("Stage modifié avec succès !");
            onClose(); // Fermer la modal
            nav('/'); // Rediriger vers la page d'accueil
        } catch (error) {
            console.error("Erreur lors de la modification:", error);
            alert("Erreur lors de la modification du stage");
        }
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold">Modification du Stage</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 text-2xl"
                    >
                        ×
                    </button>
                </div>

                <form className="my-8" onSubmit={submit}>
                    <label className="block">
                        <span className="block text-sm mb-1 text-slate-400">Titre d'emploi</span>
                        <div className="relative">
                            <input
                                className={`w-full rounded-xl bg-transparent border px-4 py-3 outline-none focus:border-teal-500 ${!title.trim() ? "border-rose-600" : "border-slate-700"
                                }`}
                                type="text"
                                name="title"
                                placeholder="Conducteur de camion"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                            />
                        </div>
                    </label>
                    
                    <label className="block">
                        <span className="block text-sm mb-1 text-slate-400">Description de l'emploi</span>
                        <div className="relative">
                            <textarea
                                className={`w-full rounded-xl bg-transparent border px-4 py-3 outline-none focus:border-teal-500 ${!description.trim() ? "border-rose-600" : "border-slate-700"
                                }`}
                                name="description"
                                placeholder="Conduit des camions pour transporter de la marchandise, remplir l'essence si nécessaire et changer un pneu si nécessaire."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                        </div>
                    </label>
                    
                    <label className="block">
                        <span className="block text-sm mb-1 text-slate-400">Prérequis nécéssaires</span>
                        <div className="relative">
                            <input
                                type="text"
                                className={`w-full rounded-xl bg-transparent border px-4 py-3 outline-none focus:border-teal-500 ${!prerequisites.trim() ? "border-rose-600" : "border-slate-700"
                                }`}
                                name="prerequisites"
                                placeholder="Diplômes d'études Secondaires, Permis de Conduite"
                                value={prerequisites}
                                onChange={(e) => setPrerequisites(e.target.value)}
                            />
                        </div>
                    </label>
                    
                    <label className="block my-3">
                        <span className="block text-sm mb-1 text-slate-400">Compétences demandées</span>
                        <button className="text-white bg-gradient-to-r from-teal-400 via-teal-500 to-teal-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-teal-300 dark:focus:ring-teal-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2"
                                onClick={() => {setSkills([...skills, ""])}} type="button">Ajouter</button>
                        <button className="text-white bg-gradient-to-r
                                        from-red-400 via-red-500 to-red-600
                                        hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-red-300
                                        dark:focus:ring-red-800 font-medium rounded-lg text-sm px-3 py-2.5 text-center me-2"
                                onClick={() => {setSkills(skills.slice(0, -1))}} type="button">Retirer</button>
                        {skills.map((item, index) => (
                            <div className="relative" key={index}>
                            <input
                            className={`w-full rounded-xl bg-transparent border px-4 py-3 outline-none my-1 focus:border-teal-500 ${!skills[index].trim() ? "border-rose-600" : "border-slate-700"
                            }`}
                            type="text"
                            placeholder="assiduite"
                            name={"skill" + index}
                            value={skills[index]}
                            onChange={(e) => {
                                let skillsModified = [...skills];
                                skillsModified[index] = e.target.value;
                                setSkills(skillsModified);
                            }}
                            />
                            </div>
                        ))}
                    </label>
                    
                    <label className="block">
                        <div className="flex">
                            <div className="flex-1 mr-3">
                                <span className="block text-sm mb-1 text-slate-400">Date de début</span>
                                <div className="relative">
                                    <input
                                        className={`w-full rounded-xl bg-transparent border px-4 py-3 outline-none focus:border-teal-500 ${!startDate ? "border-rose-600" : "border-slate-700"
                                        }`}
                                        type="date"
                                        name="startDate"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="flex-1">
                                <span className="block text-sm mb-1 text-slate-400">Date de fin</span>
                                <div className="relative">
                                    <input
                                        className={`w-full rounded-xl bg-transparent border px-4 py-3 outline-none focus:border-teal-500 ${!endDate ? "border-rose-600" : "border-slate-700"
                                        }`}
                                        type="date"
                                        name="endDate"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                    </label>
                    
                    <label className="block">
                        <span className="block text-sm mb-1 text-slate-400">Location</span>
                        <div className="relative">
                            <input
                                type="text"
                                className={`w-full rounded-xl bg-transparent border px-4 py-3 outline-none focus:border-teal-500 ${!location.trim() ? "border-rose-600" : "border-slate-700"
                                }`}
                                name="location"
                                placeholder="présentiel"
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                            />
                        </div>
                    </label>
                    
                    <label className="block">
                        <span className="block text-sm mb-1 text-slate-400">Type de travail</span>
                        <div className="relative">
                            <input
                                type="text"
                                className={`w-full rounded-xl bg-transparent border px-4 py-3 outline-none focus:border-teal-500 ${!workType.trim() ? "border-rose-600" : "border-slate-700"
                                }`}
                                name="workType"
                                placeholder="présentiel"
                                value={workType}
                                onChange={(e) => setWorkType(e.target.value)}
                            />
                        </div>
                    </label>
                    
                    <label className="block">
                        <span className="block text-sm mb-1 text-slate-400">Rémunération</span>
                        <div className="relative">
                            <input
                                type="text"
                                className={`w-full rounded-xl bg-transparent border px-4 py-3 outline-none focus:border-teal-500 ${!salary.trim() ? "border-rose-600" : "border-slate-700"
                                }`}
                                name="salary"
                                placeholder="26$/h"
                                value={salary}
                                onChange={(e) => setSalary(e.target.value)}
                            />
                        </div>
                    </label>
                    
                    <div className="flex justify-end space-x-4 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            disabled={!canSubmit}
                            className={`px-4 py-2 rounded-xl font-bold transition disabled:opacity-60 text-white bg-gradient-to-r from-teal-500 to-slate-500 hover:from-teal-400 hover:to-slate-400"
                            }`}
                        >
                            Modifier le Stage
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}