import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext.jsx';
import { telechargerCv } from '../services/EtudiantService.js';

const CvContext = createContext();

export const useCv = () => {
    const context = useContext(CvContext);
    if (!context) {
        throw new Error('useCv must be used within a CvProvider');
    }
    return context;
};

export const CvProvider = ({ children }) => {
    const { user } = useAuth();
    const [hasCV, setHasCV] = useState(null);
    const [cvData, setCvData] = useState(null);
    const [loading, setLoading] = useState(false);

    const checkCV = async () => {
        if (user?.role !== "ETUDIANT") {
            setHasCV(null);
            return;
        }

        setLoading(true);
        try {
            const data = await telechargerCv(user.email, user);
            if (data) {
                setHasCV(true);
                setCvData(data);
            } else {
                setHasCV(false);
                setCvData(null);
            }
        } catch (error) {
            console.error('Erreur lors de la vérification du CV:', error);
            setHasCV(false);
            setCvData(null);
        } finally {
            setLoading(false);
        }
    };

    const refreshCV = () => {
        checkCV();
    };

    useEffect(() => {
        if (user?.role === "ETUDIANT") {
            checkCV();
        }
    }, [user]);

    const value = {
        hasCV,
        cvData,
        loading,
        refreshCV,
        checkCV
    };

    return (
        <CvContext.Provider value={value}>
            {children}
        </CvContext.Provider>
    );
};
