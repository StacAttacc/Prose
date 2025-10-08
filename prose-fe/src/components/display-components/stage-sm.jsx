import { useState } from "react";
import StageModification from "../employeur-components/StageModification";


export default function StageSmall({ stage, onModifyStage }) {
    const [isModificationModalOpen, setIsModificationModalOpen] = useState(false);
    
    const getStatusColor = (status) => {
        switch (status) {
            case 'SOUMISE':
                return 'bg-yellow-100 text-yellow-800';
            case 'APPROUVEE':
                return 'bg-green-100 text-green-800';
            case 'REJETEE':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'SOUMISE':
                return 'Soumise';
            case 'APPROUVEE':
                return 'Approuvée';
            case 'REJETEE':
                return 'Rejetée';
            default:
                return status;
        }
    };

    const handleModifyClick = () => {
        setIsModificationModalOpen(true);
    };

    const handleCloseModification = () => {
        setIsModificationModalOpen(false);
        // Optionnel : rafraîchir la liste des stages
        if (onModifyStage) {
            onModifyStage();
        }
    };

    return (
        <>
            <div className="card w-48 bg-base-100 shadow-black shadow-lg border-2 rounded-xl mb-2 p-2">
                <div className="card-body">
                    <h2 className="card-title text-center text-xl font-bold">{stage.title}</h2>
                    
                    {/* Affichage du statut */}
                    <div className="text-center my-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(stage.status)}`}>
                            {getStatusText(stage.status)}
                        </span>
                    </div>
                    
                    <p className="text-center my-1">Salaire {stage.compensation}</p>
                    <p className="text-center my-1"> Se trouve a: {stage.location}</p>
                    <p className="text-center my-1">Offert par: {stage.employeur?.firstName} {stage.employeur?.lastName}</p>
                    
                    {/* Affichage de la raison de rejet si le stage est rejeté */}
                    {stage.status === 'REJETEE' && stage.rejectionReason && (
                        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded">
                            <p className="text-xs text-red-700">
                                <strong>Raison du rejet :</strong> {stage.rejectionReason}
                            </p>
                        </div>
                    )}
                    
                    <hr />
                    <div className="card-actions justify-end">
                        {/* Bouton de modification pour les stages rejetés */}
                        {stage.status === 'REJETEE' && (
                            <button 
                                onClick={handleModifyClick}
                                className="btn btn-sm btn-primary"
                            >
                                Modifier
                            </button>
                        )}
                        
                        {/* Future: Page de détails pour appliquer pour un stage */}
                        {stage.status === 'APPROUVEE' && (
                            <button className="btn btn-sm btn-success">
                                Postuler
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Modal de modification */}
            {isModificationModalOpen && (
                <StageModification 
                    stage={stage} 
                    onClose={handleCloseModification}
                />
            )}
        </>
    )
}