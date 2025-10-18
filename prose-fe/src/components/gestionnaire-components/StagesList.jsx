import React from 'react';
import { NavLink } from 'react-router-dom';


export default function StagesList() {
    const stages = [
        { id: 1, title: "Développeur Java Backend" },
        { id: 2, title: "Frontend React" },
    ];
    return (
        <div className="p-4 md:p-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Stages (Gestionnaire)</h1>
            </div>
            <div className="mt-4 grid gap-3">
                {stages.map(s => (
                    <NavLink
                        key={s.id}
                        to={`/gestionnaire/stages/${s.id}/candidatures`}
                        className="rounded-lg border p-3 hover:bg-black/5"
                    >
                        #{s.id} — {s.title}
                    </NavLink>
                ))}
            </div>
        </div>
    );
}