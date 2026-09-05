import User from '../models/User.js';
import Game from '../models/Game.js';

// 1. Get Global Leaderboard - GET /api/leaderboard
export const getLeaderboard = async (req, res) => {
  try {
    const users = await User.find({}, 'name createdAt').lean();
    const completedGames = await Game.find({
      status: { $in: ['won', 'draw'] }
    }).lean();

    const userStatsMap = new Map();

    users.forEach((u) => {
      userStatsMap.set(u._id.toString(), {
        _id: u._id.toString(),
        name: u.name,
        totalGames: 0,
        wins: 0,
        losses: 0,
        draws: 0,
        winPercentage: 0
      });
    });

    completedGames.forEach((game) => {
      const userXId = game.userX ? game.userX.toString() : null;
      const userOId = game.userO ? game.userO.toString() : null;

      // Also match by name fallback for non-linked records
      const userXObj = userXId
        ? userStatsMap.get(userXId)
        : Array.from(userStatsMap.values()).find(
            (u) => u.name.toLowerCase() === game.playerX.toLowerCase()
          );

      const userOObj = userOId
        ? userStatsMap.get(userOId)
        : Array.from(userStatsMap.values()).find(
            (u) => u.name.toLowerCase() === game.playerO.toLowerCase()
          );

      if (userXObj) {
        userXObj.totalGames++;
        if (game.status === 'draw') {
          userXObj.draws++;
        } else if (game.status === 'won') {
          if (game.winner === 'X') userXObj.wins++;
          else if (game.winner === 'O') userXObj.losses++;
        }
      }

      if (userOObj) {
        userOObj.totalGames++;
        if (game.status === 'draw') {
          userOObj.draws++;
        } else if (game.status === 'won') {
          if (game.winner === 'O') userOObj.wins++;
          else if (game.winner === 'X') userOObj.losses++;
        }
      }
    });

    const leaderboard = Array.from(userStatsMap.values()).map((user) => {
      const winPercentage =
        user.totalGames > 0
          ? Number(((user.wins / user.totalGames) * 100).toFixed(1))
          : 0;

      return {
        _id: user._id,
        name: user.name,
        totalGames: user.totalGames,
        wins: user.wins,
        losses: user.losses,
        draws: user.draws,
        winPercentage
      };
    });

    // Sort primarily by wins desc, then winPercentage desc, then totalGames desc
    leaderboard.sort((a, b) => {
      if (b.wins !== a.wins) return b.wins - a.wins;
      if (b.winPercentage !== a.winPercentage) return b.winPercentage - a.winPercentage;
      return b.totalGames - a.totalGames;
    });

    // Assign 1-indexed ranks
    const rankedLeaderboard = leaderboard.map((player, index) => ({
      rank: index + 1,
      ...player
    }));

    return res.status(200).json({
      success: true,
      data: rankedLeaderboard
    });
  } catch (error) {
    console.error('Failed to generate leaderboard:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch global leaderboard',
      error: error.message
    });
  }
};
