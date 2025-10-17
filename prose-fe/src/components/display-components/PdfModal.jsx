import {Viewer, Worker} from "@react-pdf-viewer/core";
import React from "react";

export default function PdfModal({ title, url, error, onClose }) {
    return (
        <div
            className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
        >
            <div
                className="bg-white rounded-lg p-4 md:p-6 w-[92vw] md:w-[800px] max-h-[85vh] overflow-auto shadow-2xl relative"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    className="absolute top-2 right-2 text-gray-600 text-xl"
                    onClick={onClose}
                    aria-label="Fermer"
                >
                    &times;
                </button>

                <h3 className="text-lg font-semibold mb-3">{title}</h3>

                {error ? (
                    <div className="p-3 rounded bg-rose-50 text-rose-700 text-sm">{error}</div>
                ) : url ? (
                    <div className="w-full h-[70vh] border rounded overflow-hidden">
                        <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
                            <Viewer fileUrl={url} />
                        </Worker>
                    </div>
                ) : (
                    <div className="text-sm text-gray-500">Chargement…</div>
                )}
            </div>
        </div>
    );
}