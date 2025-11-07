import { describe, it, expect } from 'vitest';
import {
    getDefaultNavigationPath,
    getNotificationNavigationPath,
    getGroupedNotificationNavigation
} from '../notification-utils/notificationsNavigationLogic';

describe('notificationsNavigationLogic', () => {
    describe('getDefaultNavigationPath', () => {
        it('returns correct path for GESTIONNAIRE', () => {
            expect(getDefaultNavigationPath({ role: 'GESTIONNAIRE' })).toBe('/gestionnaire/candidatures');
        });

        it('returns correct path for EMPLOYEUR', () => {
            expect(getDefaultNavigationPath({ role: 'EMPLOYEUR' })).toBe('/employeur/posted-stages');
        });

        it('returns correct path for ETUDIANT', () => {
            expect(getDefaultNavigationPath({ role: 'ETUDIANT' })).toBe('etudiant/mon-cv');
        });

        it('returns default path for unknown role', () => {
            expect(getDefaultNavigationPath({ role: 'UNKNOWN' })).toBe('/');
        });
    });

    describe('getNotificationNavigationPath', () => {
        it('navigates EMPLOYEUR to stage candidatures', () => {
            const notification = { stageId: 10, candidatureId: 20, candidature: {} };
            const result = getNotificationNavigationPath(notification, 'EMPLOYEUR');
            expect(result.path).toBe('/employeur/stages/10/candidatures');
            expect(result.state).toEqual({ openCandidatureId: 20 });
        });

        it('navigates ETUDIANT to CV for etudiant_cv type', () => {
            const notification = { type: 'etudiant_cv' };
            const result = getNotificationNavigationPath(notification, 'ETUDIANT');
            expect(result.path).toBe('/etudiant/mon-cv');
        });

        it('navigates ETUDIANT to candidatures for convocation', () => {
            const notification = { type: 'convocation', convocation: 100 };
            const result = getNotificationNavigationPath(notification, 'ETUDIANT');
            expect(result.path).toBe('/etudiant/stages/candidatures');
            expect(result.state).toEqual({ openCandidatureId: 100 });
        });

        it('navigates ETUDIANT to candidatures for candidature_decision', () => {
            const notification = { type: 'candidature_decision', candidatureDecisionId: 50 };
            const result = getNotificationNavigationPath(notification, 'ETUDIANT');
            expect(result.path).toBe('/etudiant/stages/candidatures');
            expect(result.state).toEqual({ openCandidatureId: 50 });
        });

        it('navigates GESTIONNAIRE to candidatures for candidature notification', () => {
            const notification = { candidatureId: 20, stageId: 10, etudiantId: 5 };
            const result = getNotificationNavigationPath(notification, 'GESTIONNAIRE');
            expect(result.path).toBe('/gestionnaire/candidatures');
            expect(result.state).toEqual({ openEtudiantId: 5 });
        });

        it('navigates GESTIONNAIRE to stages for stage notification', () => {
            const notification = { stageId: 10 };
            const result = getNotificationNavigationPath(notification, 'GESTIONNAIRE');
            expect(result.path).toBe('/gestionnaire/list-stages');
            expect(result.state).toEqual({ openStageId: 10 });
        });

        it('navigates GESTIONNAIRE to CV management for CV notification', () => {
            const notification = { cvId: 30 };
            const result = getNotificationNavigationPath(notification, 'GESTIONNAIRE');
            expect(result.path).toBe('/gestionnaire/gestion-cv');
            expect(result.state).toEqual({ openCvId: 30 });
        });

        it('returns default path for unmatched notification', () => {
            const notification = {};
            const result = getNotificationNavigationPath(notification, 'GESTIONNAIRE');
            expect(result.path).toBe('/gestionnaire/candidatures');
            expect(result.state).toBeNull();
        });
    });

    describe('getGroupedNotificationNavigation', () => {
        it('navigates EMPLOYEUR to posted stages for postulation', () => {
            const result = getGroupedNotificationNavigation('postulation', 'EMPLOYEUR');
            expect(result.path).toBe('/employeur/posted-stages');
        });

        it('navigates ETUDIANT to CV for etudiant_cv', () => {
            const result = getGroupedNotificationNavigation('etudiant_cv', 'ETUDIANT');
            expect(result.path).toBe('/etudiant/mon-cv');
        });

        it('navigates ETUDIANT to candidatures for convocation', () => {
            const result = getGroupedNotificationNavigation('convocation', 'ETUDIANT');
            expect(result.path).toBe('/etudiant/stages/candidatures');
        });

        it('navigates GESTIONNAIRE to stages for stage type', () => {
            const result = getGroupedNotificationNavigation('stage', 'GESTIONNAIRE');
            expect(result.path).toBe('/gestionnaire/list-stages');
        });

        it('navigates GESTIONNAIRE to CV management for gestionnaire_cv', () => {
            const result = getGroupedNotificationNavigation('gestionnaire_cv', 'GESTIONNAIRE');
            expect(result.path).toBe('/gestionnaire/gestion-cv');
        });

        it('returns default path for unknown type', () => {
            const result = getGroupedNotificationNavigation('unknown', 'GESTIONNAIRE');
            expect(result.path).toBe('/gestionnaire/candidatures');
        });
    });
});
