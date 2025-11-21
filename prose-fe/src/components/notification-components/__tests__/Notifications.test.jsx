import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import Notifications from '../Notifications.jsx';
import { useAuth } from '../../../context/AuthContext.jsx';
import { useI18n } from '../../../context/I18nContext.jsx';
import * as notificationService from '../notification-utils/notificationsServiceLogic.jsx';
import * as parsingLogic from '../notification-utils/notificationParsingLogic.jsx';
import * as navigationLogic from '../notification-utils/notificationsNavigationLogic.jsx';
import * as textLogic from '../notification-utils/notificationTextLogic.jsx';

vi.mock('../../../context/AuthContext.jsx');
vi.mock('../../../context/I18nContext.jsx');
vi.mock('../notification-utils/notificationsServiceLogic.jsx');
vi.mock('../notification-utils/notificationParsingLogic.jsx');
vi.mock('../notification-utils/notificationTextLogic.jsx');

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
    email: 'test@example.com',
};

const rawNotificationsPayload = {
    data: {
        groups: [
            {
                typeKey: 'creation_stage',
                items: [
                    {
                        id: 1,
                        messageFR: 'Nouveau stage 1',
                        messageEN: 'New stage 1',
                        createdAt: '2024-01-01T10:00:00',
                        stageId: 10,
                    },
                    {
                        id: 2,
                        messageFR: 'Nouveau stage 2',
                        messageEN: 'New stage 2',
                        createdAt: '2024-01-02T10:00:00',
                        stageId: 11,
                    },
                ],
            },
            {
                typeKey: 'postulation',
                items: [
                    {
                        id: 3,
                        messageFR: 'Nouvelle candidature',
                        messageEN: 'New application',
                        createdAt: '2024-01-03T10:00:00',
                        candidatureId: 20,
                        etudiantId: 5,
                    },
                ],
            },
            {
                typeKey: 'signature_entente',
                items: [
                    {
                        id: 4,
                        messageFR:
                            "L'étudiant John Doe et l'employeur ont tous deux signé l'entente de stage pour Stage en développement",
                        messageEN:
                            'Student John Doe and employer have both signed the internship agreement for Stage en développement',
                        createdAt: '2024-01-04T10:00:00',
                        signatureEntenteCandidatureId: 30,
                        candidatureId: 30,
                    },
                ],
            },
        ],
    },
};

const normalizedNotifications = {
    creation_stage: rawNotificationsPayload.data.groups[0].items,
    postulation: rawNotificationsPayload.data.groups[1].items,
    signature_entente: rawNotificationsPayload.data.groups[2].items,
};

describe('Notifications component', () => {
    const mockT = (key) => {
        const translations = {
            toggleNotifications: 'Toggle notifications dropdown',
            closeNotifications: 'Fermer',
            openNotifications: 'Open',
            markAllAsRead: 'Mark all as read',
            erreurChargementNotifications: 'Network error',
            nouvellesOffresStage: 'nouvelles offre(s) de stage à approuver',
            nouvellesCandidatures: 'nouvelles candidature(s) reçue(s)',
            reponsesEtudiantsOffres: "réponse(s) d'étudiant(s)",
            nouveauxCVs: 'nouveau(x) CV(s) à approuver',
            changementCV: 'changement(s) de CV',
            nouvellesConvocations: 'nouvelle(s) convocation(s)',
            candidaturesUpdates: 'mise(s) à jour de candidatures',
            signatureEntenteNotification: 'nouveau(x) document(s) à signer',
            miseAJourDemandeApprobationStage: "mise(s) à jour de demande d'approbation de stage",
            notifications: 'notification(s)',
        };
        return translations[key] || key;
    };

    beforeEach(() => {
        vi.clearAllMocks();

        useAuth.mockReturnValue({ user: mockUser });
        useI18n.mockReturnValue({
            t: mockT,
            locale: 'fr',
            setLocale: vi.fn(),
        });

        notificationService.fetchNotifications.mockResolvedValue(rawNotificationsPayload);
        notificationService.markManyNotifications.mockResolvedValue();
        notificationService.markSingleNotificationAsRead.mockResolvedValue();

        parsingLogic.normalizeNotifications.mockReturnValue(normalizedNotifications);

        textLogic.labelForKey.mockImplementation((key) => {
            switch (key) {
                case 'creation_stage':
                    return mockT('nouvellesOffresStage');
                case 'postulation':
                    return mockT('nouvellesCandidatures');
                case 'signature_entente':
                    return mockT('signatureEntenteNotification');
                default:
                    return `${key} notification(s)`;
            }
        });

        textLogic.shortText.mockImplementation((notification) => {
            const msg =
                useI18n().locale === 'en'
                    ? notification.messageEN || ''
                    : notification.messageFR || '';
            return msg.length > 80 ? `${msg.slice(0, 77)}...` : msg;
        });

        textLogic.notificationTime.mockReturnValue('2024-01-01');
    });

    afterEach(() => {
        vi.clearAllTimers();
        vi.useRealTimers();
    });

    it('renders nothing when there are no notifications', async () => {
        notificationService.fetchNotifications.mockResolvedValueOnce({
            data: { groups: [] },
        });
        parsingLogic.normalizeNotifications.mockReturnValueOnce({});

        const { container } = render(
            <BrowserRouter>
                <Notifications />
            </BrowserRouter>
        );

        await waitFor(() => {
            expect(container.firstChild).toBeNull();
        });
    });

    it('renders notification cards for each type with updated labels', async () => {
        render(
            <BrowserRouter>
                <Notifications />
            </BrowserRouter>
        );

        await waitFor(() => {
            expect(
                screen.getByText(/nouvelles offre\(s\) de stage à approuver/i)
            ).toBeInTheDocument();
            expect(
                screen.getByText(/nouvelles candidature\(s\) reçue\(s\)/i)
            ).toBeInTheDocument();
            expect(
                screen.getByText(/nouveau\(x\) document\(s\) à signer/i)
            ).toBeInTheDocument();
        });
    });

    it('displays error banner on fetch failure', async () => {
        notificationService.fetchNotifications.mockRejectedValueOnce(
            new Error('Network error')
        );

        render(
            <BrowserRouter>
                <Notifications />
            </BrowserRouter>
        );

        await waitFor(() => {
            expect(screen.getByText(/Network error/i)).toBeInTheDocument();
        });
    });

    it('marks group notifications as read and navigates for a group', async () => {
        const spyGetPath = vi
            .spyOn(navigationLogic, 'getNotificationNavigationPath')
            .mockReturnValue({
                path: '/gestionnaire/candidatures',
                state: {},
            });

        render(
            <BrowserRouter>
                <Notifications />
            </BrowserRouter>
        );

        await waitFor(() =>
            expect(
                screen.getByText(/nouvelles offre\(s\) de stage à approuver/i)
            ).toBeInTheDocument()
        );

        const card = screen
            .getByText(/nouvelles offre\(s\) de stage à approuver/i)
            .closest('div[role="button"]');

        fireEvent.click(card);

        await waitFor(() => {
            expect(notificationService.markManyNotifications).toHaveBeenCalledWith(
                mockUser,
                [1, 2]
            );
            expect(spyGetPath).toHaveBeenCalledWith({
                role: mockUser.role,
                notification: null,
                isGrouped: true,
                groupType: 'creation_stage',
            });
            expect(mockNavigate).toHaveBeenCalledWith(
                '/gestionnaire/candidatures',
                { state: {} }
            );
        });
    });

    it('opens dropdown for notifications with count >= 4 and closes on outside click', async () => {
        const manyNotificationsPayload = {
            data: {
                groups: [
                    {
                        typeKey: 'creation_stage',
                        items: Array.from({ length: 5 }, (_, i) => ({
                            id: i + 1,
                            messageFR: `Nouveau stage ${i}`,
                            messageEN: `New stage ${i}`,
                            createdAt: '2024-01-01T10:00:00',
                            stageId: i + 10,
                        })),
                    },
                ],
            },
        };
        const manyNormalized = {
            creation_stage: manyNotificationsPayload.data.groups[0].items,
        };

        notificationService.fetchNotifications.mockResolvedValueOnce(
            manyNotificationsPayload
        );
        parsingLogic.normalizeNotifications.mockReturnValueOnce(manyNormalized);

        render(
            <BrowserRouter>
                <Notifications />
            </BrowserRouter>
        );

        await waitFor(() =>
            expect(
                screen.getByText(/nouvelles offre\(s\) de stage à approuver/i)
            ).toBeInTheDocument()
        );

        const toggleButton = screen.getByLabelText(
            /Toggle notifications dropdown/i
        );
        fireEvent.click(toggleButton);

        await waitFor(() => {
            const elements = screen.getAllByText(
                /nouvelles offre\(s\) de stage à approuver/i
            );
            expect(elements.length).toBeGreaterThanOrEqual(1);
            expect(document.querySelector('[role="menu"]')).toBeInTheDocument();
        });

        fireEvent.click(document.body);

        await waitFor(() => {
            const dropdown = document.querySelector('[role="menu"]');
            expect(dropdown).not.toBeInTheDocument();
        });
    });

    it('marks grouped postulation notifications as read and navigates', async () => {
        const spyGetPath = vi
            .spyOn(navigationLogic, 'getNotificationNavigationPath')
            .mockReturnValue({
                path: '/gestionnaire/candidatures',
                state: { openEtudiantId: 5 },
            });

        render(
            <BrowserRouter>
                <Notifications />
            </BrowserRouter>
        );

        await waitFor(() =>
            expect(
                screen.getByText(/nouvelles candidature\(s\) reçue\(s\)/i)
            ).toBeInTheDocument()
        );

        const postulationCard = screen
            .getByText(/nouvelles candidature\(s\) reçue\(s\)/i)
            .closest('div[role="button"]');

        fireEvent.click(postulationCard);

        await waitFor(() => {
            expect(notificationService.markManyNotifications).toHaveBeenCalledWith(
                mockUser,
                [3]
            );
            expect(spyGetPath).toHaveBeenCalledWith({
                role: mockUser.role,
                notification: null,
                isGrouped: true,
                groupType: 'postulation',
            });
            expect(mockNavigate).toHaveBeenCalledWith(
                '/gestionnaire/candidatures',
                { state: { openEtudiantId: 5 } }
            );
        });
    });

    it('handles missing user token gracefully', async () => {
        useAuth.mockReturnValueOnce({ user: null });

        const { container } = render(
            <BrowserRouter>
                <Notifications />
            </BrowserRouter>
        );

        await waitFor(() => {
            expect(container.firstChild).toBeNull();
        });
    });

    it('marks signature_entente notification as read and navigates with correct state', async () => {
        const spyGetPath = vi
            .spyOn(navigationLogic, 'getNotificationNavigationPath')
            .mockReturnValue({
                path: '/gestionnaire/candidatures',
                state: {
                    openCandidatureId: 30,
                    openTab: 'APPROVED',
                },
            });

        render(
            <BrowserRouter>
                <Notifications />
            </BrowserRouter>
        );

        await waitFor(() =>
            expect(
                screen.getByText(/nouveau\(x\) document\(s\) à signer/i)
            ).toBeInTheDocument()
        );

        const notificationItem = screen
            .getByText(
                /L'étudiant John Doe et l'employeur ont tous deux signé l'entente de stage/i
            )
            .closest('div');

        fireEvent.click(notificationItem);

        await waitFor(() => {
            expect(
                notificationService.markSingleNotificationAsRead
            ).toHaveBeenCalledWith(4, mockUser);

            expect(spyGetPath).toHaveBeenCalledWith({
                role: mockUser.role,
                notification: expect.objectContaining({
                    id: 4,
                    signatureEntenteCandidatureId: 30,
                    candidatureId: 30,
                }),
                isGrouped: false,
                groupType: "signature_entente",
            });

            expect(mockNavigate).toHaveBeenCalledWith(
                '/gestionnaire/candidatures',
                { state: { openCandidatureId: 30, openTab: 'APPROVED' } }
            );
        });
    });


    it('displays signature_entente notification message correctly (with truncation if needed)', async () => {
        render(
            <BrowserRouter>
                <Notifications />
            </BrowserRouter>
        );

        await waitFor(() => {
            expect(
                screen.getByText(
                    /L'étudiant John Doe et l'employeur ont tous deux signé l'entente de stage/i
                )
            ).toBeInTheDocument();
        });
    });
});
