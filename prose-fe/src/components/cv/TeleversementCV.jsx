import React, {useRef, useState} from 'react';
import {televerserCv} from "../../services/EtudiantService.js";

const TeleversementCV = () => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [error, setError] = useState('');
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef(null);

    const validerFichier = (file) => {
        if (!file) return false;
        const isPdfByExt = file.name.toLowerCase().endsWith(".pdf");
        const isPdfByType = file.type === "application/pdf";
        return isPdfByExt && isPdfByType;
    }

    const selectionerFichier = (event) => {
        const file = event.target.files?.[0];
        setError('');

        if (!file) {
            setSelectedFile(null);
            return;
        }

        if (!validerFichier(file)) {
            setError('Veuillez sélectionner un fichier PDF valide');
            setSelectedFile(null);

            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setError('Le fichier ne doit pas dépasser 5 MB');
            setSelectedFile(null);

            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }

            return;
        }

        setSelectedFile(file);
    };

    const televerserFichier = async () => {
        if (!selectedFile) return;
        setUploading(true);
        setError('');
        try {
            const data = await televerserCv(selectedFile);
            console.log('Fichier téléversé:', data);
            setSelectedFile(null);
            if (fileInputRef.current) fileInputRef.current.value = '';
            setError('');
        } catch (err) {
            setError(err.message || 'Erreur lors du téléversement');
        } finally {
            setUploading(false);
        }
    };

    const enleverFichier = () => {
        setSelectedFile(null);
        setError('');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Téléverser votre CV</h2>

            <div className="mb-6">
                <div className="relative">
                    <input
                        id="file-input"
                        ref={fileInputRef}
                        type="file"
                        onChange={selectionerFichier}
                        accept="application/pdf"
                        className="hidden"
                    />
                    <label
                        htmlFor="file-input"
                        className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <span className="text-4xl mb-2">📁</span>
                            <p className="text-sm text-gray-500 font-medium">Choisir un fichier</p>
                        </div>
                    </label>
                </div>

                <p className="text-xs text-gray-500 mt-2 text-center">
                    Veuillez choisir un fichier au format PDF.
                    <br />
                    Taille maximum : 5 MB
                </p>
            </div>

            {error && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                    {error}
                </div>
            )}

            {selectedFile && (
                <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                                {selectedFile.name}
                            </p>
                            <p className="text-xs text-gray-500">
                                ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={enleverFichier}
                            className="ml-3 text-red-500 hover:text-red-700 transition-colors"
                        >
                            ✕
                        </button>
                    </div>

                    <button
                        onClick={televerserFichier}
                        disabled={uploading}
                        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2 px-4 rounded transition-colors"
                    >
                        {uploading ? 'Téléversement...' : 'Téléverser'}
                    </button>
                </div>
            )}
        </div>
    );
};

export default TeleversementCV;