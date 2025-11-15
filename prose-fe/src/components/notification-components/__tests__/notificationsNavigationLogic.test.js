import { describe, it, expect } from 'vitest';
import {
    getDefaultNavigationPath,
    getNotificationNavigationPath
} from '../notification-utils/notificationsNavigationLogic';

describe('getDefaultNavigationPath', () => {
    it('should return gestionnaire path for GESTIONNAIRE role', () => {
        expect(getDefaultNavigationPath('GESTIONNAIRE')).toBe('/gestionnaire/candidatures');
    });

    it('should return employeur path for EMPLOYEUR role', () => {
        expect(getDefaultNavigationPath('EMPLOYEUR')).toBe('/employeur/posted-stages');
    });

    it('should return etudiant path for ETUDIANT role', () => {
        expect(getDefaultNavigationPath('ETUDIANT')).toBe('/etudiant/mon-cv');
    });

    it('should return root path for unknown role', () => {
        expect(getDefaultNavigationPath('UNKNOWN')).toBe('/');
    });
});

describe('getNotificationNavigationPath', () => {
    describe('EMPLOYEUR role', () => {
        it('should return grouped path for etudiant_offre_decision', () => {
            const result = getNotificationNavigationPath({
                role: 'EMPLOYEUR',
                isGrouped: true,
                groupType: 'etudiant_offre_decision'
            });
            expect(result.path).toBe('/employeur/posted-stages');
        });

        it('should return specific path for etudiant_offre_decision notification', () => {
            const notification = {
                type: 'etudiant_offre_decision',
                stageId: 123,
                etudiantOffreDecisionId: 456
            };
            const result = getNotificationNavigationPath({
                role: 'EMPLOYEUR',
                notification
            });
            expect(result.path).toBe('/employeur/stages/123/candidatures');
            expect(result.state?.openCandidatureId).toBe(456);
        });

        it('should return grouped path for postulation', () => {
            const result = getNotificationNavigationPath({
                role: 'EMPLOYEUR',
                isGrouped: true,
                groupType: 'postulation'
            });
            expect(result.path).toBe('/employeur/posted-stages');
        });

        it('should return specific path for postulation notification', () => {
            const notification = {
                type: 'postulation',
                stageId: 789,
                candidaturePostulationId: 101
            };
            const result = getNotificationNavigationPath({
                role: 'EMPLOYEUR',
                notification
            });
            expect(result.path).toBe('/employeur/stages/789/candidatures');
            expect(result.state?.openCandidatureId).toBe(101);
        });

        it('should return default path for signature_entente', () => {
            const notification = { type: 'signature_entente' };
            const result = getNotificationNavigationPath({
                role: 'EMPLOYEUR',
                notification
            });
            expect(result.path).toBe('/employeur/posted-stages');
        });
    });

    describe('ETUDIANT role', () => {
        it('should return cv path for etudiant_cv notification', () => {
            const notification = { type: 'etudiant_cv' };
            const result = getNotificationNavigationPath({
                role: 'ETUDIANT',
                notification
            });
            expect(result.path).toBe('/etudiant/mon-cv');
        });

        it('should return grouped path for convocation', () => {
            const result = getNotificationNavigationPath({
                role: 'ETUDIANT',
                isGrouped: true,
                groupType: 'convocation',
                notification: { type: 'convocation' }
            });
            expect(result.path).toBe('/etudiant/stages/candidatures');
        });

        it('should return specific path for convocation notification', () => {
            const notification = {
                type: 'convocation',
                convocation: 222
            };
            const result = getNotificationNavigationPath({
                role: 'ETUDIANT',
                notification
            });
            expect(result.path).toBe('/etudiant/stages/candidatures');
            expect(result.state.openCandidatureId).toBe(222);
        });

        it('should return specific path for candidature_decision notification', () => {
            const notification = {
                type: 'candidature_decision',
                candidatureDecisionId: 333
            };
            const result = getNotificationNavigationPath({
                role: 'ETUDIANT',
                notification
            });
            expect(result.path).toBe('/etudiant/stages/candidatures');
            expect(result.state.openCandidatureId).toBe(333);
        });
    });

    describe('GESTIONNAIRE role', () => {
        it('should return default path for grouped etudiant_offre_decision', () => {
            const result = getNotificationNavigationPath({
                role: 'GESTIONNAIRE',
                isGrouped: true,
                groupType: 'etudiant_offre_decision'
            });
            expect(result.path).toBe('/gestionnaire/candidatures');
        });

        it('should return specific path for postulation notification', () => {
            const notification = {
                type: 'postulation',
                etudiantId: 444
            };
            const result = getNotificationNavigationPath({
                role: 'GESTIONNAIRE',
                notification
            });
            expect(result.path).toBe('/gestionnaire/candidatures');
            expect(result.state?.openEtudiantId).toBe(444);
        });

        it('should return specific path for stage notification', () => {
            const notification = {
                type: 'stage',
                stageId: 555
            };
            const result = getNotificationNavigationPath({
                role: 'GESTIONNAIRE',
                notification
            });
            expect(result.path).toBe('/gestionnaire/list-stages');
            expect(result.state.openStageId).toBe(555);
        });

        it('should return specific path for gestionnaire_cv notification', () => {
            const notification = {
                type: 'gestionnaire_cv',
                cvId: 666
            };
            const result = getNotificationNavigationPath({
                role: 'GESTIONNAIRE',
                notification
            });
            expect(result.path).toBe('/gestionnaire/gestion-cv');
            expect(result.state.openCvId).toBe(666);
        });

        it('should return specific path for convocation notification', () => {
            const notification = {
                type: 'convocation',
                etudiantId: 777
            };
            const result = getNotificationNavigationPath({
                role: 'GESTIONNAIRE',
                notification
            });
            expect(result.path).toBe('/gestionnaire/candidatures');
            expect(result.state?.openEtudiantId).toBe(777);
        });

        it('should return specific path for signature_entente notification with candidatureId', () => {
            const notification = {
                type: 'signature_entente',
                signatureEntenteCandidatureId: 888
            };
            const result = getNotificationNavigationPath({
                role: 'GESTIONNAIRE',
                notification
            });
            expect(result.path).toBe('/gestionnaire/candidatures');
            expect(result.state.openCandidatureId).toBe(888);
            expect(result.state.openTab).toBe('APPROVED');
        });

        it('should return default path for signature_entente notification without candidatureId', () => {
            const notification = {
                type: 'signature_entente'
            };
            const result = getNotificationNavigationPath({
                role: 'GESTIONNAIRE',
                notification
            });
            expect(result.path).toBe('/gestionnaire/candidatures');
        });

        it('should return grouped path for signature_entente', () => {
            const result = getNotificationNavigationPath({
                role: 'GESTIONNAIRE',
                isGrouped: true,
                groupType: 'signature_entente'
            });
            expect(result.path).toBe('/gestionnaire/candidatures');
        });
    });

    it('should return default path for invalid parameters', () => {
        const result = getNotificationNavigationPath({
            role: 'EMPLOYEUR',
            notification: null,
            isGrouped: false
        });
        expect(result.path).toBe('/employeur/posted-stages');
    });

    it('should return default path for unknown role', () => {
        const result = getNotificationNavigationPath({
            role: 'UNKNOWN',
            notification: { type: 'test' }
        });
        expect(result.path).toBe('/login');
    });
});