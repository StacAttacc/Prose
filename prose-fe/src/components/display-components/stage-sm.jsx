import StageDetailsModal from "./StageDetailsModal.jsx";

export default function StageSmall({ stage }) {
    return (
        <div className="rounded-2xl bg-white border border-gray-100 p-5 flex flex-col items-center text-center">
            <h2 className="text-lg font-semibold text-gray-800 mb-1">{stage.title}</h2>
            <div className="text-sm text-gray-600 space-y-1">
                <p>
                    <span className="font-medium text-teal-600">Salaire:</span>{" "}
                    {stage.compensation || "Non spécifié"}
                </p>
                <p>
                    <span className="font-medium text-teal-600">Lieu:</span> {stage.location}
                </p>
                <p>
                    <span className="font-medium text-teal-600">Offert par:</span>{" "}
                    {stage.employeur?.company}
                </p>
                <p>
                    <span className="font-medium text-teal-600">Statut:</span> {stage.status}
                </p>
            </div>
            <div className="mt-4 w-full border-t border-gray-200" />
        </div>
    );
}
