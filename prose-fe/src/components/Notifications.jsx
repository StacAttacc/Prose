import {useEffect, useState} from "react";
import {useAuth} from "../context/AuthContext.jsx";
import {getGestionnaireNotifications} from "../services/GestionnaireService.js";

export default function Notifications() {
    const {user} = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(async () => {
        async function fetchAllGestionnaireNotifications() {
            try {
                const data = await getGestionnaireNotifications(user?.token);
                setNotifications(data?.data || []);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        await fetchAllGestionnaireNotifications();
    }, [user?.token]);

    return (
        <>
            {notifications.length === 0 && !loading && !error ? (
                <div className="p-4 mb-4 text-sm text-blue-700 bg-blue-100 rounded-lg dark:bg-blue-200 dark:text-blue-800" role="alert">
                    <span className="font-medium">Aucune notification pour le moment.</span>
                </div>
            ) : (
                notifications.map((notification) => (
                    <div key={notification.id} className="p-4 mb-4 text-sm text-blue-700 bg-blue-100 rounded-lg dark:bg-blue-200 dark:text-blue-800" role="alert">
                        <span className="font-medium">{notification.message}</span>
                    </div>
                ))
            )}
        </>
    );
}