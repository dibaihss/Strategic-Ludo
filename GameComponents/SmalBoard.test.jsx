import { getSoldiersForBox, getStackedSoldierSlots, getColorCountsForSoldiers, getVisibleColorChips, getOrderedSoldiersForStack, getStackSelectorSoldier, getNextStackSelectorSoldier } from './SmalBoard.helpers';

describe('SmalBoard stack helpers', () => {
    test('collects every soldier in a board cell across colors', () => {
        const soldiers = getSoldiersForBox({
            number: '1a',
            soldierGroups: [
                [{ id: 1, position: '1a', color: 'blue' }],
                [{ id: 5, position: '1a', color: 'red' }],
                [{ id: 9, position: '3c', color: 'yellow' }],
            ],
        });

        expect(soldiers).toEqual([
            { id: 1, position: '1a', color: 'blue' },
            { id: 5, position: '1a', color: 'red' },
        ]);
    });

    test('returns four corner slots for crowded cells', () => {
        expect(getStackedSoldierSlots(4, true)).toEqual([
            { top: 0, left: 0 },
            { top: 0, right: 0 },
            { bottom: 0, left: 0 },
            { bottom: 0, right: 0 },
        ]);

        expect(getStackedSoldierSlots(3, false)).toEqual([
            { top: 4, left: 4 },
            { top: 4, right: 4 },
            { bottom: 4, left: 10 },
        ]);
    });

    test('builds per-color counts in fixed color order', () => {
        expect(getColorCountsForSoldiers([
            { id: 1, color: 'blue' },
            { id: 2, color: 'red' },
            { id: 3, color: 'red' },
            { id: 4, color: 'green' },
        ])).toEqual([
            { color: 'red', count: 2 },
            { color: 'blue', count: 1 },
            { color: 'green', count: 1 },
        ]);
    });

    test('collapses chip overflow into a compact final badge', () => {
        expect(getVisibleColorChips([
            { color: 'red', count: 2 },
            { color: 'blue', count: 1 },
            { color: 'yellow', count: 3 },
            { color: 'green', count: 1 },
        ])).toEqual([
            { color: 'red', count: 2 },
            { color: 'blue', count: 1 },
            { color: 'overflow', count: 4 },
        ]);
    });

    test('orders stack soldiers deterministically by color then id', () => {
        expect(getOrderedSoldiersForStack([
            { id: 8, color: 'green' },
            { id: 2, color: 'red' },
            { id: 7, color: 'blue' },
            { id: 1, color: 'red' },
        ])).toEqual([
            { id: 1, color: 'red' },
            { id: 2, color: 'red' },
            { id: 7, color: 'blue' },
            { id: 8, color: 'green' },
        ]);
    });

    test('uses the selected soldier for the stack selector when present', () => {
        expect(getStackSelectorSoldier({
            soldiers: [
                { id: 1, color: 'red' },
                { id: 7, color: 'blue' },
                { id: 9, color: 'yellow' },
            ],
            selectedSoldierId: 7,
        })).toEqual({ id: 7, color: 'blue' });
    });

    test('cycles stack selector to the next soldier in order', () => {
        expect(getNextStackSelectorSoldier({
            soldiers: [
                { id: 1, color: 'red' },
                { id: 7, color: 'blue' },
                { id: 9, color: 'yellow' },
            ],
            selectedSoldierId: 7,
        })).toEqual({ id: 9, color: 'yellow' });

        expect(getNextStackSelectorSoldier({
            soldiers: [
                { id: 1, color: 'red' },
                { id: 7, color: 'blue' },
            ],
            selectedSoldierId: 7,
        })).toEqual({ id: 1, color: 'red' });
    });
});