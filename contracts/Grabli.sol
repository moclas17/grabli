// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title Grabli
 * @dev A competitive game where players claim a prize and accumulate holding time.
 * The winner is the player who holds the prize for the longest time.
 */
contract Grabli is Ownable, ReentrancyGuard {
    struct Game {
        string prizeTitle;
        uint256 prizeValue;
        string prizeCurrency;
        string prizeDescription;
        string sponsorName;
        string sponsorUrl;
        string sponsorLogo;
        uint256 startAt;
        uint256 endAt;
        address holder;
        uint256 sinceTs;
        bool finished;
        address winner;
        uint256 winnerTotalSeconds;
        uint256 claimCooldown; // Cooldown in seconds between claims
    }

    struct PlayerStats {
        uint256 totalSeconds;
        uint256 lastClaimTs;
        uint256 claimCount;
    }

    // Game ID => Game data
    mapping(uint256 => Game) public games;

    // Game ID => Player Address => Stats
    mapping(uint256 => mapping(address => PlayerStats)) public playerStats;

    // Game ID => Array of all players who participated
    mapping(uint256 => address[]) public gamePlayers;

    // Game ID => Player Address => bool (to check if player already in array)
    mapping(uint256 => mapping(address => bool)) public hasPlayed;

    uint256 public gameCount;
    uint256 public constant DEFAULT_COOLDOWN = 10; // 10 seconds default cooldown

    event GameCreated(
        uint256 indexed gameId,
        string prizeTitle,
        uint256 startAt,
        uint256 endAt,
        string sponsorName
    );

    event Claimed(
        uint256 indexed gameId,
        address indexed player,
        address indexed previousHolder,
        uint256 timestamp,
        uint256 previousHolderSeconds
    );

    event GameFinished(
        uint256 indexed gameId,
        address indexed winner,
        uint256 totalSeconds
    );

    constructor() Ownable(msg.sender) {}

    /**
     * @dev Creates a new game with specified parameters
     * @notice Automatically closes any active games before creating a new one
     * @param _prizeTitle Title of the prize
     * @param _prizeValue Value of the prize
     * @param _prizeCurrency Currency of the prize (e.g., "USD")
     * @param _prizeDescription Description of the prize
     * @param _sponsorName Name of the sponsor
     * @param _sponsorUrl URL of the sponsor
     * @param _sponsorLogo Logo URL of the sponsor
     * @param _duration Duration of the game in seconds
     * @param _claimCooldown Minimum seconds between claims (0 = no cooldown)
     */
    function createGame(
        string memory _prizeTitle,
        uint256 _prizeValue,
        string memory _prizeCurrency,
        string memory _prizeDescription,
        string memory _sponsorName,
        string memory _sponsorUrl,
        string memory _sponsorLogo,
        uint256 _duration,
        uint256 _claimCooldown
    ) external onlyOwner returns (uint256) {
        require(_duration > 0, "Duration must be greater than 0");
        require(bytes(_prizeTitle).length > 0, "Prize title required");

        // Auto-close all active games before creating a new one
        _closeAllActiveGames();

        uint256 gameId = gameCount++;
        uint256 startAt = block.timestamp;
        uint256 endAt = startAt + _duration;

        games[gameId] = Game({
            prizeTitle: _prizeTitle,
            prizeValue: _prizeValue,
            prizeCurrency: _prizeCurrency,
            prizeDescription: _prizeDescription,
            sponsorName: _sponsorName,
            sponsorUrl: _sponsorUrl,
            sponsorLogo: _sponsorLogo,
            startAt: startAt,
            endAt: endAt,
            holder: address(0),
            sinceTs: 0,
            finished: false,
            winner: address(0),
            winnerTotalSeconds: 0,
            claimCooldown: _claimCooldown > 0 ? _claimCooldown : DEFAULT_COOLDOWN
        });

        emit GameCreated(gameId, _prizeTitle, startAt, endAt, _sponsorName);
        return gameId;
    }

    /**
     * @dev Allows a player to claim the prize
     * @param _gameId ID of the game
     */
    function claim(uint256 _gameId) external nonReentrant {
        Game storage game = games[_gameId];

        require(_gameId < gameCount, "Game does not exist");
        require(block.timestamp >= game.startAt, "Game has not started yet");
        require(block.timestamp < game.endAt, "Game has ended");
        require(!game.finished, "Game is finished");
        require(msg.sender != game.holder, "You are already the holder");

        PlayerStats storage playerStat = playerStats[_gameId][msg.sender];

        // Check cooldown
        if (playerStat.lastClaimTs > 0) {
            require(
                block.timestamp >= playerStat.lastClaimTs + game.claimCooldown,
                "Cooldown period not elapsed"
            );
        }

        address previousHolder = game.holder;
        uint256 previousHolderSeconds = 0;

        // If there was a previous holder, calculate and update their time
        if (previousHolder != address(0)) {
            uint256 timeHeld = block.timestamp - game.sinceTs;
            playerStats[_gameId][previousHolder].totalSeconds += timeHeld;
            previousHolderSeconds = timeHeld;
        }

        // Update new holder
        game.holder = msg.sender;
        game.sinceTs = block.timestamp;

        // Update player stats
        playerStat.lastClaimTs = block.timestamp;
        playerStat.claimCount++;

        // Add player to game players array if first time
        if (!hasPlayed[_gameId][msg.sender]) {
            gamePlayers[_gameId].push(msg.sender);
            hasPlayed[_gameId][msg.sender] = true;
        }

        emit Claimed(_gameId, msg.sender, previousHolder, block.timestamp, previousHolderSeconds);
    }

    /**
     * @dev Closes the game and determines the winner
     * @param _gameId ID of the game
     */
    function closeGame(uint256 _gameId) external {
        Game storage game = games[_gameId];

        require(_gameId < gameCount, "Game does not exist");
        require(block.timestamp >= game.endAt, "Game has not ended yet");
        require(!game.finished, "Game already finished");

        // Add final holder's time if there is one
        if (game.holder != address(0)) {
            uint256 finalTime = game.endAt - game.sinceTs;
            playerStats[_gameId][game.holder].totalSeconds += finalTime;
        }

        // Find winner
        address winner = address(0);
        uint256 maxSeconds = 0;

        address[] memory players = gamePlayers[_gameId];
        for (uint256 i = 0; i < players.length; i++) {
            address player = players[i];
            uint256 totalSeconds = playerStats[_gameId][player].totalSeconds;

            if (totalSeconds > maxSeconds) {
                maxSeconds = totalSeconds;
                winner = player;
            }
        }

        game.finished = true;
        game.winner = winner;
        game.winnerTotalSeconds = maxSeconds;

        emit GameFinished(_gameId, winner, maxSeconds);
    }

    /**
     * @dev Force close a game before it ends (owner only)
     * @param _gameId ID of the game
     */
    function forceCloseGame(uint256 _gameId) external onlyOwner {
        Game storage game = games[_gameId];

        require(_gameId < gameCount, "Game does not exist");
        require(!game.finished, "Game already finished");

        // Add final holder's time if there is one
        if (game.holder != address(0)) {
            uint256 finalTime = block.timestamp - game.sinceTs;
            playerStats[_gameId][game.holder].totalSeconds += finalTime;
        }

        // Find winner
        address winner = address(0);
        uint256 maxSeconds = 0;

        address[] memory players = gamePlayers[_gameId];
        for (uint256 i = 0; i < players.length; i++) {
            address player = players[i];
            uint256 totalSeconds = playerStats[_gameId][player].totalSeconds;

            if (totalSeconds > maxSeconds) {
                maxSeconds = totalSeconds;
                winner = player;
            }
        }

        game.finished = true;
        game.winner = winner;
        game.winnerTotalSeconds = maxSeconds;
        game.endAt = block.timestamp; // Update endAt to current time

        emit GameFinished(_gameId, winner, maxSeconds);
    }

    /**
     * @dev Internal function to close all active games
     * @notice Iterates through all games and closes any that are not finished
     */
    function _closeAllActiveGames() internal {
        for (uint256 i = 0; i < gameCount; i++) {
            Game storage game = games[i];

            // Skip if game is already finished
            if (game.finished) {
                continue;
            }

            // Add final holder's time if there is one
            if (game.holder != address(0)) {
                uint256 finalTime = block.timestamp - game.sinceTs;
                playerStats[i][game.holder].totalSeconds += finalTime;
            }

            // Find winner
            address winner = address(0);
            uint256 maxSeconds = 0;

            address[] memory players = gamePlayers[i];
            for (uint256 j = 0; j < players.length; j++) {
                address player = players[j];
                uint256 totalSeconds = playerStats[i][player].totalSeconds;

                if (totalSeconds > maxSeconds) {
                    maxSeconds = totalSeconds;
                    winner = player;
                }
            }

            // Mark game as finished
            game.finished = true;
            game.winner = winner;
            game.winnerTotalSeconds = maxSeconds;
            game.endAt = block.timestamp; // Update endAt to current time

            emit GameFinished(i, winner, maxSeconds);
        }
    }

    /**
     * @dev Get current game state with calculated current holder time
     * @param _gameId ID of the game
     */
    function getGameState(uint256 _gameId) external view returns (
        string memory prizeTitle,
        uint256 prizeValue,
        string memory prizeCurrency,
        string memory sponsorName,
        uint256 startAt,
        uint256 endAt,
        address holder,
        uint256 currentHolderSeconds,
        bool finished,
        address winner
    ) {
        Game storage game = games[_gameId];

        uint256 holderSeconds = 0;
        if (game.holder != address(0) && !game.finished) {
            uint256 endTime = block.timestamp < game.endAt ? block.timestamp : game.endAt;
            holderSeconds = endTime - game.sinceTs;
        }

        return (
            game.prizeTitle,
            game.prizeValue,
            game.prizeCurrency,
            game.sponsorName,
            game.startAt,
            game.endAt,
            game.holder,
            holderSeconds,
            game.finished,
            game.winner
        );
    }

    /**
     * @dev Get player statistics for a game
     * @param _gameId ID of the game
     * @param _player Address of the player
     */
    function getPlayerStats(uint256 _gameId, address _player) external view returns (
        uint256 totalSeconds,
        uint256 lastClaimTs,
        uint256 claimCount
    ) {
        PlayerStats storage stats = playerStats[_gameId][_player];

        uint256 total = stats.totalSeconds;

        // If player is current holder, add ongoing time
        if (games[_gameId].holder == _player && !games[_gameId].finished) {
            uint256 endTime = block.timestamp < games[_gameId].endAt ? block.timestamp : games[_gameId].endAt;
            total += endTime - games[_gameId].sinceTs;
        }

        return (total, stats.lastClaimTs, stats.claimCount);
    }

    /**
     * @dev Get all players for a game
     * @param _gameId ID of the game
     */
    function getGamePlayers(uint256 _gameId) external view returns (address[] memory) {
        return gamePlayers[_gameId];
    }

    /**
     * @dev Get leaderboard for a game (returns all players with their stats)
     * @param _gameId ID of the game
     */
    function getLeaderboard(uint256 _gameId) external view returns (
        address[] memory players,
        uint256[] memory totalSeconds
    ) {
        address[] memory allPlayers = gamePlayers[_gameId];
        uint256[] memory allSeconds = new uint256[](allPlayers.length);

        for (uint256 i = 0; i < allPlayers.length; i++) {
            address player = allPlayers[i];
            uint256 total = playerStats[_gameId][player].totalSeconds;

            // Add current holding time if applicable
            if (games[_gameId].holder == player && !games[_gameId].finished) {
                uint256 endTime = block.timestamp < games[_gameId].endAt ? block.timestamp : games[_gameId].endAt;
                total += endTime - games[_gameId].sinceTs;
            }

            allSeconds[i] = total;
        }

        return (allPlayers, allSeconds);
    }

    /**
     * @dev Get full game details including sponsor info
     * @param _gameId ID of the game
     */
    function getGameDetails(uint256 _gameId) external view returns (
        string memory prizeTitle,
        uint256 prizeValue,
        string memory prizeCurrency,
        string memory prizeDescription,
        string memory sponsorName,
        string memory sponsorUrl,
        string memory sponsorLogo,
        uint256 startAt,
        uint256 endAt,
        bool finished
    ) {
        Game storage game = games[_gameId];

        return (
            game.prizeTitle,
            game.prizeValue,
            game.prizeCurrency,
            game.prizeDescription,
            game.sponsorName,
            game.sponsorUrl,
            game.sponsorLogo,
            game.startAt,
            game.endAt,
            game.finished
        );
    }

    /**
     * @dev Get all active (non-finished) game IDs
     * @return activeGameIds Array of game IDs that are not finished
     */
    function getActiveGames() external view returns (uint256[] memory) {
        // First, count active games
        uint256 activeCount = 0;
        for (uint256 i = 0; i < gameCount; i++) {
            if (!games[i].finished) {
                activeCount++;
            }
        }

        // Create array of appropriate size
        uint256[] memory activeGameIds = new uint256[](activeCount);
        uint256 currentIndex = 0;

        // Populate array with active game IDs
        for (uint256 i = 0; i < gameCount; i++) {
            if (!games[i].finished) {
                activeGameIds[currentIndex] = i;
                currentIndex++;
            }
        }

        return activeGameIds;
    }
}
