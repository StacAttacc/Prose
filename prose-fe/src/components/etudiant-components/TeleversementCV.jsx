import React, {useRef, useState} from 'react';
import {televerserCv} from "../../services/EtudiantService.js";
import {useI18n} from "../../context/I18nContext.jsx";
import ErrorBanner from "../display-components/ErrorBanner.jsx";

const TeleversementCV = ({ onUploadSuccess }) => {
    const { t } = useI18n();
    const [selectedFile, setSelectedFile] = useState(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
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
        setSuccess('');

        if (!file) {
            setSelectedFile(null);
            return;
        }

        if (!validerFichier(file)) {
            setError(t('veuillezSelectionnerPDFValide'));
            setSelectedFile(null);

            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setError(t('fichierNeDoitPasDepasser5MB'));
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
        setSuccess('')
        try {
            await televerserCv(selectedFile);
            setSelectedFile(null);
            if (fileInputRef.current) fileInputRef.current.value = '';
            setError('');
            setSuccess(t('cvTeleverseSucces'));
            if (onUploadSuccess) {
                onUploadSuccess();
            }
        } catch (err) {
            setError(err.message || t('erreurTeleversement'));
        } finally {
            setUploading(false);
        }
    };

    const enleverFichier = () => {
        setSelectedFile(null);
        setError('');
        setSuccess('');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div className="max-w-md mx-auto p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">{t('televerserCV')}</h2>

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
                            <p className="text-sm text-gray-500 font-medium">{t('choisirFichier')}</p>
                        </div>
                    </label>
                </div>

                <p className="text-xs text-gray-500 mt-2 text-center">
                    {t('veuillezChoisirFichierPDF')}
                    <br/>
                    {t('tailleMaximum5MB')}
                </p>
            </div>

            {error && (
                <ErrorBanner message={error} />
            )}
            {success && (
                <div className="mb-4 p-3 bg-emerald-100 border border-emerald-400 text-emerald-700 rounded">
                    {success}
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
                        className="w-full text-white bg-gradient-to-r from-teal-400 via-teal-500 to-teal-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-teal-300 dark:focus:ring-teal-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2"
                    >
                        {uploading ? t('televersement') : t('televerser')}
                    </button>
                </div>
            )}
        </div>
    );
};

export default TeleversementCV;