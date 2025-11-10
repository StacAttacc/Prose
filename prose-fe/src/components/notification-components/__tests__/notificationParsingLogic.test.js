import { describe, it, expect } from 'vitest';
import { normalizeNotifications } from '../notification-utils/notificationParsingLogic';

describe('notificationParsingLogic', () => {
    it('normalizes grouped notifications correctly', () => {
        const payload = {
            data: {
                groups: [
                    {
                        typeKey: 'stage',
                        items: [
                            { id: 1, stageId: 10, message: 'Stage 1' },
                            { id: 2, stageId: 11, message: 'Stage 2' }
                        ]
                    },
                    {
                        typeKey: 'postulation',
                        items: [
                            { id: 3, candidatureId: 20, message: 'Application 1' }
                        ]
                    }
                ]
            }
        };

        const result = normalizeNotifications(payload);
        expect(result.stage).toHaveLength(2);
        expect(result.postulation).toHaveLength(1);
    });

    it('handles convocation notifications', () => {
        const payload = {
            data: {
                groups: [{
                    typeKey: 'convocation',
                    items: [{ id: 1, convocation: 100 }]
                }]
            }
        };

        const result = normalizeNotifications(payload);
        expect(result.convocation).toHaveLength(1);
    });

    it('handles cv notifications', () => {
        const payload = {
            data: {
                groups: [{
                    typeKey: 'gestionnaire_cv',
                    items: [{ id: 1, cvId: 50 }]
                }]
            }
        };

        const result = normalizeNotifications(payload);
        expect(result.gestionnaire_cv).toHaveLength(1);
    });

    it('handles candidature_decision notifications', () => {
        const payload = {
            data: {
                groups: [{
                    typeKey: 'candidature_decision',
                    items: [{ id: 1, candidatureDecisionId: 60 }]
                }]
            }
        };

        const result = normalizeNotifications(payload);
        expect(result.candidature_decision).toHaveLength(1);
    });

    it('returns empty object for invalid payload', () => {
        expect(normalizeNotifications(null)).toEqual({});
        expect(normalizeNotifications({})).toEqual({});
        expect(normalizeNotifications({ data: {} })).toEqual({});
    });

    it('handles empty groups array', () => {
        const payload = { data: { groups: [] } };
        expect(normalizeNotifications(payload)).toEqual({});
    });

    it('handles items with type property', () => {
        const payload = {
            data: {
                groups: [{
                    items: [{ id: 1, type: 'Custom Type' }]
                }]
            }
        };

        const result = normalizeNotifications(payload);
        expect(result['custom-type']).toHaveLength(1);
    });
});
