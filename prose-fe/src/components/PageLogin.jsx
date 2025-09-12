// src/components/PageLogin.jsx
import {useEffect, useState} from "react";
import {createEmployee} from "../services/employeurService.js";

export default function PageLogin() {
    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const [pwd, setPwd] = useState("");
    const [showPwd, setShowPwd] = useState(false);
    const [employeur, setEmployeur] = useState("")
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const pwdHint = pwd.length < 10 ? "Min 10 characters" : "Looks good";

    const onSubmit = (e) => {
        e.preventDefault();
        // handle submit
        console.log({email, username, pwd});
    };

    //
    // useEffect(() => {
    //     createEmployee(employeur).then((response) => {
    //         console.log(response.data);
    //         setEmployeur(response.data)
    //     }).catch(error => {
    //         console.error(error);
    //     })
    // }, [])

    return (
        <div className="min-h-screen grid lg:grid-cols-2">
            {/* LEFT HERO */}
            <div className="relative overflow-hidden bg-teal-700/95 text-white">
                <div
                    className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_30%_20%,#fff,transparent_35%)]"/>

                <div className="relative h-full flex flex-col items-center justify-center p-8 lg:p-12 text-center">
                    {/* Top brand */}
                    <div className="text-6xl sm:text-8xl font-bold mb-6">
                        Prose
                    </div>

                    {/* Headline + Image */}
                    <div className="max-w-xl">
                        <h1 className="text-2xl sm:text-xl font-bold tracking-tight mb-12">
                            « La rencontre simple entre étudiants et employeurs. »
                        </h1>

                        <img
                            className="mx-auto block h-60 w-40 rounded-full object-cover mb-12"
                            src="/glaucon.png"
                            alt="Glaucon"
                        />
                        <header>
                            <h2 className="text-xl font-bold">« La justice d’un homme se mesure moins à ses actes
                                publics
                                qu’à ce qu’il ferait s’il était certain de n’être jamais vu. » Glaucon</h2>
                        </header>
                    </div>
                </div>
            </div>


            {/* RIGHT PANEL */
            }

            <div className="bg-[#1f1f23] text-slate-200 grid place-items-center p-6 md:p-10">

                <div className="w-full max-w-md">
                    <h2 className="text-3xl font-bold text-center mb-8">
                        Créez votre compte
                    </h2>
                    {/* FORM */}
                    <form onSubmit={onSubmit} className="space-y-4">
                        {/* Email */}
                        <label className="block">
                            <span className="block text-sm mb-1 text-slate-400">Adresse courriel</span>
                            <div className="relative">
                                <input
                                    type="email"
                                    className={`w-full rounded-xl bg-transparent border px-4 py-3 outline-none transition
                    ${emailOk ? "border-emerald-500" : "border-slate-700 focus:border-teal-500"}`}
                                    placeholder="name@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                                {/* checkmark */}
                                {emailOk && (
                                    <span className="absolute inset-y-0 right-3 my-auto grid place-items-center">
                    <svg viewBox="0 0 24 24" className="w-5 h-5 text-emerald-500">
                      <path fill="currentColor" d="M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z"/>
                    </svg>
                  </span>
                                )}
                            </div>
                        </label>

                        {/* Username */}
                        <label className="block">
                            <span className="block text-sm mb-1 text-slate-400">Nom d'utilisateur</span>
                            <input
                                type="text"
                                className="w-full rounded-xl bg-transparent border border-slate-700 px-4 py-3 outline-none focus:border-teal-500"
                                placeholder="Glauxemple"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                            />
                        </label>

                        {/* Password */}
                        <label className="block">
                            <span className="block text-sm mb-1 text-slate-400">Mot de pass</span>
                            <div className="relative">
                                <input
                                    type={showPwd ? "text" : "password"}
                                    className="w-full rounded-xl bg-transparent border border-slate-700 px-4 py-3 pr-11 outline-none focus:border-teal-500"
                                    placeholder="Min 10 characters"
                                    value={pwd}
                                    onChange={(e) => setPwd(e.target.value)}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPwd((s) => !s)}
                                    className="absolute right-3 inset-y-0 my-auto grid place-items-center text-slate-400 hover:text-slate-200"
                                    aria-label="Toggle password visibility"
                                >
                                    {showPwd ? (
                                        <svg viewBox="0 0 24 24" className="w-5 h-5">
                                            <path fill="currentColor" d="M12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10Z"/>
                                            <path fill="currentColor"
                                                  d="M12 4C6 4 2.1 8.6 1 12c1.1 3.4 5 8 11 8s9.9-4.6 11-8c-1.1-3.4-5-8-11-8Z"/>
                                        </svg>
                                    ) : (
                                        <svg viewBox="0 0 24 24" className="w-5 h-5">
                                            <path fill="currentColor"
                                                  d="M3 4.3 4.3 3l17 17L20.7 21l-3.2-3.2A12.6 12.6 0 0 1 12 20C6 20 2.1 15.4 1 12a12 12 0 0 1 6.4-6.9L3 4.3Zm7.4 7.4a3 3 0 0 0 3 3l-3-3Z"/>
                                            <path fill="currentColor"
                                                  d="M14.1 9.9a3 3 0 0 1 0 4.2l4.7 4.7A15.1 15.1 0 0 0 23 12c-1.1-3.4-5-8-11-8a12.7 12.7 0 0 0-3.9.6l2.6 2.6a3 3 0 0 1 3.4 2.7Z"/>
                                        </svg>
                                    )}
                                </button>
                            </div>
                            <div className="mt-1 text-xs text-slate-500">{pwdHint}</div>
                        </label>


                        {/* Register */}
                        <button
                            type="submit"
                            disabled={!emailOk || pwd.length < 10 || !agree}
                            className="w-full py-3 rounded-xl font-bold text-white transition disabled:opacity-60
                bg-gradient-to-r from-teal-500 to-slate-500 hover:from-teal-400 hover:to-slate-400"
                        >
                            Souscrire
                        </button>
                    </form>

                    <p className="text-sm text-slate-400 text-center mt-4">
                        Déja membre? Cliquez ici pour vous connecter.{" "}
                        <a href="#" className="text-teal-400 hover:underline">Connexion</a>
                    </p>
                </div>
            </div>
        </div>
    )
        ;
}
