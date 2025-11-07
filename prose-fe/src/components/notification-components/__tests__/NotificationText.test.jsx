import { describe, it, expect } from 'vitest';
import { labelForKey, shortText } from '../notification-utils/notificationText';

describe('notificationText utils', () => {
    describe('labelForKey', () => {
        it('returns correct label for stage', () => {
            expect(labelForKey('stage')).toBe('nouvelles offre(s) de stage à approuver');
        });

        it('returns correct label for postulation', () => {
            expect(labelForKey('postulation')).toBe('nouvelles candidature(s) reçue(s)');
        });

        it('returns correct label for gestionnaire_cv', () => {
            expect(labelForKey('gestionnaire_cv')).toBe('nouveau(x) CV(s) à examiner');
        });

        it('returns correct label for etudiant_cv', () => {
            expect(labelForKey('etudiant_cv')).toBe('changement sur votre CV');
        });

        it('returns correct label for convocation', () => {
            expect(labelForKey('convocation')).toBe('nouvelle(s) convocation(s)');
        });

        it('returns correct label for candidature_decision', () => {
            expect(labelForKey('candidature_decision')).toBe('nouvelles(s) candidatures mise(s) à jour');
        });

        it('returns default label for unknown key', () => {
            expect(labelForKey('unknown')).toBe('unknown notification(s)');
        });
    });

    describe('shortText', () => {
        it('returns empty string for null or undefined', () => {
            expect(shortText(null)).toBe('');
            expect(shortText(undefined)).toBe('');
        });

        it('returns full text when below max length', () => {
            const text = 'Short text';
            expect(shortText(text, 80)).toBe('Short text');
        });

        it('truncates text when exceeds max length', () => {
            const text = 'This is a very long text that exceeds the maximum allowed length and should be truncated';
            const result = shortText(text, 50);
            expect(result).toBe('This is a very long text that exceeds the max...');
            expect(result.length).toBe(50);
        });

        it('uses default max length of 80', () => {
            const text = 'A'.repeat(100);
            const result = shortText(text);
            expect(result.length).toBe(80);
            expect(result.endsWith('...')).toBe(true);
        });
    });
});
