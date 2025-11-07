import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import Notifications from '../Notifications';
import { useAuth } from '../../../context/AuthContext';
import * as notificationService from '../notification-utils/notificationsServiceLogic';

vi.mock('../../../context/AuthContext');
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
            }
        ]
    }
};

describe('Notifications Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        useAuth.mockReturnValue({ user: mockUser });
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
            expect(screen.getByText('Fermer')).toBeInTheDocument();
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

        await waitFor(() => screen.getByText('Fermer'));

        fireEvent.click(document.body);

        await waitFor(() => {
            expect(screen.queryByText('Fermer')).not.toBeInTheDocument();
        });
    });

    it('marks single notification as read and navigates', async () => {
        render(<BrowserRouter><Notifications /></BrowserRouter>);
        await waitFor(() => screen.getByText(/New application/i));

        const notificationItem = screen.getByText(/New application/i).closest('div');
        fireEvent.click(notificationItem);

        await waitFor(() => {
            expect(notificationService.markSingleNotificationAsRead).toHaveBeenCalledWith(3, mockUser);
            expect(mockNavigate).toHaveBeenCalled();
        });
    });

    it('handles missing user token gracefully', async () => {
        useAuth.mockReturnValue({ user: null });
        const { container } = render(<BrowserRouter><Notifications /></BrowserRouter>);
        await waitFor(() => expect(container.firstChild).toBeNull());
    });
});
