export type Rung = {
  fromIndex: number; // The index of the left vertical line (0 to playerCount - 2)
  row: number; // The row position (0 to rowCount - 1)
};

export type LadderData = {
  playerCount: number;
  rowCount: number;
  rungs: Rung[];
};

export const generateLadder = (playerCount: number, rowCount: number): LadderData => {
  const rungs: Rung[] = [];

  for (let r = 0; r < rowCount; r++) {
    for (let i = 0; i < playerCount - 1; i++) {
      // Randomly decide to place a rung
      // Probability 0.5, but ensure no adjacent rungs in the same row
      if (Math.random() > 0.5) {
        const hasLeftRung = rungs.some((rung) => rung.row === r && rung.fromIndex === i - 1);
        if (!hasLeftRung) {
          rungs.push({ fromIndex: i, row: r });
        }
      }
    }
  }

  return { playerCount, rowCount, rungs };
};

export const getPath = (startIndex: number, ladder: LadderData): number[] => {
  const path: number[] = [startIndex];
  let currentIndex = startIndex;

  for (let r = 0; r < ladder.rowCount; r++) {
    // Check if there's a rung to the right
    const rightRung = ladder.rungs.find((rung) => rung.row === r && rung.fromIndex === currentIndex);
    // Check if there's a rung to the left
    const leftRung = ladder.rungs.find((rung) => rung.row === r && rung.fromIndex === currentIndex - 1);

    if (rightRung) {
      currentIndex++;
    } else if (leftRung) {
      currentIndex--;
    }
    path.push(currentIndex);
  }

  return path;
};
