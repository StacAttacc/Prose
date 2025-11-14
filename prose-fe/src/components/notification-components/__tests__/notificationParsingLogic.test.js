import {normalizeNotifications} from "../notification-utils/notificationParsingLogic.jsx";

it('handles groups with missing items property', () => {
    const payload = {
        data: {
            groups: [
                { typeKey: 'stage' },
                { typeKey: 'postulation', items: null }
            ]
        }
    };

    const result = normalizeNotifications(payload);
    expect(result).toEqual({});
});

it('handles groups with undefined typeKey', () => {
    const payload = {
        data: {
            groups: [
                {
                    items: [{ id: 1, message: 'Test' }]
                }
            ]
        }
    };

    const result = normalizeNotifications(payload);
    expect(result.undefined).toHaveLength(1);
});

it('handles multiple groups with same typeKey', () => {
    const payload = {
        data: {
            groups: [
                {
                    typeKey: 'stage',
                    items: [{ id: 1, message: 'Stage 1' }]
                },
                {
                    typeKey: 'stage',
                    items: [{ id: 2, message: 'Stage 2' }]
                }
            ]
        }
    };

    const result = normalizeNotifications(payload);
    expect(result.stage).toHaveLength(2);
    expect(result.stage[0].id).toBe(1);
    expect(result.stage[1].id).toBe(2);
});

it('handles mixed valid and invalid groups', () => {
    const payload = {
        data: {
            groups: [
                { typeKey: 'stage', items: [{ id: 1 }] },
                { typeKey: 'invalid' },
                { typeKey: 'postulation', items: [{ id: 2 }] }
            ]
        }
    };

    const result = normalizeNotifications(payload);
    expect(result.stage).toHaveLength(1);
    expect(result.postulation).toHaveLength(1);
    expect(result.invalid).toBeUndefined();
});

it('handles groups with empty items array', () => {
    const payload = {
        data: {
            groups: [
                { typeKey: 'stage', items: [] },
                { typeKey: 'postulation', items: [{ id: 1 }] }
            ]
        }
    };

    const result = normalizeNotifications(payload);
    expect(result.stage).toBeUndefined();
    expect(result.postulation).toHaveLength(1);
});