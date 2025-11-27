import {useState} from "react";
import {useNavigate} from "react-router-dom";
import {useAuth} from "../../context/AuthContext.jsx";
import {useI18n} from "../../context/I18nContext.jsx";
import {createStage} from "../../services/EmployeurService.js";
import ErrorBanner from "../display-components/ErrorBanner.jsx";

export default function StageCreation() {
    const {user} = useAuth();
    const {t} = useI18n();

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [prerequisites, setPrerequisites] = useState("");
    const [skills, setSkills] = useState([""]);
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());
    const [location, setLocation] = useState("");
    const [workType, setWorkType] = useState("");
    const [salary, setSalary] = useState("");

    const [errorMsg, setErrorMsg] = useState("");

    const nav = useNavigate();

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
        let stage = {
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
        }

        try {
            await createStage(stage, user.token)
            nav('/')
        } catch (error) {
            if (!navigator.onLine) {
                setErrorMsg(t('erreurConnexionInternet'));
            } else {
                setErrorMsg(error.response?.data?.message || t('serviceIndisponible'));
            }
        }


    }

    return (
        <>
            <h2 className="text-center text-xl font-bold">{t('creationStage')}</h2>

            {errorMsg && (
                <ErrorBanner message={errorMsg} />
            )}

            <form className="mt-8 mb-3" onSubmit={submit}>
                <label className="block">
                    <span className="block text-sm mb-1 text-slate-400">{t('titreEmploi')}</span>
                    <div className="relative">
                        <input
                            className={`w-full rounded-xl bg-transparent border px-4 py-3 outline-none focus:border-teal-500 ${!title.trim() ? "border-rose-600" : "border-slate-700"
                            }`}
                            type="text"
                            name="title"
                            placeholder={t('titreEmploiPlaceholder')}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </div>
                </label>
                <label className="block">
                    <span className="block text-sm mb-1 text-slate-400">{t('descriptionEmploi')}</span>
                    <div className="relative">
                        <textarea
                            className={`w-full rounded-xl bg-transparent border px-4 py-3 outline-none focus:border-teal-500 ${!description.trim() ? "border-rose-600" : "border-slate-700"
                            }`}
                            name="description"
                            placeholder={t('descriptionEmploiPlaceholder')}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>
                </label>
                <label className="block">
                    <span className="block text-sm mb-1 text-slate-400">{t('prerequisNecessaires')}</span>
                    <div className="relative">
                        <input
                            type="text"
                            className={`w-full rounded-xl bg-transparent border px-4 py-3 outline-none focus:border-teal-500 ${!prerequisites.trim() ? "border-rose-600" : "border-slate-700"
                            }`}
                            name="prerequisites"
                            placeholder={t('prerequisPlaceholder')}
                            onChange={(e) => setPrerequisites(e.target.value)}
                        />
                    </div>
                </label>
                <label className="block my-3">
                    <span className="block text-sm mb-1 text-slate-400">{t('competencesDemandees')}</span>
                    <button className="text-white bg-gradient-to-r from-teal-400 via-teal-500 to-teal-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-teal-300 dark:focus:ring-teal-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2"
                            onClick={() => {setSkills([...skills, ""])}} type="button">{t('ajouter')}</button>
                    <button className="text-white bg-gradient-to-r
                                    from-red-400 via-red-500 to-red-600
                                    hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-red-300
                                    dark:focus:ring-red-800 font-medium rounded-lg text-sm px-3 py-2.5 text-center me-2"
                            onClick={() => {setSkills(skills.slice(0, -1))}} type="button">{t('retirer')}</button>
                    {skills.map((item, index) => (
                        <div key={index} className="relative">
                            <input
                                className={`w-full rounded-xl bg-transparent border px-4 py-3 outline-none my-1 focus:border-teal-500 ${
                                    !skills[index].trim() ? "border-rose-600" : "border-slate-700"
                                }`}
                                type="text"
                                placeholder={t('competencePlaceholder')}
                                name={"skill" + index}
                                value={item}
                                onChange={(e) => {
                                    const skillsModified = [...skills];
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
                            <span className="block text-sm mb-1 text-slate-400">{t('dateDebut')}</span>
                            <div className="relative">
                                <input
                                    className={`w-full rounded-xl bg-transparent border px-4 py-3 outline-none focus:border-teal-500 ${!startDate ? "border-rose-600" : "border-slate-700"
                                    }`}
                                    type="date"
                                    name="startDate"
                                    onChange={(e) => {
                                        let date = new Date(e.target.value);
                                        setStartDate(date)
                                    }}
                                />
                            </div>
                        </div>
                        <div className="flex-1">
                            <span className="block text-sm mb-1 text-slate-400">{t('dateFin')}</span>
                            <div className="relative">
                                <input
                                    className={`w-full rounded-xl bg-transparent border px-4 py-3 outline-none focus:border-teal-500 ${!endDate ? "border-rose-600" : "border-slate-700"
                                    }`}
                                    type="date"
                                    name="endDate"
                                    onChange={(e) => {
                                        let date = new Date(e.target.value);
                                        setEndDate(date)
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </label>
                <label className="block">
                    <span className="block text-sm mb-1 text-slate-400">{t('location')}</span>
                    <div className="relative">
                        <input
                            type="text"
                            className={`w-full rounded-xl bg-transparent border px-4 py-3 outline-none focus:border-teal-500 ${!location.trim() ? "border-rose-600" : "border-slate-700"
                            }`}
                            name="location"
                            placeholder={t('lieuPlaceholderEmployeur')}
                            onChange={(e) => setLocation(e.target.value)}
                        />
                    </div>
                </label>
                <label className="block">
                    <span className="block text-sm mb-1 text-slate-400">{t('typeTravail')}</span>
                    <div className="relative">
                        <input
                            type="text"
                            className={`w-full rounded-xl bg-transparent border px-4 py-3 outline-none focus:border-teal-500 ${!workType.trim() ? "border-rose-600" : "border-slate-700"
                            }`}
                            name="workType"
                            placeholder={t('modeTravailPlaceholder')}
                            onChange={(e) => setWorkType(e.target.value)}
                        />
                    </div>
                </label>
                <label className="block">
                    <span className="block text-sm mb-1 text-slate-400">{t('remuneration')}</span>
                    <div className="relative">
                        <input
                            type="text"
                            className={`w-full rounded-xl bg-transparent border px-4 py-3 outline-none focus:border-teal-500 ${!salary.trim() ? "border-rose-600" : "border-slate-700"
                            }`}
                            name="salary"
                            placeholder={t('salairePlaceholder')}
                            onChange={(e) => setSalary(e.target.value)}
                        />
                    </div>
                </label>
                <button
                    type="submit"
                    disabled={!canSubmit}
                    className={`w-full py-3 mt-3 rounded-xl font-bold transition disabled:opacity-60 text-white bg-gradient-to-r from-teal-500 to-slate-500  hover:from-teal-400 hover:to-slate-400"
                    }`}>{t('creer')}</button>
            </form>
        </>
    )
}