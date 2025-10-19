// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title IERC20
 * @dev Interface for ERC20 token interactions
 */
interface IERC20 {
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

/**
 * @title Grabli
 * @dev A competitive game where players claim a prize and accumulate holding time.
 * The winner is the player who holds the prize for the longest time.
 * Supports ERC20 token prizes that are automatically transferred to winners.
 */
contract Grabli is Ownable, ReentrancyGuard {
    struct Game {
        string prizeTitle;
        string prizeCurrency;
        string prizeDescription;
        address prizeToken;        // ERC20 token address for prize (address(0) = no token prize)
        uint256 prizeAmount;       // Amount of ERC20 tokens for prize
        address sponsor;           // Sponsor who created and funds the game
        string sponsorName;
        string sponsorUrl;
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

    // Game ID => Duration in seconds (stored for funding phase)
    mapping(uint256 => uint256) public gameDuration;

    uint256 public gameCount;
    uint256 public constant DEFAULT_COOLDOWN = 10; // 10 seconds default cooldown

    event GameCreated(
        uint256 indexed gameId,
        string prizeTitle,
        address prizeToken,
        uint256 prizeAmount,
        address sponsor
    );

    event GameFunded(
        uint256 indexed gameId,
        address prizeToken,
        uint256 prizeAmount,
        uint256 startAt,
        uint256 endAt
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

    event PrizeClaimed(
        uint256 indexed gameId,
        address indexed winner,
        address prizeToken,
        uint256 amount
    );

    constructor() Ownable(msg.sender) {}

    /**
     * @dev Creates a new game with specified parameters (does NOT start the game)
     * @notice Automatically closes any active games before creating a new one
     * @notice Game will start once fundGame() is called
     * @param _prizeTitle Title of the prize
     * @param _prizeCurrency Currency of the prize (e.g., "USD", display only)
     * @param _prizeDescription Description of the prize
     * @param _prizeToken Address of ERC20 token for prize (address(0) = no token prize)
     * @param _prizeAmount Amount of ERC20 tokens for prize
     * @param _sponsorName Name of the sponsor
     * @param _sponsorUrl URL of the sponsor
     * @param _duration Duration of the game in seconds
     * @param _claimCooldown Minimum seconds between claims (0 = no cooldown)
     */
    function createGame(
        string memory _prizeTitle,
        string memory _prizeCurrency,
        string memory _prizeDescription,
        address _prizeToken,
        uint256 _prizeAmount,
        string memory _sponsorName,
        string memory _sponsorUrl,
        uint256 _duration,
        uint256 _claimCooldown
    ) external onlyOwner returns (uint256) {
        require(_duration > 0, "Duration must be greater than 0");
        require(bytes(_prizeTitle).length > 0, "Prize title required");

        // Auto-close all active games before creating a new one
        _closeAllActiveGames();

        uint256 gameId = gameCount++;

        games[gameId] = Game({
            prizeTitle: _prizeTitle,
            prizeCurrency: _prizeCurrency,
            prizeDescription: _prizeDescription,
            prizeToken: _prizeToken,
            prizeAmount: _prizeAmount,
            sponsor: msg.sender,
            sponsorName: _sponsorName,
            sponsorUrl: _sponsorUrl,
            startAt: 0,  // NOT started yet - will be set when funded
            endAt: 0,    // NOT started yet - will be set when funded
            holder: address(0),
            sinceTs: 0,
            finished: false,
            winner: address(0),
            winnerTotalSeconds: 0,
            claimCooldown: _claimCooldown > 0 ? _claimCooldown : DEFAULT_COOLDOWN
        });

        // Store duration for when game is funded
        gameDuration[gameId] = _duration;

        emit GameCreated(gameId, _prizeTitle, _prizeToken, _prizeAmount, msg.sender);
        return gameId;
    }

    /**
     * @dev Fund the game with ERC20 tokens and start it
     * @notice Only the sponsor can fund the game
     * @notice Game must not be started yet (startAt == 0)
     * @param _gameId ID of the game to fund
     */
    function fundGame(uint256 _gameId) external nonReentrant {
        Game storage game = games[_gameId];

        require(_gameId < gameCount, "Game does not exist");
        require(game.startAt == 0, "Game already funded/started");
        require(game.prizeToken != address(0), "Game has no token prize");
        require(game.prizeAmount > 0, "Game has no prize amount");
        require(msg.sender == game.sponsor, "Only sponsor can fund");

        // Transfer tokens from sponsor to contract
        IERC20(game.prizeToken).transferFrom(msg.sender, address(this), game.prizeAmount);

        // START the game now that it's funded
        game.startAt = block.timestamp;
        game.endAt = block.timestamp + gameDuration[_gameId];

        emit GameFunded(_gameId, game.prizeToken, game.prizeAmount, game.startAt, game.endAt);
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

        // Transfer prize to winner if game has ERC20 prize
        if (game.prizeToken != address(0) && game.prizeAmount > 0 && winner != address(0)) {
            IERC20(game.prizeToken).transfer(winner, game.prizeAmount);
            emit PrizeClaimed(_gameId, winner, game.prizeToken, game.prizeAmount);
        }

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

        // Transfer prize to winner if game has ERC20 prize
        if (game.prizeToken != address(0) && game.prizeAmount > 0 && winner != address(0)) {
            IERC20(game.prizeToken).transfer(winner, game.prizeAmount);
            emit PrizeClaimed(_gameId, winner, game.prizeToken, game.prizeAmount);
        }

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

            // Transfer prize to winner if game has ERC20 prize
            if (game.prizeToken != address(0) && game.prizeAmount > 0 && winner != address(0)) {
                IERC20(game.prizeToken).transfer(winner, game.prizeAmount);
                emit PrizeClaimed(i, winner, game.prizeToken, game.prizeAmount);
            }

            emit GameFinished(i, winner, maxSeconds);
        }
    }

    /**
     * @dev Get current game state with calculated current holder time
     * @param _gameId ID of the game
     */
    function getGameState(uint256 _gameId) external view returns (
        string memory prizeTitle,
        string memory prizeCurrency,
        string memory sponsorName,
        uint256 startAt,
        uint256 endAt,
        address holder,
        uint256 currentHolderSeconds,
        bool finished,
        address winner,
        address prizeToken,
        uint256 prizeAmount
    ) {
        Game storage game = games[_gameId];

        uint256 holderSeconds = 0;
        if (game.holder != address(0) && !game.finished) {
            uint256 endTime = block.timestamp < game.endAt ? block.timestamp : game.endAt;
            holderSeconds = endTime - game.sinceTs;
        }

        return (
            game.prizeTitle,
            game.prizeCurrency,
            game.sponsorName,
            game.startAt,
            game.endAt,
            game.holder,
            holderSeconds,
            game.finished,
            game.winner,
            game.prizeToken,
            game.prizeAmount
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
        string memory prizeCurrency,
        string memory prizeDescription,
        string memory sponsorName,
        string memory sponsorUrl,
        uint256 startAt,
        uint256 endAt,
        bool finished,
        address prizeToken,
        uint256 prizeAmount,
        address sponsor
    ) {
        Game storage game = games[_gameId];

        return (
            game.prizeTitle,
            game.prizeCurrency,
            game.prizeDescription,
            game.sponsorName,
            game.sponsorUrl,
            game.startAt,
            game.endAt,
            game.finished,
            game.prizeToken,
            game.prizeAmount,
            game.sponsor
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
