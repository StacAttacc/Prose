import { describe, it, expect, vi, beforeEach } from 'vitest';
import { labelForKey, shortText } from '../notification-utils/notificationTextLogic.jsx';
import * as I18nContext from '../../../context/I18nContext';

vi.mock('../../../context/I18nContext');

describe('notificationText utils', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('labelForKey', () => {
        it('returns translated label for stage', () => {
            vi.mocked(I18nContext.useI18n).mockReturnValue({
                t: (key) => key === 'nouvellesOffresStage' ? 'New Internship Offers' : key
            });
            expect(labelForKey('stage')).toBe('New Internship Offers');
        });

        it('returns translated label for postulation', () => {
            vi.mocked(I18nContext.useI18n).mockReturnValue({
                t: (key) => key === 'nouvellesCandidatures' ? 'New Applications' : key
            });
            expect(labelForKey('postulation')).toBe('New Applications');
        });

        it('returns translated label for etudiant_offre_decision', () => {
            vi.mocked(I18nContext.useI18n).mockReturnValue({
                t: (key) => key === 'reponsesEtudiantsOffres' ? 'Student Offer Responses' : key
            });
            expect(labelForKey('etudiant_offre_decision')).toBe('Student Offer Responses');
        });

        it('returns translated label for gestionnaire_cv', () => {
            vi.mocked(I18nContext.useI18n).mockReturnValue({
                t: (key) => key === 'nouveauxCVs' ? 'New CVs' : key
            });
            expect(labelForKey('gestionnaire_cv')).toBe('New CVs');
        });

        it('returns translated label for etudiant_cv', () => {
            vi.mocked(I18nContext.useI18n).mockReturnValue({
                t: (key) => key === 'changementCV' ? 'CV Change' : key
            });
            expect(labelForKey('etudiant_cv')).toBe('CV Change');
        });

        it('returns translated label for convocation', () => {
            vi.mocked(I18nContext.useI18n).mockReturnValue({
                t: (key) => key === 'nouvellesConvocations' ? 'New Invitations' : key
            });
            expect(labelForKey('convocation')).toBe('New Invitations');
        });

        it('returns translated label for candidature_decision', () => {
            vi.mocked(I18nContext.useI18n).mockReturnValue({
                t: (key) => key === 'candidaturesUpdates' ? 'Application Updates' : key
            });
            expect(labelForKey('candidature_decision')).toBe('Application Updates');
        });

        it('returns translated label for signature_entente', () => {
            vi.mocked(I18nContext.useI18n).mockReturnValue({
                t: (key) => key === 'signatureEntenteNotification' ? 'Agreement Signature' : key
            });
            expect(labelForKey('signature_entente')).toBe('Agreement Signature');
        });

        it('returns default label for unknown key', () => {
            vi.mocked(I18nContext.useI18n).mockReturnValue({ t: (key) => key });
            expect(labelForKey('unknown')).toBe('unknown notification(s)');
        });
    });

    describe('shortText', () => {
        it('returns empty string when both messageFR and messageEN are missing', () => {
            vi.mocked(I18nContext.useI18n).mockReturnValue({ locale: 'fr' });
            expect(shortText({})).toBe('');
        });

        it('returns full French text when below max length', () => {
            vi.mocked(I18nContext.useI18n).mockReturnValue({ locale: 'fr' });
            const notification = { messageFR: 'Texte court', messageEN: 'Short text' };
            expect(shortText(notification, 80)).toBe('Texte court');
        });

        it('truncates French text when exceeds max length', () => {
            vi.mocked(I18nContext.useI18n).mockReturnValue({ locale: 'fr' });
            const notification = {
                messageFR: 'Ceci est un très long texte qui dépasse la longueur maximale autorisée',
                messageEN: 'This is a very long text'
            };
            const result = shortText(notification, 50);
            expect(result).toBe('Ceci est un très long texte qui dépasse la long...');
            expect(result.length).toBe(50);
        });

        it('returns full English text when below max length', () => {
            vi.mocked(I18nContext.useI18n).mockReturnValue({ locale: 'en' });
            const notification = { messageFR: 'Texte court', messageEN: 'Short text' };
            expect(shortText(notification, 80)).toBe('Short text');
        });

        it('truncates English text when exceeds max length', () => {
            vi.mocked(I18nContext.useI18n).mockReturnValue({ locale: 'en' });
            const notification = {
                messageFR: 'Texte court',
                messageEN: 'This is a very long text that exceeds the maximum allowed length'
            };
            const result = shortText(notification, 50);
            expect(result).toBe('This is a very long text that exceeds the maxim...');
            expect(result.length).toBe(50);
        });

        it('uses default max length of 80', () => {
            vi.mocked(I18nContext.useI18n).mockReturnValue({ locale: 'fr' });
            const notification = { messageFR: 'A'.repeat(100), messageEN: 'B'.repeat(100) };
            const result = shortText(notification);
            expect(result.length).toBe(80);
            expect(result.endsWith('...')).toBe(true);
        });

        it('handles notification with only messageFR', () => {
            vi.mocked(I18nContext.useI18n).mockReturnValue({ locale: 'fr' });
            const notification = { messageFR: 'Message français' };
            expect(shortText(notification)).toBe('Message français');
        });

        it('handles notification with only messageEN', () => {
            vi.mocked(I18nContext.useI18n).mockReturnValue({ locale: 'en' });
            const notification = { messageEN: 'English message' };
            expect(shortText(notification)).toBe('English message');
        });
    });
});