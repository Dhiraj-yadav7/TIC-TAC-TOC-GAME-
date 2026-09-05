import Game from '../models/Game.js';

// 1. Get authenticated user statistics - GET /api/users/me/stats
export const getUserStats = async (req, res) => {
  try {
    const userId = req.user._id;
    const userName = req.user.name;

    // Filter completed games involving this user (by ObjectId or name)
    const userGamesFilter = {
      status: { $in: ['won', 'draw'] },
      $or: [
        { userX: userId },
        { userO: userId },
        { playerX: new RegExp(`^${userName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') },
        { playerO: new RegExp(`^${userName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') }
      ]
    };

    const completedGames = await Game.find(userGamesFilter).lean();

    let wins = 0;
    let losses = 0;
    let draws = 0;

    completedGames.forEach((game) => {
      if (game.status === 'draw') {
        draws++;
        return;
      }

      const isUserX =
        (game.userX && game.userX.toString() === userId.toString()) ||
        game.playerX.toLowerCase() === userName.toLowerCase();

      const isUserO =
        (game.userO && game.userO.toString() === userId.toString()) ||
        game.playerO.toLowerCase() === userName.toLowerCase();

      if (game.status === 'won') {
        if ((game.winner === 'X' && isUserX) || (game.winner === 'O' && isUserO)) {
          wins++;
        } else if ((game.winner === 'X' && isUserO) || (game.winner === 'O' && isUserX)) {
          losses++;
        }
      }
    });

    const totalGames = completedGames.length;
    const winPercentage = totalGames > 0 ? Number(((wins / totalGames) * 100).toFixed(1)) : 0;

    return res.status(200).json({
      success: true,
      data: {
        name: req.user.name,
        email: req.user.email,
        totalGames,
        wins,
        losses,
        draws,
        winPercentage
      }
    });
  } catch (error) {
    console.error('Failed to calculate user stats:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch personal user statistics',
      error: error.message
    });
  }
};
