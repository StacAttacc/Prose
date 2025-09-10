import { useState } from "react";

export default function PageLogin() {
    const [formData, setFormData] = useState({
        nom: "",
        email: "",
        entreprise: "",
        password: "",
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("Données soumises :", formData);
    };

    return (
        <div className="flex justify-center items-center h-screen bg-green-100">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
                <h1 className="text-2xl font-bold text-center text-green-700 mb-6">
                    Créer un compte employeur
                </h1>
                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Nom */}
                    <div>
                        <label className="block text-gray-700 font-medium mb-1">
                            Nom complet
                        </label>
                        <input
                            type="text"
                            name="nom"
                            value={formData.nom}
                            onChange={handleChange}
                            placeholder="Entrez votre nom"
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                            required
                        />
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block text-gray-700 font-medium mb-1">
                            Adresse e-mail
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="exemple@email.com"
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                            required
                        />
                    </div>

                    {/* Entreprise */}
                    <div>
                        <label className="block text-gray-700 font-medium mb-1">
                            Entreprise
                        </label>
                        <input
                            type="text"
                            name="entreprise"
                            value={formData.entreprise}
                            onChange={handleChange}
                            placeholder="Nom de l'entreprise"
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                            required
                        />
                    </div>

                    {/* Mot de passe */}
                    <div>
                        <label className="block text-gray-700 font-medium mb-1">
                            Mot de passe
                        </label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="********"
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                            required
                        />
                    </div>

                    {/* Bouton */}
                    <button
                        type="submit"
                        className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition duration-300"
                    >
                        S'inscrire
                    </button>
                </form>
            </div>
        </div>
    );
}
