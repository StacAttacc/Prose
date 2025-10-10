import React, {useState} from "react";


export default function ApplicantRow({applicant, onAccept, onReject, disabled}) {
    const [reason, setReason] = useState("");


    return (
        <tr className="border-b last:border-b-0">
            <td className="py-3 px-4 align-top">
                <div className="font-semibold">{applicant?.fullName}</div>
                <div className="text-sm text-gray-500">{applicant?.email}</div>
                {applicant?.school && (
                    <div className="text-xs text-gray-400 mt-0.5">{applicant.school}</div>
                )}
            </td>
            <td className="py-3 px-4 align-top">
                <div className="text-sm">{applicant?.coverLetterSnippet || '—'}</div>
                {applicant?.skills?.length ? (
                    <div className="flex flex-wrap gap-1 mt-2">
                        {applicant.skills.map((s, i) => (
                            <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-gray-100">{s}</span>
                        ))}
                    </div>
                ) : null}
            </td>
            <td className="py-3 px-4 align-top">
                <div className="inline-flex items-center gap-2">
                    {applicant?.cvDownloadUrl ? (
                        <a
                            href={applicant.cvDownloadUrl}
                            target="_blank" rel="noreferrer"
                            className="underline text-sm"
                        >Télécharger CV</a>
                    ) : (
                        <span className="text-sm text-gray-400">CV non disponible</span>
                    )}
                </div>
            </td>
            <td className="py-3 px-4 align-top w-64">
                <div className="text-xs mb-1 text-gray-500">Raison (si rejet)</div>
                <input
                    className="w-full border rounded-md px-2 py-1 text-sm focus:outline-none"
                    placeholder="Optionnel"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    disabled={disabled}
                />
                <div className="flex gap-2 mt-2">
                    <button
                        onClick={() => onAccept?.(applicant)}
                        disabled={disabled}
                        className="px-3 py-1 rounded-md bg-green-600 text-white text-sm disabled:opacity-50"
                    >Accepter
                    </button>
                    <button
                        onClick={() => onReject?.(applicant, reason)}
                        disabled={disabled}
                        className="px-3 py-1 rounded-md bg-red-600 text-white text-sm disabled:opacity-50"
                    >Rejeter
                    </button>
                </div>
            </td>
        </tr>
    );
}