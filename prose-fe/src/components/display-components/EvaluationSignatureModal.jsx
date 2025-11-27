import React, { useState } from 'react';
import { useI18n } from '../../context/I18nContext';
import ErrorBanner from "./ErrorBanner.jsx";

export default function EvaluationSignatureModal({ evaluation, isOpen, onClose, onSign, isCreating = false }) {
    const { t } = useI18n();

    const [password, setPassword] = useState('');
    const [consentChecked, setConsentChecked] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleSign = async (e) => {
        e.preventDefault();
        setError('');

        if (!consentChecked) {
            setError(t('evaluations.signature.consentRequired'));
            return;
        }

        if (!password) {
            setError(t('veuillezSaisirMotDePasse'));
            return;
        }

        if (isCreating) {
            setIsSubmitting(true);
            try {
                await onSign(password);
                handleClose();
            } catch (err) {
                setError(err.message || t('evaluations.signature.error'));
            } finally {
                setIsSubmitting(false);
            }
            return;
        }

        if (!evaluation?.id) {
            setError(t('evaluations.signature.invalidData'));
            return;
        }

        setIsSubmitting(true);
        try {
            await onSign(evaluation.id, password);
            handleClose();
        } catch (err) {
            setError(err.message || t('evaluations.signature.error'));
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        setPassword('');
        setError('');
        setConsentChecked(false);
        setIsSubmitting(false);
        onClose();
    };

    if (!isOpen) return null;

    const alreadySigned = !isCreating && evaluation?.signatureEmployeur !== null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 shadow-xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-gray-800">
                        {isCreating ? t('evaluations.signature.titleCreate') : t('evaluations.signature.title')}
                    </h2>
                    <button
                        onClick={handleClose}
                        className="text-gray-600 hover:text-gray-800 text-2xl"
                        aria-label={t('fermer')}
                    >
                        &times;
                    </button>
                </div>

                {alreadySigned && !isCreating ? (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
                        <p className="font-medium">
                            ✓ {t('evaluations.signature.alreadySigned')}
                        </p>
                        {evaluation.dateSignature && (
                            <p className="text-sm mt-1">
                                {t('evaluations.signature.signedOn')} {new Date(evaluation.dateSignature).toLocaleDateString('fr-FR', {
                                    day: '2-digit',
                                    month: 'long',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}
                            </p>
                        )}
                    </div>
                ) : (
                    <>
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold text-gray-800 mb-3">
                                {t('evaluations.signature.summary')}
                            </h3>
                            <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm">
                                <p>
                                    <span className="font-medium">{t('evaluations.student')}:</span>{' '}
                                    {evaluation?.nomEleve || '-'}
                                </p>
                                <p>
                                    <span className="font-medium">{t('evaluations.companyName')}:</span>{' '}
                                    {evaluation?.nomEntreprise || '-'}
                                </p>
                                {evaluation?.programmeEtudes && (
                                    <p>
                                        <span className="font-medium">{t('evaluations.programLabel')}:</span>{' '}
                                        {evaluation.programmeEtudes}
                                    </p>
                                )}
                                {evaluation?.dateEvaluation && (
                                    <p>
                                        <span className="font-medium">{t('evaluations.evaluatedOn')}:</span>{' '}
                                        {new Date(evaluation.dateEvaluation).toLocaleDateString('fr-FR')}
                                    </p>
                                )}
                            </div>
                        </div>

                        <form onSubmit={handleSign}>
                            <div className="mb-6">
                                <label className="flex items-start cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={consentChecked}
                                        onChange={(e) => setConsentChecked(e.target.checked)}
                                        className="mt-1 h-4 w-4 accent-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                                    />
                                    <span className="ml-3 text-sm text-gray-700">
                                        {isCreating
                                            ? t('evaluations.signature.consentCreate')
                                            : t('evaluations.signature.consent')
                                        }
                                    </span>
                                </label>
                            </div>

                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    {t('entrezMotDePasseConfirmer')}
                                </label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                                    placeholder={t('motDePasseRequisConfirmer')}
                                    disabled={isSubmitting}
                                />
                            </div>

                            {error && (
                                <ErrorBanner message={error} />
                            )}

                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={handleClose}
                                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                                    disabled={isSubmitting}
                                >
                                    {t('common.cancel')}
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 text-white bg-gradient-to-r from-teal-400 via-teal-500 to-teal-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-teal-300 dark:focus:ring-teal-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2"
                                    disabled={isSubmitting || !consentChecked || !password}
                                >
                                    {isSubmitting ? t('signatureEnCours') : t('signerEntente')}
                                </button>
                            </div>
                        </form>
                    </>
                )}

                {alreadySigned && (
                    <div className="mt-4">
                        <button
                            onClick={handleClose}
                            className="w-full bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
                        >
                            {t('fermer')}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}