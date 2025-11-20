import { describe, it, expect } from 'vitest';
import {
    getDefaultNavigationPath,
    getNotificationNavigationPath,
} from '../notification-utils/notificationsNavigationLogic.jsx';

describe('getDefaultNavigationPath', () => {
    it('returns gestionnaire default path for GESTIONNAIRE', () => {
        expect(getDefaultNavigationPath('GESTIONNAIRE')).toBe('/gestionnaire/candidatures');
    });

    it('returns employeur default path for EMPLOYEUR', () => {
        expect(getDefaultNavigationPath('EMPLOYEUR')).toBe('/employeur/stages/posted-stages');
    });

    it('returns etudiant default path for ETUDIANT', () => {
        expect(getDefaultNavigationPath('ETUDIANT')).toBe('/etudiant/mon-cv');
    });

    it('returns root for unknown role', () => {
        expect(getDefaultNavigationPath('SOMETHING_ELSE')).toBe('/');
    });
});

describe('getNotificationNavigationPath', () => {
    describe('EMPLOYEUR role', () => {
        it('uses groupType when grouped (postulation) and falls back to default path', () => {
            const result = getNotificationNavigationPath({
                role: 'EMPLOYEUR',
                notification: null,
                isGrouped: true,
                groupType: 'postulation',
            });
            expect(result.path).toBe('/employeur/stages/posted-stages');
            expect(result.state).toBeUndefined();
        });

        it('navigates to candidature list for etudiant_offre_decision notification', () => {
            const notification = {
                stageId: 123,
                etudiantOffreDecisionId: 456,
            };
            const result = getNotificationNavigationPath({
                role: 'EMPLOYEUR',
                notification,
                isGrouped: false,
                groupType: 'etudiant_offre_decision',
            });
            expect(result.path).toBe('/employeur/stages/123/candidatures');
            expect(result.state).toEqual({ openCandidatureId: 456 });
        });

        it('navigates to candidature list for postulation notification', () => {
            const notification = {
                stageId: 789,
                candidaturePostulationId: 101,
            };
            const result = getNotificationNavigationPath({
                role: 'EMPLOYEUR',
                notification,
                isGrouped: false,
                groupType: 'postulation',
            });
            expect(result.path).toBe('/employeur/stages/789/candidatures');
            expect(result.state).toEqual({ openCandidatureId: 101 });
        });

        it('navigates to candidature list for signature_entente notification with entente id', () => {
            const notification = {
                stageId: 42,
                signatureEntenteCandidatureId: 999,
            };
            const result = getNotificationNavigationPath({
                role: 'EMPLOYEUR',
                notification,
                isGrouped: false,
                groupType: 'signature_entente',
            });
            expect(result.path).toBe('/employeur/stages/42/candidatures');
            expect(result.state).toEqual({ openEntenteId: 999 });
        });

        it('navigates to default employeur path for demande_approbation_stage grouped', () => {
            const result = getNotificationNavigationPath({
                role: 'EMPLOYEUR',
                notification: null,
                isGrouped: true,
                groupType: 'demande_approbation_stage',
            });
            expect(result.path).toBe('/employeur/stages/posted-stages');
            expect(result.state).toBeUndefined();
        });

        it('navigates with state for demande_approbation_stage single notification', () => {
            const notification = {
                stageId: 321,
            };
            const result = getNotificationNavigationPath({
                role: 'EMPLOYEUR',
                notification,
                isGrouped: false,
                groupType: 'demande_approbation_stage',
            });
            expect(result.path).toBe('/employeur/stages/posted-stages');
            expect(result.state).toEqual({ openDemandeApprobationStageId: 321 });
        });

        it('falls back to default path when notification is empty or type unknown', () => {
            const result = getNotificationNavigationPath({
                role: 'EMPLOYEUR',
                notification: {},
                isGrouped: false,
                groupType: 'unknown_type',
            });
            expect(result.path).toBe('/employeur/stages/posted-stages');
            expect(result.state).toBeUndefined();
        });
    });

    describe('ETUDIANT role', () => {
        it('routes cv_decision to mon-cv regardless of grouping', () => {
            const notification = {};
            const single = getNotificationNavigationPath({
                role: 'ETUDIANT',
                notification,
                isGrouped: false,
                groupType: 'cv_decision',
            });
            expect(single.path).toBe('/etudiant/mon-cv');
            expect(single.state).toBeUndefined();

            const grouped = getNotificationNavigationPath({
                role: 'ETUDIANT',
                notification,
                isGrouped: true,
                groupType: 'cv_decision',
            });
            expect(grouped.path).toBe('/etudiant/mon-cv');
            expect(grouped.state).toBeUndefined();
        });

        it('routes grouped convocation to candidatures list', () => {
            const result = getNotificationNavigationPath({
                role: 'ETUDIANT',
                notification: null,
                isGrouped: true,
                groupType: 'convocation',
            });
            expect(result.path).toBe('/etudiant/stages/candidatures');
            expect(result.state).toBeUndefined();
        });

        it('routes single convocation to candidatures with openCandidatureId', () => {
            const notification = {
                candidatureId: 222,
            };
            const result = getNotificationNavigationPath({
                role: 'ETUDIANT',
                notification,
                isGrouped: false,
                groupType: 'convocation',
            });
            expect(result.path).toBe('/etudiant/stages/candidatures');
            expect(result.state).toEqual({ openCandidatureId: 222 });
        });

        it('routes candidature_decision similarly to convocation', () => {
            const notification = {
                candidatureId: 333,
            };
            const result = getNotificationNavigationPath({
                role: 'ETUDIANT',
                notification,
                isGrouped: false,
                groupType: 'candidature_decision',
            });
            expect(result.path).toBe('/etudiant/stages/candidatures');
            expect(result.state).toEqual({ openCandidatureId: 333 });
        });

        it('routes signature_entente to candidatures with openEntenteId', () => {
            const notification = {
                candidatureId: 444,
            };
            const result = getNotificationNavigationPath({
                role: 'ETUDIANT',
                notification,
                isGrouped: false,
                groupType: 'signature_entente',
            });
            expect(result.path).toBe('/etudiant/stages/candidatures');
            expect(result.state).toEqual({ openEntenteId: 444 });
        });

        it('falls back to default path for unknown groupType', () => {
            const result = getNotificationNavigationPath({
                role: 'ETUDIANT',
                notification: {},
                isGrouped: false,
                groupType: 'unknown_type',
            });
            expect(result.path).toBe('/etudiant/mon-cv');
            expect(result.state).toBeUndefined();
        });
    });

    describe('GESTIONNAIRE role', () => {
        it('uses default path for grouped etudiant_offre_decision', () => {
            const result = getNotificationNavigationPath({
                role: 'GESTIONNAIRE',
                notification: null,
                isGrouped: true,
                groupType: 'etudiant_offre_decision',
            });
            expect(result.path).toBe('/gestionnaire/candidatures');
            expect(result.state).toBeUndefined();
        });

        it('adds etudiantOffreDecisionId state for single etudiant_offre_decision', () => {
            const notification = {
                candidatureId: 12,
            };
            const result = getNotificationNavigationPath({
                role: 'GESTIONNAIRE',
                notification,
                isGrouped: false,
                groupType: 'etudiant_offre_decision',
            });
            expect(result.path).toBe('/gestionnaire/candidatures');
            expect(result.state).toEqual({ etudiantOffreDecisionId: 12 });
        });

        it('routes postulation single notification with openEtudiantId', () => {
            const notification = {
                etudiantId: 444,
            };
            const result = getNotificationNavigationPath({
                role: 'GESTIONNAIRE',
                notification,
                isGrouped: false,
                groupType: 'postulation',
            });
            expect(result.path).toBe('/gestionnaire/candidatures');
            expect(result.state).toEqual({ openEtudiantId: 444 });
        });

        it('routes creation_stage grouped to list-stages', () => {
            const result = getNotificationNavigationPath({
                role: 'GESTIONNAIRE',
                notification: null,
                isGrouped: true,
                groupType: 'creation_stage',
            });
            expect(result.path).toBe('/gestionnaire/list-stages');
            expect(result.state).toBeUndefined();
        });

        it('routes creation_stage single with openStageId', () => {
            const notification = {
                stageId: 555,
            };
            const result = getNotificationNavigationPath({
                role: 'GESTIONNAIRE',
                notification,
                isGrouped: false,
                groupType: 'creation_stage',
            });
            expect(result.path).toBe('/gestionnaire/list-stages');
            expect(result.state).toEqual({ openStageId: 555 });
        });

        it('routes new_cv grouped and single correctly', () => {
            const grouped = getNotificationNavigationPath({
                role: 'GESTIONNAIRE',
                notification: null,
                isGrouped: true,
                groupType: 'new_cv',
            });
            expect(grouped.path).toBe('/gestionnaire/gestion-cv');
            expect(grouped.state).toBeUndefined();

            const notification = {
                cvId: 666,
            };
            const single = getNotificationNavigationPath({
                role: 'GESTIONNAIRE',
                notification,
                isGrouped: false,
                groupType: 'new_cv',
            });
            expect(single.path).toBe('/gestionnaire/gestion-cv');
            expect(single.state).toEqual({ openCvId: 666 });
        });

        it('routes convocation and candidature_decision with openEtudiantId', () => {
            const convocation = getNotificationNavigationPath({
                role: 'GESTIONNAIRE',
                notification: { etudiantId: 777 },
                isGrouped: false,
                groupType: 'convocation',
            });
            expect(convocation.path).toBe('/gestionnaire/candidatures');
            expect(convocation.state).toEqual({ openEtudiantId: 777 });

            const candidatureDecision = getNotificationNavigationPath({
                role: 'GESTIONNAIRE',
                notification: { etudiantId: 888 },
                isGrouped: false,
                groupType: 'candidature_decision',
            });
            expect(candidatureDecision.path).toBe('/gestionnaire/candidatures');
            expect(candidatureDecision.state).toEqual({ openEtudiantId: 888 });
        });

        it('routes signature_entente grouped to default and single with APPROVED tab + candidature', () => {
            const grouped = getNotificationNavigationPath({
                role: 'GESTIONNAIRE',
                notification: null,
                isGrouped: true,
                groupType: 'signature_entente',
            });
            expect(grouped.path).toBe('/gestionnaire/candidatures');
            expect(grouped.state).toBeUndefined();

            const notification = {
                candidatureId: 999,
            };
            const single = getNotificationNavigationPath({
                role: 'GESTIONNAIRE',
                notification,
                isGrouped: false,
                groupType: 'signature_entente',
            });
            expect(single.path).toBe('/gestionnaire/candidatures');
            expect(single.state).toEqual({ openCandidatureId: 999, openTab: 'APPROVED' });
        });

        it('falls back to default path for unknown groupType', () => {
            const result = getNotificationNavigationPath({
                role: 'GESTIONNAIRE',
                notification: {},
                isGrouped: true,
                groupType: 'some_unknown',
            });
            expect(result.path).toBe('/gestionnaire/candidatures');
            expect(result.state).toBeUndefined();
        });
    });

    it('falls back to default path when params are invalid but role is known', () => {
        const result = getNotificationNavigationPath({
            role: 'EMPLOYEUR',
            notification: null,
            isGrouped: false,
            groupType: undefined,
        });
        expect(result.path).toBe('/employeur/stages/posted-stages');
        expect(result.state).toBeUndefined();
    });

    it('returns /login for unknown role', () => {
        const result = getNotificationNavigationPath({
            role: 'UNKNOWN',
            notification: { some: 'payload' },
            isGrouped: false,
            groupType: 'whatever',
        });
        expect(result.path).toBe('/login');
    });
});