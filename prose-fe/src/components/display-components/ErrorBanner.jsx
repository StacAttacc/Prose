import React from 'react';

export default function ErrorBanner({ message }) {
    // Convertir les sauts de ligne en éléments <br> pour un meilleur affichage
    const formatMessage = (msg) => {
        if (typeof msg !== 'string') return msg;
        return msg.split('\n').map((line, index, array) => (
            <React.Fragment key={index}>
                {line}
                {index < array.length - 1 && <br />}
            </React.Fragment>
        ));
    };

    return (
        <div className="mb-4 rounded-lg border border-rose-600 bg-rose-900/15 p-3 text-rose-800 whitespace-pre-line">
            {formatMessage(message)}
        </div>
    )
}