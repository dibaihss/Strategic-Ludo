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

/** Board cell IDs where landing never captures an opponent. Edit this list for custom safe zones. */
const SAFE_ZONE_CELL_IDS = Object.freeze([
    '1a',
    '1b',
    '1c',
    '1d',
]);

const safeZoneCellSet = new Set(SAFE_ZONE_CELL_IDS);

const isSafeZone = (cellId) => Boolean(cellId && safeZoneCellSet.has(cellId));

/** Board cell IDs with arrow icons. */
const ARROW_CELL_IDS = Object.freeze([
    '3a',
    '3b',
    '3c',
    '3d',
    '10d',
    '10b',
    '10a',
    '10c'

]);

const arrowCellSet = new Set(ARROW_CELL_IDS);

const isArrow = (cellId) => Boolean(cellId && arrowCellSet.has(cellId));

/** Returns the arrow emoji direction for each arrow cell. */
const getArrowDirection = (cellId) => {
    switch (cellId) {
        case '3a': return '⬆️';
        case '10a': return '⬅️';
        case '3c': return '⬇️';
        case '10c': return '➡️';
        case '3b': return '➡️';
        case '10b': return '⬆️';
        case '3d': return '⬅️';
        case '10d': return '⬇️';
        case '11d': return '⬇️';
        default:  return '➡️';
    }
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
        syncGameState: 'Sync Game State',
        skipButton: "skip my turn",
        selectPlayer: 'Select a {color} Piece',
        playerNotSelected: 'A Piece should be selected to move',
        wrongColor: 'Wrong Color',
        wrongTurn: "It's {color}'s turn to play",
        wonGame: '{color} won the Game',
        gotIt: 'Got it',
        tutorialButton: 'Tutorial',
        tutorialSkip: 'Skip tutorial',
        tutorialStep1Title: 'Select a soldier',
        tutorialStep1Body: 'Click on this piece to select it.',
        tutorialStep1Hint: 'You can only move pieces you control.',
        tutorialStep2Title: 'Play card value 6',
        tutorialStep2Body: 'When you click card 6, the selected piece moves 6 steps forward on the board.',
        tutorialStep2Hint: 'Try pressing a card with value 6.',
        tutorialStep3Title: 'Enter a new soldier',
        tutorialStep3Body: 'Use this button to enter a new soldier from your base.',
        tutorialStep3Hint: 'This helps you put more pieces into play.',
        tutorialStep4Title: 'Choose stacked soldiers',
        tutorialStep4Body: 'If multiple soldiers share one box, use the selector to cycle and choose one.',
        tutorialStep4Hint: 'Tap until the soldier you want becomes active.',
        tutorialStep5Title: 'Wait for your turn',
        tutorialStep5Body: 'Wait until your turn comes back to blue.',
        tutorialStep5Hint: 'When blue is active again, continue to step 4.',
        tutorialStep6Title: 'Capture the red soldier',
        tutorialStep6Body: 'Click on 3 to capture the red soldier.',
        tutorialStep6Hint: 'Use card 3 to land on the red soldier and capture it.',
        // --- New Exit Modal Strings ---
        exitGameTitle: 'Exit Game?',
        exitGameConfirm: 'Are you sure you want to leave the current game?',
        cancel: 'Cancel',
        exit: 'Exit',
        // --- End New Strings ---
        loadingGame: 'Loading game...',
        waitingForPlayers: 'Waiting for enough players to join...',
        backToLobby: 'Back to Lobby',
        error: 'Error',
        // --- Login Page Strings ---
        fillFields: 'Please fill in all fields',
        success: 'Success',
        guestLoginSuccess: 'Logged in as guest',
        guestLoginFailed: 'Guest login failed',
        loginTitle: 'Login to Ludo',
        email: 'Email Address',
        password: 'Password',
        login: 'Login',
        forgotPassword: 'Forgot password?',
        noAccount: "Don't have an account?",
        signUp: "Sign Up",
        or: 'OR',
        continueAsGuest: 'Continue as Guest',
        // --- Home Page Strings ---
        welcome: 'Welcome',
        guest: 'Guest',
        dashboard: 'Dashboard',
        wins: 'Wins',
        gamesPlayed: 'Games Played',
        points: 'Points',
        playLocal: 'Play Local',
        playWithFamily: 'Play with Family',
        playVsBot: 'Play vs Bot',
        playBots: 'Play vs Bots',
        playMultiplayer: 'Multiplayer',
        playOffline: 'Play Offline',
        offlineChoiceTitle: 'Offline Play Options',
        offlineChoiceMessage: 'Choose whether to play with family locally or against the bot.',
        chooseBotDifficultyTitle: 'Choose bot difficulty',
        chooseBotDifficultyMessage: 'Select how smart the bot should play.',
        easy: 'Easy',
        normal: 'Normal',
        hard: 'Hard',
        loginRequiredTitle: 'Login required',
        loginRequiredMessage: 'You are not logged in yet. Go to the login screen to sign in before starting multiplayer.',
        developmentPhase: 'The game is in development phase',
        // --- Waiting Room Strings ---
        loadingMatch: 'Loading match details...',
        matchNotFound: 'Match not found!',
        backToHome: 'Back to Home',
        waitingRoom: 'Waiting Room',
        matchId: 'Match ID',
        players: 'Players',
        host: 'Host',
        noPlayersYet: 'No players have joined yet',
        waitingForPlayers: 'Waiting for more players to join...',
        needMorePlayers: 'Need at least one more player to start',
        gameStartsWith4: 'Game will start automatically with 4 players',
        addBot: 'Add Bot',
        bot: 'Bot',
        hostCanAddBots: 'Host can add up to 3 bots',
        maxBotsReached: 'You can add up to 3 bots',
        lobbyFull: 'Lobby is full',
        startGame: 'Start Game',
        leaveMatch: 'Leave Match',
        you: '(You)',
        gameStartingIn: 'Game starting in',
        gameStartingSoon: 'Game starting soon...',
        startingAutomatically: 'Starting automatically...',
        gamePaused: 'Game Paused',
        waitingForPlayers: 'Waiting for players to return...',
        inactivePlayers: 'Inactive Players',
        noInactivePlayers: 'No inactive players found',
        gameResumeAutomatically: 'The game will resume automatically when all players return.'
    },
    ar: {
        timer: '{time} :الوقت',
        themeButton: '{name} :النمط',
        syncGameState: 'مزامنة حالة اللعبة',
        skipButton: "تخطي الدور",
        selectPlayer: '{color} اختر قطعة',
        playerNotSelected: 'يجب اختيار قطعة للتحرك',
        wrongColor: 'لون خاطئ',
        wrongTurn: 'دور ال{color} اختر لاعب من للون {color}',
        wonGame: 'فاز في اللعبة {color}',
        gotIt: 'فهمت',
        tutorialButton: 'الدليل',
        tutorialSkip: 'تخطي الدليل',
        tutorialStep1Title: 'اختر جندي',
        tutorialStep1Body: 'اضغط على هذه القطعة لاختيارها.',
        tutorialStep1Hint: 'يمكنك تحريك القطع التي تملكها فقط.',
        tutorialStep2Title: 'العب بطاقة رقم 6',
        tutorialStep2Body: 'عند الضغط على البطاقة 6، تتحرك القطعة المحددة 6 خطوات للأمام.',
        tutorialStep2Hint: 'جرّب الضغط على بطاقة بقيمة 6.',
        tutorialStep3Title: 'إدخال جندي جديد',
        tutorialStep3Body: 'استخدم هذا الزر لإدخال جندي جديد من القاعدة.',
        tutorialStep3Hint: 'هذا يساعدك على إدخال المزيد من القطع إلى اللعب.',
        tutorialStep4Title: 'اختيار الجنود المتراكمين',
        tutorialStep4Body: 'عند وجود عدة جنود في نفس الخانة، استخدم المحدد للتبديل بينهم.',
        tutorialStep4Hint: 'اضغط حتى يصبح الجندي المطلوب نشطًا.',
        tutorialStep5Title: 'تغيير الدور',
        tutorialStep5Body: 'بعد حركتك، ينتقل الدور إلى اللاعب التالي.',
        tutorialStep5Hint: 'أنهِ دورًا واحدًا لإكمال هذا الدليل.',
        tutorialStep6Title: 'أمسك الجندي الأحمر',
        tutorialStep6Body: 'اضغط على 3 لأسر الجندي الأحمر.',
        tutorialStep6Hint: 'استخدم بطاقة 3 للوقوف على الجندي الأحمر وأسره.',
        // --- New Exit Modal Strings ---
        exitGameTitle: 'الخروج من اللعبة؟',
        exitGameConfirm: 'هل أنت متأكد أنك تريد مغادرة اللعبة الحالية؟',
        cancel: 'إلغاء',
        exit: 'خروج',
        // --- End New Strings ---
        loadingGame: 'جار تحميل اللعبة...',
        waitingForPlayers: 'في انتظار انضمام عدد كافٍ من اللاعبين...',
        backToLobby: 'العودة إلى الردهة',
        error: 'خطأ',
        // --- Login Page Strings ---
        fillFields: 'يرجى ملء جميع الحقول',
        success: 'نجاح',
        guestLoginSuccess: 'تم تسجيل الدخول كضيف',
        guestLoginFailed: 'فشل تسجيل الدخول كضيف',
        loginTitle: 'تسجيل الدخول إلى لودو',
        email: 'عنوان البريد الإلكتروني',
        password: 'كلمة المرور',
        login: 'تسجيل الدخول',
        forgotPassword: 'هل نسيت كلمة المرور؟',
        noAccount: 'ليس لديك حساب؟',
        signUp: 'اشتراك',
        or: 'أو',
        continueAsGuest: 'المتابعة كضيف',
        // --- Home Page Strings ---
        welcome: 'مرحباً',
        guest: 'ضيف',
        dashboard: 'لوحة التحكم',
        wins: 'انتصارات',
        gamesPlayed: 'الألعاب الملعوبة',
        points: 'نقاط',
        playLocal: 'لعب محلي',
        playWithFamily: 'العب مع العائلة',
        playVsBot: 'العب ضد البوت',
        playBots: 'العب ضد البوت',
        playMultiplayer: 'متعدد اللاعبين',
        playOffline: 'لعب دون اتصال',
        offlineChoiceTitle: 'خيارات اللعب دون اتصال',
        offlineChoiceMessage: 'اختر ما إذا كنت تريد اللعب مع العائلة محليًا أو ضد البوت.',
        chooseBotDifficultyTitle: 'اختر صعوبة البوت',
        chooseBotDifficultyMessage: 'حدد مدى ذكاء البوت في اللعب.',
        easy: 'سهل',
        normal: 'عادي',
        hard: 'صعب',
        loginRequiredTitle: 'تسجيل الدخول مطلوب',
        loginRequiredMessage: 'أنت غير مسجل الدخول بعد. انتقل إلى شاشة تسجيل الدخول قبل بدء اللعب متعدد اللاعبين.',
        developmentPhase: 'اللعبة في مرحلة التطوير',
        // --- Waiting Room Strings ---
        loadingMatch: 'جارٍ تحميل تفاصيل المباراة...',
        matchNotFound: 'المباراة غير موجودة!',
        backToHome: 'العودة إلى الرئيسية',
        waitingRoom: 'غرفة الانتظار',
        matchId: 'معرف المباراة',
        players: 'اللاعبون',
        host: 'المضيف',
        noPlayersYet: 'لم ينضم أي لاعب بعد',
        waitingForPlayers: 'في انتظار انضمام المزيد من اللاعبين...',
        needMorePlayers: 'تحتاج إلى لاعب واحد آخر على الأقل للبدء',
        gameStartsWith4: 'ستبدأ اللعبة تلقائيًا بـ 4 لاعبين',
        addBot: 'أضف بوت',
        bot: 'بوت',
        hostCanAddBots: 'يمكن للمضيف إضافة ما يصل إلى 3 بوتات',
        maxBotsReached: 'يمكنك إضافة ما يصل إلى 3 بوتات',
        lobbyFull: 'الغرفة ممتلئة',
        startGame: 'ابدأ اللعبة',
        leaveMatch: 'مغادرة المباراة',
        you: '(أنت)',
        gameStartingIn: 'تبدأ اللعبة في',
        gameStartingSoon: 'ستبدأ اللعبة قريبًا...',
        startingAutomatically: 'يبدأ تلقائيًا...',
        gamePaused: 'توقفت اللعبة',
        waitingForPlayers: 'بانتظار عودة اللاعبين...',
        inactivePlayers: 'اللاعبون غير النشطين',
        noInactivePlayers: 'لا يوجد لاعبين غير نشطين',
        gameResumeAutomatically: 'سيستأنف اللعب تلقائيًا عند عودة جميع اللاعبين.'
    },
    de: {
        timer: 'Zeit: {time}s',
        themeButton: 'Thema: {name}',
        syncGameState: 'Spielstatus synchronisieren',
        skipButton: "nicht spielen",
        selectPlayer: 'Wählen Sie einen {color} Spieler',
        playerNotSelected: 'Ein Spieler muss zum Bewegen ausgewählt werden',
        wrongColor: 'Falsche Farbe',
        wrongTurn: '{color} ist an der Reihe',
        wonGame: '{color} hat das Spiel gewonnen',
        gotIt: 'Verstanden',
        tutorialButton: 'Tutorial',
        tutorialSkip: 'Tutorial uberspringen',
        tutorialStep1Title: 'Figur auswahlen',
        tutorialStep1Body: 'Klicken Sie auf diese Figur, um sie auszuwahlen.',
        tutorialStep1Hint: 'Sie konnen nur Ihre eigenen Figuren bewegen.',
        tutorialStep2Title: 'Karte mit Wert 6 spielen',
        tutorialStep2Body: 'Wenn Sie Karte 6 klicken, bewegt sich die ausgewahlte Figur 6 Felder vorwarts.',
        tutorialStep2Hint: 'Tippen Sie jetzt auf eine Karte mit Wert 6.',
        tutorialStep3Title: 'Neue Figur einsetzen',
        tutorialStep3Body: 'Mit dieser Taste setzen Sie eine neue Figur aus der Basis ein.',
        tutorialStep3Hint: 'So bringen Sie mehr Figuren ins Spiel.',
        tutorialStep4Title: 'Gestapelte Figuren wahlen',
        tutorialStep4Body: 'Wenn mehrere Figuren auf einem Feld sind, nutzen Sie den Wahler zum Wechseln.',
        tutorialStep4Hint: 'Tippen Sie, bis die gewunschte Figur aktiv ist.',
        tutorialStep5Title: 'Zugwechsel',
        tutorialStep5Body: 'Nach Ihrem Zug ist der nachste Spieler an der Reihe.',
        tutorialStep5Hint: 'Beenden Sie einen Zug, um das Tutorial abzuschließen.',
        tutorialStep6Title: 'Rote Figur schlagen',
        tutorialStep6Body: 'Klicken Sie auf 3, um die rote Figur zu schlagen.',
        tutorialStep6Hint: 'Nutzen Sie Karte 3, um auf der roten Figur zu landen und sie zu schlagen.',
        // --- New Exit Modal Strings ---
        exitGameTitle: 'Spiel verlassen?',
        exitGameConfirm: 'Sind Sie sicher, dass Sie das aktuelle Spiel verlassen möchten?',
        cancel: 'Abbrechen',
        exit: 'Verlassen',
        // --- End New Strings ---
        loadingGame: 'Spiel wird geladen...',
        waitingForPlayers: 'Warte auf genügend Spieler...',
        backToLobby: 'Zurück zur Lobby',
        error: 'Fehler',
        // --- Login Page Strings ---
        fillFields: 'Bitte füllen Sie alle Felder aus',
        success: 'Erfolg',
        guestLoginSuccess: 'Als Gast angemeldet',
        guestLoginFailed: 'Gastanmeldung fehlgeschlagen',
        loginTitle: 'Bei Ludo anmelden',
        email: 'E-Mail-Adresse',
        password: 'Passwort',
        login: 'Anmelden',
        forgotPassword: 'Passwort vergessen?',
        noAccount: 'Haben Sie noch kein Konto?',
        signUp: 'Registrieren',
        or: 'ODER',
        continueAsGuest: 'Als Gast fortfahren',
        // --- Home Page Strings ---
        welcome: 'Willkommen',
        guest: 'Gast',
        dashboard: 'Dashboard',
        wins: 'Siege',
        gamesPlayed: 'Gespielte Spiele',
        points: 'Punkte',
        playLocal: 'Lokal spielen',
        playWithFamily: 'Mit Familie spielen',
        playVsBot: 'Gegen Bot spielen',
        playBots: 'Gegen Bots spielen',
        playMultiplayer: 'Mehrspieler',
        playOffline: 'Offline spielen',
        offlineChoiceTitle: 'Offline-Spieloptionen',
        offlineChoiceMessage: 'Wählen Sie, ob Sie lokal mit der Familie oder gegen den Bot spielen möchten.',
        chooseBotDifficultyTitle: 'Bot-Schwierigkeit wählen',
        chooseBotDifficultyMessage: 'Wählen Sie, wie klug der Bot spielen soll.',
        easy: 'Leicht',
        normal: 'Normal',
        hard: 'Schwer',
        loginRequiredTitle: 'Anmeldung erforderlich',
        loginRequiredMessage: 'Sie sind noch nicht angemeldet. Wechseln Sie zum Anmeldebildschirm, bevor Sie ein Mehrspielerspiel starten.',
        developmentPhase: 'Das Spiel befindet sich in der Entwicklungsphase',
        // --- Waiting Room Strings ---
        loadingMatch: 'Lade Matchdetails...',
        matchNotFound: 'Match nicht gefunden!',
        backToHome: 'Zurück zur Startseite',
        waitingRoom: 'Warteraum',
        matchId: 'Match-ID',
        players: 'Spieler',
        host: 'Host',
        noPlayersYet: 'Noch keine Spieler beigetreten',
        waitingForPlayers: 'Warte auf weitere Spieler...',
        needMorePlayers: 'Mindestens ein weiterer Spieler zum Starten benötigt',
        gameStartsWith4: 'Das Spiel startet automatisch mit 4 Spielern',
        addBot: 'Bot hinzufugen',
        bot: 'Bot',
        hostCanAddBots: 'Der Host kann bis zu 3 Bots hinzufugen',
        maxBotsReached: 'Sie konnen bis zu 3 Bots hinzufugen',
        lobbyFull: 'Die Lobby ist voll',
        startGame: 'Spiel starten',
        leaveMatch: 'Match verlassen',
        you: '(Du)',
        gameStartingIn: 'Spiel startet in',
        gameStartingSoon: 'Spiel startet bald...',
        startingAutomatically: 'Startet automatisch...',
        gamePaused: 'Spiel pausiert',
        waitingForPlayers: 'Warte auf Rückkehr der Spieler...',
        inactivePlayers: 'Inaktive Spieler',
        noInactivePlayers: 'Keine inaktiven Spieler gefunden',
        gameResumeAutomatically: 'Das Spiel wird automatisch fortgesetzt, wenn alle Spieler zurückkehren.'
    }
};

export {
    boxes,
    categories,
    directions,
    playerType,
    gameInstructions,
    uiStrings,
    startingPositions,
    getLocalizedColor,
    SAFE_ZONE_CELL_IDS,
    isSafeZone,
    ARROW_CELL_IDS,
    isArrow,
    getArrowDirection,
};
