import { useEffect, useState } from "react";
import { telechargerCv } from "../services/EtudiantService";
import { useAuth } from "../context/AuthContext";

export default function StudentStatus() {
    const { user } = useAuth();
    const [status, setStatus] = useState("loading");
    const [error, setError] = useState(null);

    useEffect(() => {
        async function fetchCvStatus() {
            try {
                const cv = await telechargerCv(user.data.email, user);
                if (cv.approvedAt) {
                    setStatus("accepted");
                } else if (cv.rejectedAt) {
                    setStatus("rejected");
                } else {
                    setStatus("pending");
                }
            } catch (e) {
                setError("Could not fetch CV status.");
                setStatus("none");
            }
        }
        fetchCvStatus();
    }, [user]);

    if (status === "loading") return <div>Loading...</div>;
    if (error) return <div>{error}</div>;

    return (
        <div>
            {status === "accepted" && <div>Your CV has been <b>accepted</b>.</div>}
            {status === "rejected" && <div>Your CV has been <b>rejected</b>.</div>}
            {status === "pending" && <div>Your CV is <b>pending review</b>.</div>}
            {status === "none" && <div>No CV found.</div>}
        </div>
    );
}