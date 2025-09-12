// src/components/PageLogin.jsx
import { useState } from "react";

export default function PageLogin() {
    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const [pwd, setPwd] = useState("");
    const [agree, setAgree] = useState(true);
    const [showPwd, setShowPwd] = useState(false);

    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const pwdHint = pwd.length < 10 ? "Min 10 characters" : "Looks good";

    const onSubmit = (e) => {
        e.preventDefault();
        // handle submit
        console.log({ email, username, pwd, agree });
    };

    return (
        <div className="min-h-screen grid lg:grid-cols-2">
            {/* LEFT HERO */}
            <div className="relative overflow-hidden bg-teal-700/95 text-white">
                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_30%_20%,#fff,transparent_35%)]" />
                <div className="relative h-full flex flex-col justify-between p-8 lg:p-12">
                    {/* Top brand */}
                    <div className="flex items-center gap-3">
                        <div className="size-10 rounded-full bg-white/15 grid place-items-center">
                            {/* simple logo mark */}
                            <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="white" strokeWidth="2">
                                <path d="M12 4c3 4 3 8 0 12-3-4-3-8 0-12Z" />
                                <circle cx="12" cy="19" r="1.8" />
                            </svg>
                        </div>
                        <span className="text-2xl font-bold">Healthy</span>
                    </div>

                    {/* Headline */}
                    <div className="max-w-xl">
                        <h1 className="text-4xl/[1.1] sm:text-5xl font-bold tracking-tight">
                           Prose <br />
                        </h1>

                        {/* Watch video button */}
                        <button
                            type="button"
                            className="mt-8 inline-flex items-center gap-3 bg-white/10 backdrop-blur px-5 py-3 rounded-full hover:bg-white/20 transition"
                        >
              <span className="grid place-items-center size-9 rounded-full bg-white text-teal-700">
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
                  <path d="M8 5v14l11-7-11-7Z" />
                </svg>
              </span>
                            <span className="font-medium">Watch video</span>
                        </button>
                    </div>

                    {/* Footer nav */}
                    <nav className="flex gap-8 text-white/80 text-sm">
                        <a href="#" className="hover:text-white">Home</a>
                        <a href="#" className="hover:text-white">Dashboard</a>
                        <a href="#" className="hover:text-white">Doctors</a>
                        <a href="#" className="hover:text-white">Career</a>
                    </nav>
                </div>
            </div>

            {/* RIGHT PANEL */}
            <div className="bg-[#1f1f23] text-slate-200 grid place-items-center p-6 md:p-10">
                <div className="w-full max-w-md">
                    <header className="mb-8">
                        <h2 className="text-3xl font-bold">Get Started Now</h2>
                        <p className="text-sm text-slate-400 mt-1">Enter your details to access your account</p>
                    </header>

                    {/* Social buttons */}
                    <div className="grid grid-cols-2 gap-3">
                        <button className="flex items-center justify-center gap-2 border border-slate-700 rounded-xl py-2.5 hover:bg-white/5 transition">
                            <svg viewBox="0 0 24 24" className="w-5 h-5">
                                <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.24 1.4-1.67 4.1-5.5 4.1A6.6 6.6 0 1 1 12 5.4a6 6 0 0 1 4.2 1.6l2.8-2.8A10 10 0 1 0 12 22c5.8 0 9.8-4.1 9.8-9.8 0-.65-.07-1.14-.17-1.6H12Z"/>
                            </svg>
                            <span className="text-sm font-medium">Log In with Google</span>
                        </button>
                        <button className="flex items-center justify-center gap-2 border border-slate-700 rounded-xl py-2.5 hover:bg-white/5 transition">
                            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
                                <path d="M17.6 22c-1.2 0-1.7-.8-2.8-.8s-1.6.8-2.8.8C9.7 22 8 19.6 8 16.9 8 14.1 10 12 12 12c1 0 1.8.7 2.8.7s1.7-.7 2.8-.7c.3 0 .7 0 1 .1-.1 2.7-1.9 4-1.9 4 .6.3 1.2 1 1.2 2.3 0 2-1.4 3.6-2.3 3.6Z"/>
                            </svg>
                            <span className="text-sm font-medium">Log In with Apple</span>
                        </button>
                    </div>

                    <div className="my-6 flex items-center gap-4 text-slate-500">
                        <div className="h-px flex-1 bg-slate-700/70" />
                        <span className="text-xs">OR</span>
                        <div className="h-px flex-1 bg-slate-700/70" />
                    </div>

                    {/* FORM */}
                    <form onSubmit={onSubmit} className="space-y-4">
                        {/* Email */}
                        <label className="block">
                            <span className="block text-sm mb-1 text-slate-400">Email address</span>
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
                      <path fill="currentColor" d="M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z" />
                    </svg>
                  </span>
                                )}
                            </div>
                        </label>

                        {/* Username */}
                        <label className="block">
                            <span className="block text-sm mb-1 text-slate-400">Username</span>
                            <input
                                type="text"
                                className="w-full rounded-xl bg-transparent border border-slate-700 px-4 py-3 outline-none focus:border-teal-500"
                                placeholder="Hoyin_Dolapor"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                            />
                        </label>

                        {/* Password */}
                        <label className="block">
                            <span className="block text-sm mb-1 text-slate-400">Password</span>
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
                                        <svg viewBox="0 0 24 24" className="w-5 h-5"><path fill="currentColor" d="M12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10Z"/><path fill="currentColor" d="M12 4C6 4 2.1 8.6 1 12c1.1 3.4 5 8 11 8s9.9-4.6 11-8c-1.1-3.4-5-8-11-8Z"/></svg>
                                    ) : (
                                        <svg viewBox="0 0 24 24" className="w-5 h-5"><path fill="currentColor" d="M3 4.3 4.3 3l17 17L20.7 21l-3.2-3.2A12.6 12.6 0 0 1 12 20C6 20 2.1 15.4 1 12a12 12 0 0 1 6.4-6.9L3 4.3Zm7.4 7.4a3 3 0 0 0 3 3l-3-3Z"/><path fill="currentColor" d="M14.1 9.9a3 3 0 0 1 0 4.2l4.7 4.7A15.1 15.1 0 0 0 23 12c-1.1-3.4-5-8-11-8a12.7 12.7 0 0 0-3.9.6l2.6 2.6a3 3 0 0 1 3.4 2.7Z"/></svg>
                                    )}
                                </button>
                            </div>
                            <div className="mt-1 text-xs text-slate-500">{pwdHint}</div>
                        </label>

                        {/* Agree */}
                        <label className="flex items-start gap-3 text-sm">
                            <input
                                type="checkbox"
                                checked={agree}
                                onChange={(e) => setAgree(e.target.checked)}
                                className="mt-1 size-4 rounded border-slate-700 bg-transparent accent-teal-500"
                            />
                            <span>
                I agree to the{" "}
                                <a href="#" className="text-teal-400 hover:underline">
                  Terms &amp; Conditions
                </a>
              </span>
                        </label>

                        {/* Register */}
                        <button
                            type="submit"
                            disabled={!emailOk || pwd.length < 10 || !agree}
                            className="w-full py-3 rounded-xl font-bold text-white transition disabled:opacity-60
                bg-gradient-to-r from-teal-500 to-slate-500 hover:from-teal-400 hover:to-slate-400"
                        >
                            Register
                        </button>
                    </form>

                    <p className="text-sm text-slate-400 text-center mt-4">
                        Already a member?{" "}
                        <a href="#" className="text-teal-400 hover:underline">Login</a>
                    </p>
                </div>
            </div>
        </div>
    );
}
