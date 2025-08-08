// public/js/scrambler.js
// Scramble generator for Rubik's Cube
function generateScramble() {
  const moves = ["U", "D", "F", "B", "R", "L"];
  const dirs = ["", "'", "2"];
  const scrambleLength = Math.floor(Math.random() * 4) + 25; // 25-28 moves

  let scramble = [];

  // Generate initial random move
  let lastMove = moves[Math.floor(Math.random() * moves.length)];
  let lastDir = dirs[Math.floor(Math.random() * dirs.length)];
  scramble.push(lastMove + lastDir);

  // Generate the rest of the scramble
  for (let i = 1; i < scrambleLength; i++) {
    let nextMove;

    // Avoid same face moves in a row
    do {
      nextMove = moves[Math.floor(Math.random() * moves.length)];
    } while (nextMove === lastMove);

    // Also avoid doing moves on opposite faces in a row (e.g., U followed by D)
    if (i >= 2) {
      const secondLastMove = scramble[i-2].charAt(0);

      // If the next move is opposite to the second last move and the last move is opposite to the next move,
      // then choose a different move
      if ((nextMove === 'U' && secondLastMove === 'D') ||
          (nextMove === 'D' && secondLastMove === 'U') ||
          (nextMove === 'F' && secondLastMove === 'B') ||
          (nextMove === 'B' && secondLastMove === 'F') ||
          (nextMove === 'R' && secondLastMove === 'L') ||
          (nextMove === 'L' && secondLastMove === 'R')) {
        // Choose a different move
        let validMoves = moves.filter(m =>
          m !== lastMove &&
          m !== getOppositeMove(secondLastMove)
        );
        nextMove = validMoves[Math.floor(Math.random() * validMoves.length)];
      }
    }

    const nextDir = dirs[Math.floor(Math.random() * dirs.length)];
    scramble.push(nextMove + nextDir);

    lastMove = nextMove;
    lastDir = nextDir;
  }

  return scramble.join(' ') + ` [${scrambleLength}]`;
}

// Helper function to get the opposite face
function getOppositeMove(move) {
  switch (move) {
    case 'U': return 'D';
    case 'D': return 'U';
    case 'F': return 'B';
    case 'B': return 'F';
    case 'R': return 'L';
    case 'L': return 'R';
    default: return '';
  }
}
