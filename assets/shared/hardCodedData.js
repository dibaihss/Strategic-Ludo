const boxes = {
    column1: ["12b", "11b", "10b", "9b", "8b", "7b", "home1", "hom2", "home3", "6a", "5a", "4a", "3a", "2a", "1a"],
    column2: ["1c", "2c", "3c", "4c", "5c", "6c", "home1", "hom2", "home3", "7d", "8d", "9d", "10d", "11d", "12d"],
    row1: ["1b", "2b", "3b", "4b", "5b", "6b", "home1", "hom2", "home3", "7c", "8c", "9c", "10c", "11c", "12c"],
    row2: ["12a", "11a", "10a", "9a", "8a", "7a", "home1", "hom2", "home3", "6d", "5d", "4d", "3d", "2d", "1d"],

};

const categories = ["a", "b", "c", "d"];
const startingPositions = {
    red: "1b",
    yellow: "1c",
    blue: "1a",
    green: "1d"
};

const directions = ["left", "top", "bottom", "right"];
const playerType = ["red", "yellow", "blue", "green"]
const playerTypeAr = ["احمر", "زهري", "ازرق", "اخضر"]
const playerTypeEn = ["red", "pink", "blue", "green"]
const playerTypeDe = ["Rot", "Pink", "Blau", "Grün"]
const gameInstructions = {
    ar: {
        title: "تعليمات اللعبة",
        content: `اللعبة هي لعبة Ludo (لودو)، وهي لعبة لوحية تُلعب عادةً بين 2 إلى 4 لاعبين. كل لاعب يملك أربع قطع (أو أحجار) بلون معين، والهدف هو إدخال جميع قطعه إلى "المنزل" في منتصف اللوحة بعد أن تدور دورة كاملة على المسار.
  
  وصف اللعبة: 🎲
  
  الألوان الأربعة: أحمر، أزرق، أخضر، وأرجواني (بنفسجي).
  
  كل لاعب يبدأ بأربعة أحجار في المنطقة المخصصة له.
  
  يملك ست ازرار من 1 الى 6 
  اذا ضغطت ع سبيل المثال 6 سيتقدم اللاعب ست خطوات الى الامام 
  
  يمكن للاعب أن يأكل قطعة لاعب آخر إذا وصل إلى نفس المربع (ما عدا المربعات الآمنة).
  
  شروط الفوز: 🎯
  
  1. على كل لاعب أن يقوم بإدخال جميع قطعه الأربع إلى المسار الداخلي الذي يؤدي إلى مركز اللوحة.
  
  2. يجب أن تدور كل قطعة دورة كاملة على اللوحة قبل أن تدخل "المنزل".
  
  3. أول لاعب يُدخل كل قطعه إلى "المنزل" يفوز.
  
  4. كل لاعب يلعب دو عندما يلعبه يذهب الدور الى اللاعب الاخر`

    },
    en: {
        title: "Game Instructions",
        content: `Ludo is a board game typically played between 2 to 4 players. Each player has four pieces (or tokens) of a specific color, and the goal is to move all pieces to the "home" in the center of the board after completing a full circuit.
  
  Game Description: 🎲
  
  Four Colors: Red, Blue, Green, and Purple.
  
  Each player starts with four tokens in their designated area.
  
  Players have six buttons numbered 1 to 6
  For example, if you press 6, your token will move six steps forward
  
  A player can capture another player's token by landing on the same square (except for safe squares).
  
  Winning Conditions 🎯:
  
  1. Each player must move all four tokens into the inner path leading to the center of the board.
  
  2. Each token must complete a full circuit around the board before entering "home".
  
  3. The first player to get all tokens into their "home" wins.
  
  4. It is a turn-based game. Each player plays one time, then the role goes to the next player`
    },
    de: {
        title: "Spielanleitung",
        content: `Ludo ist ein Brettspiel, das typischerweise von 2 bis 4 Spielern gespielt wird. Jeder Spieler hat vier Spielfiguren (oder Steine) in einer bestimmten Farbe, und das Ziel ist es, alle Figuren ins "Haus" in der Mitte des Spielbretts zu bringen, nachdem sie eine vollständige Runde gedreht haben.
  
  Spielbeschreibung: 
  
  Vier Farben: Rot, Blau, Grün und Lila.
  
  Jeder Spieler beginnt mit vier Steinen in seinem zugewiesenen Bereich.
  
  Spieler haben sechs Knöpfe von 1 bis 6
  Wenn Sie zum Beispiel 6 drücken, bewegt sich Ihr Stein sechs Schritte vorwärts
  
  Ein Spieler kann einen Stein eines anderen Spielers schlagen, indem er auf dasselbe Feld zieht (außer auf sichere Felder).
  
  Gewinnbedingungen: 🎯
  
  1. Jeder Spieler muss alle vier Steine auf den inneren Pfad bringen, der zur Mitte des Spielbretts führt.
  
  2. Jeder Stein muss eine vollständige Runde um das Brett machen, bevor er ins "Haus" eintreten kann.
  
  3. Der erste Spieler, der alle Steine in sein "Haus" bringt, gewinnt.
  
  4. Jeder Spieler kann einmal spielen, dann ist der andere Spieler an der Reihe`
    }
};

/**
 * Translates a color to its localized name based on system language
 * @param {string} color - The color name in English (red, yellow, blue, green)
 * @param {string} language - The current system language (en, ar, de)
 * @returns {string} - The translated color name
 */
const getLocalizedColor = (color, language) => {
    if (language === 'en') {
        const index = playerType.indexOf(color);
        return index !== -1 ? playerTypeEn[index] : color;
    } else if (language === 'ar') {
        const index = playerType.indexOf(color);
        return index !== -1 ? playerTypeAr[index] : color;
    } else if (language === 'de') {
        const index = playerType.indexOf(color);
        return index !== -1 ? playerTypeDe[index] : color;
    }
    return color;
};

const uiStrings = {
    en: {
        timer: 'Time: {time}s',
        themeButton: 'Theme: {name}',
        skipButton: "skip my turn",
        selectPlayer: 'Select a {color} Player',
        playerNotSelected: 'A Player should be selected to move',
        wrongColor: 'Wrong Color',
        wrongTurn: "It's {color}'s turn to play",
        wonGame: '{color} won the Game',
        gotIt: 'Got it'
    },
    ar: {
        timer: '{time} :الوقت',
        themeButton: '{name} :النمط',
        skipButton: "تخطي الدور",
        selectPlayer: '{color} اختر لاعب',
        playerNotSelected: 'يجب اختيار لاعب للتحرك',
        wrongColor: 'لون خاطئ',
        wrongTurn: 'دور ال{color} اختر لاعب من للون {color}',
        wonGame: 'فاز في اللعبة {color}',
        gotIt: 'فهمت'
    },
    de: {
        timer: 'Zeit: {time}s',
        themeButton: 'Thema: {name}',
        skipButton: "nicht spielen",
        selectPlayer: 'Wählen Sie einen {color} Spieler',
        playerNotSelected: 'Ein Spieler muss zum Bewegen ausgewählt werden',
        wrongColor: 'Falsche Farbe',
        wrongTurn: '{color} ist an der Reihe',
        wonGame: '{color} hat das Spiel gewonnen',
        gotIt: 'Verstanden'
    }
};

export { boxes, categories, directions, playerType, gameInstructions, uiStrings, startingPositions, getLocalizedColor };