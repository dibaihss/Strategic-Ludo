import { calculateNewPositionForPlayer } from '../GameComponents/Bases.logic';
import { startingPositions, isSafeZone } from '../assets/shared/hardCodedData.js';

export const BOT_DIFFICULTIES = ['easy', 'normal', 'hard'];

export const BOT_DIFFICULTY_PROFILES = {
  easy: {
    finishSoldier: 120,
    captureEnemy: 55,
    saferMove: 10,
    progressGain: 0.7,
    spawnWhenBoardEmpty: 26,
    spawnWhenLowPresence: 16,
    spawnCaptureBonus: 45,
    riskPenalty: 10,
    wasteHighCardPenalty: 6,
    noiseAmplitude: 22,
  },
  normal: {
    finishSoldier: 150,
    captureEnemy: 80,
    saferMove: 18,
    progressGain: 1.15,
    spawnWhenBoardEmpty: 24,
    spawnWhenLowPresence: 12,
    spawnCaptureBonus: 65,
    riskPenalty: 18,
    wasteHighCardPenalty: 10,
    noiseAmplitude: 6,
  },
  hard: {
    finishSoldier: 170,
    captureEnemy: 95,
    saferMove: 22,
    progressGain: 1.35,
    spawnWhenBoardEmpty: 22,
    spawnWhenLowPresence: 8,
    spawnCaptureBonus: 75,
    riskPenalty: 26,
    wasteHighCardPenalty: 14,
    noiseAmplitude: 0,
  },
};

const BOT_FINISH_LOOKUP_LIMIT = 48;

export const normalizeBotDifficulty = (difficulty) =>
  BOT_DIFFICULTIES.includes(difficulty) ? difficulty : 'normal';

export const getDifficultyProfile = (difficulty) =>
  BOT_DIFFICULTY_PROFILES[normalizeBotDifficulty(difficulty)];

export const getCardsForColor = (cardsByColor, color) => cardsByColor[color] || [];

export const getSoldiersForColor = (soldiersByColor, color) => soldiersByColor[color] || [];

export const getEnemyColors = (soldiersByColor, color) =>
  Object.keys(soldiersByColor).filter((enemyColor) => enemyColor !== color);

export const getOnBoardSoldiers = (soldiersByColor, color) =>
  getSoldiersForColor(soldiersByColor, color).filter((soldier) => soldier.onBoard && !soldier.isOut);

export const getOffBoardSoldiers = (soldiersByColor, color) =>
  getSoldiersForColor(soldiersByColor, color).filter((soldier) => !soldier.onBoard && !soldier.isOut);

export const getBoardPresence = (soldiersByColor, color) =>
  getOnBoardSoldiers(soldiersByColor, color).length;

export const getRemainingStepsToFinish = (soldier) => {
  if (!soldier?.onBoard || soldier.isOut) {
    return Infinity;
  }

  for (let steps = 1; steps <= BOT_FINISH_LOOKUP_LIMIT; steps += 1) {
    if (calculateNewPositionForPlayer(soldier, steps) === '') {
      return steps;
    }
  }

  return Infinity;
};

export const findEnemyOnPosition = (soldiersByColor, color, position) => {
  if (!position || position === '') return null;

  const enemyColors = getEnemyColors(soldiersByColor, color);
  for (const enemyColor of enemyColors) {
    const enemy = getSoldiersForColor(soldiersByColor, enemyColor).find(
      (soldier) => soldier.position === position && !soldier.isOut
    );
    if (enemy) {
      return enemy;
    }
  }

  return null;
};

export const countThreatsForPosition = ({ color, position, cardsByColor, soldiersByColor }) => {
  if (!position || position === '') return 0;

  let threatCount = 0;
  const enemyColors = getEnemyColors(soldiersByColor, color);

  enemyColors.forEach((enemyColor) => {
    const enemyCards = getCardsForColor(cardsByColor, enemyColor).filter((card) => !card.used);
    const enemyOnBoard = getOnBoardSoldiers(soldiersByColor, enemyColor);
    const enemyOffBoard = getOffBoardSoldiers(soldiersByColor, enemyColor);

    enemyOnBoard.forEach((enemySoldier) => {
      enemyCards.forEach((card) => {
        if (calculateNewPositionForPlayer(enemySoldier, card.value) === position) {
          threatCount += 1;
        }
      });
    });

    if (enemyOffBoard.length > 0 && startingPositions[enemyColor] === position) {
      threatCount += 1;
    }
  });

  return threatCount;
};

export const scoreMoveCandidate = ({ candidate, cardsByColor, soldiersByColor, profile }) => {
  const { soldier, steps, color, targetPosition } = candidate.payload;
  const reasons = [];
  let score = 0;

  const finishesSoldier = targetPosition === '';
  const captureTarget =
    finishesSoldier || isSafeZone(targetPosition)
      ? null
      : findEnemyOnPosition(soldiersByColor, color, targetPosition);
  const currentThreat = countThreatsForPosition({
    color,
    position: soldier.position,
    cardsByColor,
    soldiersByColor,
  });
  const targetThreat = finishesSoldier
    ? 0
    : countThreatsForPosition({
      color,
      position: targetPosition,
      cardsByColor,
      soldiersByColor,
    });

  const progressBefore = getRemainingStepsToFinish(soldier);
  const progressAfter = finishesSoldier
    ? 0
    : getRemainingStepsToFinish({ ...soldier, position: targetPosition, onBoard: true, isOut: false });
  const progressGain = Number.isFinite(progressBefore)
    ? Math.max(0, progressBefore - progressAfter)
    : 0;
  const saferMove = Math.max(0, currentThreat - targetThreat);
  const riskIncrease = Math.max(0, targetThreat - currentThreat);
  const wastesHighCard = steps >= 5 && progressGain <= 2 && !captureTarget && !finishesSoldier;

  if (finishesSoldier) {
    score += profile.finishSoldier;
    reasons.push('finish-soldier');
  }

  if (captureTarget) {
    score += profile.captureEnemy;
    reasons.push('capture-enemy');
  }

  if (saferMove > 0) {
    score += saferMove * profile.saferMove;
    reasons.push('safer-move');
  }

  if (progressGain > 0) {
    score += progressGain * profile.progressGain;
    reasons.push('progress');
  }

  if (riskIncrease > 0) {
    score -= riskIncrease * profile.riskPenalty;
    reasons.push('risk');
  }

  if (wastesHighCard) {
    score -= profile.wasteHighCardPenalty;
    reasons.push('waste-high-card');
  }

  return {
    ...candidate,
    score,
    reasons,
    metrics: {
      finishesSoldier,
      captureTarget: captureTarget?.id || null,
      progressGain,
      currentThreat,
      targetThreat,
    },
  };
};

export const scoreEnterCandidate = ({ candidate, cardsByColor, soldiersByColor, profile }) => {
  const { color } = candidate.payload;
  const reasons = [];
  let score = 0;

  const boardPresence = getBoardPresence(soldiersByColor, color);
  const spawnPosition = startingPositions[color];
  const captureTarget = isSafeZone(spawnPosition)
    ? null
    : findEnemyOnPosition(soldiersByColor, color, spawnPosition);
  const spawnThreat = countThreatsForPosition({
    color,
    position: spawnPosition,
    cardsByColor,
    soldiersByColor,
  });

  if (boardPresence === 0) {
    score += profile.spawnWhenBoardEmpty;
    reasons.push('spawn-empty-board');
  } else if (boardPresence === 1) {
    score += profile.spawnWhenLowPresence;
    reasons.push('spawn-low-presence');
  }

  if (captureTarget) {
    score += profile.spawnCaptureBonus;
    reasons.push('spawn-capture');
  }

  if (spawnThreat > 0) {
    score -= spawnThreat * profile.riskPenalty;
    reasons.push('spawn-risk');
  }

  return {
    ...candidate,
    score,
    reasons,
    metrics: {
      captureTarget: captureTarget?.id || null,
      boardPresence,
      spawnThreat,
    },
  };
};

export const buildBotActionCandidates = ({
  color,
  cardsByColor,
  soldiersByColor,
  difficulty = 'normal',
}) => {
  const profile = getDifficultyProfile(difficulty);
  const candidates = [];
  const cards = getCardsForColor(cardsByColor, color).filter((card) => !card.used);
  const onBoardSoldiers = getOnBoardSoldiers(soldiersByColor, color);
  const offBoardSoldiers = getOffBoardSoldiers(soldiersByColor, color);

  onBoardSoldiers.forEach((soldier) => {
    cards.forEach((card) => {
      const targetPosition = calculateNewPositionForPlayer(soldier, card.value);
      if (typeof targetPosition === 'undefined') {
        return;
      }

      const scoredCandidate = scoreMoveCandidate({
        candidate: {
          type: 'movePlayer',
          payload: {
            color,
            steps: card.value,
            soldier,
            card,
            targetPosition,
          },
        },
        cardsByColor,
        soldiersByColor,
        profile,
      });

      candidates.push(scoredCandidate);
    });
  });

  if (offBoardSoldiers.length > 0) {
    candidates.push(
      scoreEnterCandidate({
        candidate: {
          type: 'enterNewSoldier',
          payload: {
            color,
            soldier: offBoardSoldiers[0],
            targetPosition: startingPositions[color],
          },
        },
        cardsByColor,
        soldiersByColor,
        profile,
      })
    );
  }

  if (candidates.length === 0) {
    return [
      {
        type: 'skipTurn',
        payload: {},
        score: 0,
        reasons: ['no-legal-actions'],
        metrics: {},
      },
    ];
  }

  return candidates;
};

export const selectBotCandidate = (
  candidates,
  { difficulty = 'normal', randomFn = Math.random, disableNoise = false } = {}
) => {
  const profile = getDifficultyProfile(difficulty);
  const withNoise = candidates.map((candidate) => {
    const noise = disableNoise || profile.noiseAmplitude === 0
      ? 0
      : (randomFn() * 2 - 1) * profile.noiseAmplitude;

    return {
      ...candidate,
      score: candidate.score + noise,
    };
  });

  return withNoise.reduce((bestCandidate, candidate) => {
    if (!bestCandidate) return candidate;
    return candidate.score > bestCandidate.score ? candidate : bestCandidate;
  }, null);
};

export const chooseScoredBotAction = ({
  color,
  cardsByColor,
  soldiersByColor,
  difficulty = 'normal',
  randomFn = Math.random,
  disableNoise = false,
}) => {
  const candidates = buildBotActionCandidates({
    color,
    cardsByColor,
    soldiersByColor,
    difficulty,
  });

  return selectBotCandidate(candidates, { difficulty, randomFn, disableNoise });
};
