import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
    fetchNotifications,
    markSingleNotificationAsRead,
    markManyNotifications
} from '../notification-utils/notificationsServiceLogic';
import * as GestionnaireService from '../../../services/GestionnaireService';
import * as EmployeurService from '../../../services/EmployeurService';
import * as EtudiantService from '../../../services/EtudiantService';

vi.mock('../../../services/GestionnaireService');
vi.mock('../../../services/EmployeurService');
vi.mock('../../../services/EtudiantService');

describe('notificationsServiceLogic', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('fetchNotifications', () => {
        it('fetches GESTIONNAIRE notifications', async () => {
            const user = { role: 'GESTIONNAIRE', token: 'token123' };
            GestionnaireService.getGestionnaireNotifications.mockResolvedValue({ data: [] });

            await fetchNotifications(user);
            expect(GestionnaireService.getGestionnaireNotifications).toHaveBeenCalledWith('token123');
        });

        it('fetches EMPLOYEUR notifications', async () => {
            const user = { role: 'EMPLOYEUR', token: 'token123' };
            EmployeurService.getEmployeurNotifications.mockResolvedValue({ data: [] });

            await fetchNotifications(user);

            expect(EmployeurService.getEmployeurNotifications).toHaveBeenCalledWith('token123');
        });

        it('fetches ETUDIANT notifications', async () => {
            const user = { role: 'ETUDIANT', token: 'token123' };
            EtudiantService.getEtudiantNotifications.mockResolvedValue({ data: [] });

            await fetchNotifications(user);

            expect(EtudiantService.getEtudiantNotifications).toHaveBeenCalledWith('token123');
        });

        it('returns null for unknown role', async () => {
            const user = { role: 'UNKNOWN', token: 'token123' };
            const result = await fetchNotifications(user);
            expect(result).toBeNull();
        });
    });

    describe('markSingleNotificationAsRead', () => {
        it('marks GESTIONNAIRE notification as read', async () => {
            const user = { role: 'GESTIONNAIRE', token: 'token123' };
            GestionnaireService.markNotificationRead.mockResolvedValue();

            await markSingleNotificationAsRead(1, user);

            expect(GestionnaireService.markNotificationRead).toHaveBeenCalledWith(1, 'token123');
        });

        it('marks EMPLOYEUR notification as read', async () => {
            const user = { role: 'EMPLOYEUR', token: 'token123' };
            EmployeurService.markNotificationRead.mockResolvedValue();

            await markSingleNotificationAsRead(1, user);

            expect(EmployeurService.markNotificationRead).toHaveBeenCalledWith(1, 'token123');
        });

        it('marks ETUDIANT notification as read', async () => {
            const user = { role: 'ETUDIANT', token: 'token123' };
            EtudiantService.markNotificationRead.mockResolvedValue();

            await markSingleNotificationAsRead(1, user);

            expect(EtudiantService.markNotificationRead).toHaveBeenCalledWith(1, 'token123');
        });

        it('does nothing when id is not provided', async () => {
            const user = { role: 'GESTIONNAIRE', token: 'token123' };
            await markSingleNotificationAsRead(null, user);
            expect(GestionnaireService.markNotificationRead).not.toHaveBeenCalled();
        });
    });

    describe('markManyNotifications', () => {
        it('marks multiple GESTIONNAIRE notifications as read', async () => {
            const user = { role: 'GESTIONNAIRE', token: 'token123' };
            GestionnaireService.markNotificationsRead.mockResolvedValue();

            await markManyNotifications(user, [1, 2, 3]);

            expect(GestionnaireService.markNotificationsRead).toHaveBeenCalledWith([1, 2, 3], 'token123');
        });

        it('marks multiple EMPLOYEUR notifications as read', async () => {
            const user = { role: 'EMPLOYEUR', token: 'token123' };
            EmployeurService.markNotificationsRead.mockResolvedValue();

            await markManyNotifications(user, [1, 2, 3]);

            expect(EmployeurService.markNotificationsRead).toHaveBeenCalledWith([1, 2, 3], 'token123');
        });

        it('marks multiple ETUDIANT notifications as read', async () => {
            const user = { role: 'ETUDIANT', token: 'token123' };
            EtudiantService.markNotificationsRead.mockResolvedValue();

            await markManyNotifications(user, [1, 2, 3]);

            expect(EtudiantService.markNotificationsRead).toHaveBeenCalledWith([1, 2, 3], 'token123');
        });

        it('does nothing when ids array is empty', async () => {
            const user = { role: 'GESTIONNAIRE', token: 'token123' };
            await markManyNotifications(user, []);
            expect(GestionnaireService.markNotificationsRead).not.toHaveBeenCalled();
        });

        it('does nothing when ids is not an array', async () => {
            const user = { role: 'GESTIONNAIRE', token: 'token123' };
            await markManyNotifications(user, null);
            expect(GestionnaireService.markNotificationsRead).not.toHaveBeenCalled();
        });
    });
});