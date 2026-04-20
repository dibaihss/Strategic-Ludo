const MAX_STACK_PREVIEW = 4;
const MAX_COLOR_CHIPS = 3;
const COLOR_ORDER = ['red', 'blue', 'yellow', 'green'];

export const getSoldiersForBox = ({ number, soldierGroups }) =>
    soldierGroups.flatMap((soldiers) => soldiers.filter((soldier) => soldier.position === number));

export const getStackedSoldierSlots = (count, isSmallScreen) => {
    const inset = isSmallScreen ? 0 : 4;
    const middleTop = isSmallScreen ? 4 : 8;
    const middleLeft = isSmallScreen ? 4 : 10;

    if (count <= 1) {
        return [{ top: middleTop, left: middleLeft }];
    }

    if (count === 2) {
        return [
            { top: middleTop, left: inset },
            { top: middleTop, right: inset },
        ];
    }

    if (count === 3) {
        return [
            { top: inset, left: inset },
            { top: inset, right: inset },
            { bottom: inset, left: middleLeft },
        ];
    }

    return [
        { top: inset, left: inset },
        { top: inset, right: inset },
        { bottom: inset, left: inset },
        { bottom: inset, right: inset },
    ];
};

export const getVisibleSoldiersForBox = ({ soldiers, selectedSoldierId }) => {
    if (soldiers.length <= MAX_STACK_PREVIEW) {
        return soldiers;
    }

    const selectedSoldier = soldiers.find((soldier) => soldier.id === selectedSoldierId);
    if (!selectedSoldier) {
        return soldiers.slice(0, MAX_STACK_PREVIEW);
    }

    const preview = soldiers.filter((soldier) => soldier.id !== selectedSoldierId).slice(0, MAX_STACK_PREVIEW - 1);
    return [...preview, selectedSoldier];
};

export const getColorCountsForSoldiers = (soldiers) => {
    const countsByColor = soldiers.reduce((accumulator, soldier) => {
        if (!soldier?.color) {
            return accumulator;
        }

        accumulator[soldier.color] = (accumulator[soldier.color] || 0) + 1;
        return accumulator;
    }, {});

    return COLOR_ORDER
        .filter((color) => countsByColor[color])
        .map((color) => ({ color, count: countsByColor[color] }));
};

export const getVisibleColorChips = (colorCounts) => {
    if (colorCounts.length <= MAX_COLOR_CHIPS) {
        return colorCounts;
    }

    const visibleChips = colorCounts.slice(0, MAX_COLOR_CHIPS - 1);
    const overflowCount = colorCounts
        .slice(MAX_COLOR_CHIPS - 1)
        .reduce((total, chip) => total + chip.count, 0);

    return [
        ...visibleChips,
        { color: 'overflow', count: overflowCount },
    ];
};