import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import Notifications from '../Notifications';
import { useAuth } from '../../../context/AuthContext';
import { useI18n } from '../../../context/I18nContext';
import * as notificationService from '../notification-utils/notificationsServiceLogic';

vi.mock('../../../context/AuthContext');
vi.mock('../../../context/I18nContext');
vi.mock('../notification-utils/notificationsServiceLogic');

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

const mockUser = {
    token: 'test-token',
    role: 'GESTIONNAIRE',
    email: 'test@example.com'
};

const mockNotifications = {
    data: {
        groups: [
            {
                typeKey: 'stage',
                items: [
                    { id: 1, message: 'New stage', createdAt: '2024-01-01T10:00:00', stageId: 10 },
                    { id: 2, message: 'Another stage', createdAt: '2024-01-02T10:00:00', stageId: 11 }
                ]
            },
            {
                typeKey: 'postulation',
                items: [
                    { id: 3, message: 'New application', createdAt: '2024-01-03T10:00:00', candidatureId: 20, etudiantId: 5 }
                ]
            },
            {
                typeKey: 'signature_entente',
                items: [
                    { 
                        id: 4, 
                        messageFR: 'L\'étudiant John Doe et l\'employeur ont tous deux signé l\'entente de stage pour Stage en développement',
                        messageEN: 'Student John Doe and employer have both signed the internship agreement for Stage en développement',
                        createdAt: '2024-01-04T10:00:00', 
                        signatureEntenteCandidatureId: 30
                    }
                ]
            }
        ]
    }
};

describe('Notifications Component', () => {
    const mockT = (key) => {
        const translations = {
            'toggleNotifications': 'Toggle notifications dropdown',
            'closeNotifications': 'Fermer',
            'openNotifications': 'Open',
            'markAllAsRead': 'Mark all as read',
            'erreurChargementNotifications': 'Network error',
            'nouvellesOffresStage': 'nouvelles offre(s) de stage à approuver',
            'nouvellesCandidatures': 'nouvelles candidature(s) reçue(s)',
            'signatureEntenteNotification': 'nouvelle(s) entente(s) signée(s) par l\'étudiant et l\'employeur',
            'notifications': 'notification(s)'
        };
        return translations[key] || key;
    };

    beforeEach(() => {
        vi.clearAllMocks();
        useAuth.mockReturnValue({ user: mockUser });
        useI18n.mockReturnValue({
            t: mockT,
            locale: 'fr',
            setLocale: vi.fn()
        });
        notificationService.fetchNotifications.mockResolvedValue(mockNotifications);
        notificationService.markManyNotifications.mockResolvedValue();
        notificationService.markSingleNotificationAsRead.mockResolvedValue();
    });

    afterEach(() => {
        vi.clearAllTimers();
    });

    it('renders nothing when no notifications', async () => {
        notificationService.fetchNotifications.mockResolvedValue({ data: { groups: [] } });
        const { container } = render(<BrowserRouter><Notifications /></BrowserRouter>);
        await waitFor(() => expect(container.firstChild).toBeNull());
    });

    it('renders notification cards for each type', async () => {
        render(<BrowserRouter><Notifications /></BrowserRouter>);
        await waitFor(() => {
            expect(screen.getByText(/nouvelles offre\(s\) de stage à approuver/i)).toBeInTheDocument();
            expect(screen.getByText(/nouvelles candidature\(s\) reçue\(s\)/i)).toBeInTheDocument();
            expect(screen.getByText(/nouvelle\(s\) entente\(s\) signée\(s\) par l'étudiant et l'employeur/i)).toBeInTheDocument();
        });
    });

    it('displays error banner on fetch failure', async () => {
        notificationService.fetchNotifications.mockRejectedValue(new Error('Network error'));
        render(<BrowserRouter><Notifications /></BrowserRouter>);
        await waitFor(() => {
            expect(screen.getByText(/Network error/i)).toBeInTheDocument();
        });
    });

    it('marks group notifications as read and navigates', async () => {
        render(<BrowserRouter><Notifications /></BrowserRouter>);
        await waitFor(() => screen.getByText(/nouvelles offre\(s\) de stage à approuver/i));

        const card = screen.getByText(/nouvelles offre\(s\) de stage à approuver/i).closest('div[role="button"]');
        fireEvent.click(card);

        await waitFor(() => {
            expect(notificationService.markManyNotifications).toHaveBeenCalledWith(mockUser, [1, 2]);
            expect(mockNavigate).toHaveBeenCalled();
        });
    });

    it('opens dropdown for notifications with count >= 4', async () => {
        const manyNotifications = {
            data: {
                groups: [{
                    typeKey: 'stage',
                    items: Array.from({ length: 5 }, (_, i) => ({
                        id: i + 1,
                        message: `Stage ${i}`,
                        createdAt: '2024-01-01T10:00:00',
                        stageId: i + 10
                    }))
                }]
            }
        };
        notificationService.fetchNotifications.mockResolvedValue(manyNotifications);

        render(<BrowserRouter><Notifications /></BrowserRouter>);
        await waitFor(() => screen.getByLabelText(/Toggle notifications dropdown/i));

        const toggleButton = screen.getByLabelText(/Toggle notifications dropdown/i);
        fireEvent.click(toggleButton);

        await waitFor(() => {
            // Vérifier que le dropdown s'ouvre - il devrait y avoir au moins 2 éléments avec ce texte (carte + dropdown)
            const elements = screen.getAllByText(/nouvelles offre\(s\) de stage à approuver/i);
            expect(elements.length).toBeGreaterThanOrEqual(2);
            // Vérifier que le dropdown est présent
            expect(document.querySelector('[role="menu"]')).toBeInTheDocument();
        });
    });

    it('closes dropdown when clicking outside', async () => {
        const manyNotifications = {
            data: {
                groups: [{
                    typeKey: 'stage',
                    items: Array.from({ length: 5 }, (_, i) => ({
                        id: i + 1,
                        message: `Stage ${i}`,
                        createdAt: '2024-01-01T10:00:00',
                        stageId: i + 10
                    }))
                }]
            }
        };
        notificationService.fetchNotifications.mockResolvedValue(manyNotifications);

        render(<BrowserRouter><Notifications /></BrowserRouter>);
        await waitFor(() => screen.getByLabelText(/Toggle notifications dropdown/i));

        const toggleButton = screen.getByLabelText(/Toggle notifications dropdown/i);
        fireEvent.click(toggleButton);

        // Vérifier que le dropdown s'ouvre
        await waitFor(() => {
            expect(document.querySelector('[role="menu"]')).toBeInTheDocument();
        });

        fireEvent.click(document.body);

        // Le dropdown devrait se fermer
        await waitFor(() => {
            const dropdown = document.querySelector('[role="menu"]');
            expect(dropdown).not.toBeInTheDocument();
        });
    });

    it('marks single notification as read and navigates', async () => {
        render(<BrowserRouter><Notifications /></BrowserRouter>);
        await waitFor(() => screen.getByText(/nouvelles candidature\(s\) reçue\(s\)/i));

        // Trouver la carte de notification pour postulation
        const postulationCard = screen.getByText(/nouvelles candidature\(s\) reçue\(s\)/i).closest('div[role="button"]');
        fireEvent.click(postulationCard);

        await waitFor(() => {
            expect(notificationService.markManyNotifications).toHaveBeenCalledWith(mockUser, [3]);
            expect(mockNavigate).toHaveBeenCalled();
        });
    });

    it('handles missing user token gracefully', async () => {
        useAuth.mockReturnValue({ user: null });
        const { container } = render(<BrowserRouter><Notifications /></BrowserRouter>);
        await waitFor(() => expect(container.firstChild).toBeNull());
    });

    it('marks signature_entente notification as read and navigates with correct state', async () => {
        render(<BrowserRouter><Notifications /></BrowserRouter>);
        await waitFor(() => screen.getByText(/nouvelle\(s\) entente\(s\) signée\(s\) par l'étudiant et l'employeur/i));

        const notificationItem = screen.getByText(/L'étudiant John Doe et l'employeur ont tous deux signé/i).closest('div');
        fireEvent.click(notificationItem);

        await waitFor(() => {
            expect(notificationService.markSingleNotificationAsRead).toHaveBeenCalledWith(4, mockUser);
            expect(mockNavigate).toHaveBeenCalledWith(
                '/gestionnaire/candidatures',
                expect.objectContaining({
                    state: expect.objectContaining({
                        openCandidatureId: 30,
                        openTab: 'APPROVED'
                    })
                })
            );
        });
    });

    it('displays signature_entente notification message correctly', async () => {
        render(<BrowserRouter><Notifications /></BrowserRouter>);
        await waitFor(() => {
            // Le message est tronqué à 80 caractères par défaut, donc on cherche le début du message
            expect(screen.getByText(/L'étudiant John Doe et l'employeur ont tous deux signé l'entente de stage/i)).toBeInTheDocument();
        });
    });
});
