// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;

import "./Common.sol";

/**
 * @title rock paper scissors game, players select an action and play against the VRF actions
 */

contract RockPaperScissors is Common {
    using SafeERC20 for IERC20;

    constructor(
        bytes32 keyHash,
        uint64 _subscriptionId,
        address _vrf,
        address link_eth_feed,
        address payable _vault
    ) {
        s_keyHash = keyHash;
        subscriptionId = _subscriptionId;
        LINK_ETH_FEED = AggregatorV3Interface(link_eth_feed);
        ChainLinkVRF = _vrf;
        vault = _vault;
        callGasLimit = 2500000;
    }

    struct RockPaperScissorsGame {
        uint256 wager;
        uint256 stopGain;
        uint256 stopLoss;
        uint256 requestID;
        address tokenAddress;
        uint64 blockNumber;
        uint32 numBets;
        uint8 action;
    }

    struct GameResult {
        int256 totalValue;
        uint256 payout;
        uint32 numGames;
    }

    mapping(address => RockPaperScissorsGame) rockPaperScissorsGames;
    mapping(uint256 => address) rockPaperScissorsIDs;

    /**
     * @dev event emitted at the start of the game
     * @param playerAddress address of the player that made the bet
     * @param wager wagered amount
     * @param tokenAddress address of token the wager was made, 0 address is considered the native coin
     * @param action action selected by the player
     * @param numBets number of bets the player intends to make
     * @param stopGain gain value at which the betting stop if a gain is reached
     * @param stopLoss loss value at which the betting stop if a loss is reached
     */
    event RockPaperScissors_Play_Event(
        address indexed playerAddress,
        uint256 wager,
        address tokenAddress,
        uint8 action,
        uint32 numBets,
        uint256 stopGain,
        uint256 stopLoss,
        uint256 VRFFee,
        uint256 indexed requestId
    );

    /**
     * @dev event emitted by the VRF callback with the bet results
     * @param payout total payout transfered to the player
     * @param randomActions actions selected by the VRF 0->Rock, 1-> Paper, 2->Scissors
     * @param payouts individual payouts for each bet
     * @param numGames number of games performed
     */
    event RockPaperScissors_Outcome_Event(
        address playerAddress,
        uint256 wager,
        uint32 numBets,
        uint256 payout,
        uint8[] randomActions,
        uint256[] payouts,
        uint32 numGames,
        uint256 requestId
    );

    /**
     * @dev event emitted when a refund is done in RPS
     * @param player address of the player reciving the refund
     * @param wager amount of wager that was refunded
     * @param tokenAddress address of token the refund was made in
     */
    event RockPaperScissors_Refund_Event(
        address indexed player,
        uint256 wager,
        address tokenAddress
    );

    error AwaitingVRF(uint256 requestID);
    error InvalidAction();
    error InvalidNumBets(uint256 maxNumBets);
    error WagerAboveLimit(uint256 wager, uint256 maxWager);
    error NotAwaitingVRF();
    error BlockNumberTooLow(uint256 have, uint256 want);

    /**
     * @dev function to get current request player is await from VRF, returns 0 if none
     * @param player address of the player to get the state
     */
    function RockPaperScissors_GetState(
        address player
    ) external view returns (RockPaperScissorsGame memory) {
        return (rockPaperScissorsGames[player]);
    }

    /**
     * @dev Function to play rock paper scissors, takes the user wager saves bet parameters and makes a request to the VRF
     * @param wager wager amount
     * @param tokenAddress address of token to bet, 0 address is considered the native coin
     * @param numBets number of bets to make, and amount of random numbers to request
     * @param stopGain treshold value at which the bets stop if a certain profit is obtained
     * @param stopLoss treshold value at which the bets stop if a certain loss is obtained
     * @param action action selected by the player 0->Rock, 1-> Paper, 2->Scissors
     */
    function RockPaperScissors_Play(
        uint256 wager,
        address tokenAddress,
        uint8 action,
        uint32 numBets,
        uint256 stopGain,
        uint256 stopLoss
    ) external payable nonReentrant {
        address msgSender = msg.sender;
        if (action >= 3) {
            revert InvalidAction();
        }
        if (rockPaperScissorsGames[msgSender].requestID != 0) {
            revert AwaitingVRF(rockPaperScissorsGames[msgSender].requestID);
        }
        if (!(numBets > 0 && numBets <= 100)) {
            revert InvalidNumBets(100);
        }

        _kellyWager(wager, tokenAddress);
        uint256 fee = _transferWager(
            tokenAddress,
            wager * numBets,
            1100000,
            msgSender
        );
        uint256 requestId = _requestRandomWords(numBets);

        rockPaperScissorsGames[msgSender] = RockPaperScissorsGame(
            wager,
            stopGain,
            stopLoss,
            requestId,
            tokenAddress,
            uint64(block.number),
            numBets,
            action
        );
        rockPaperScissorsIDs[requestId] = msgSender;

        emit RockPaperScissors_Play_Event(
            msgSender,
            wager,
            tokenAddress,
            action,
            numBets,
            stopGain,
            stopLoss,
            fee,
            requestId
        );
    }

    /**
     * @dev Function to refund user in case of VRF request failling
     */
    function RockPaperScissors_Refund() external nonReentrant {
        address msgSender = msg.sender;
        RockPaperScissorsGame storage game = rockPaperScissorsGames[msgSender];
        if (game.requestID == 0) {
            revert NotAwaitingVRF();
        }
        if (game.blockNumber + 200 > block.number) {
            revert BlockNumberTooLow(block.number, game.blockNumber + 200);
        }

        uint256 wager = game.wager * game.numBets;
        address tokenAddress = game.tokenAddress;

        delete (rockPaperScissorsIDs[game.requestID]);
        delete (rockPaperScissorsGames[msgSender]);

        if (tokenAddress == address(0)) {
            (bool success, ) = payable(msgSender).call{value: wager}("");
            if (!success) {
                revert TransferFailed();
            }
        } else {
            IERC20(tokenAddress).safeTransfer(msgSender, wager);
        }
        emit RockPaperScissors_Refund_Event(msgSender, wager, tokenAddress);
    }

    /**
     * @dev function called by Chainlink VRF with random numbers
     * @param requestId id provided when the request was made
     * @param randomWords array of random numbers
     */
    function rawFulfillRandomWords(
        uint256 requestId,
        uint256[] memory randomWords
    ) external {
        if (msg.sender != ChainLinkVRF) {
            revert OnlyCoordinatorCanFulfill(msg.sender, ChainLinkVRF);
        }
        fulfillRandomWords(requestId, randomWords);
    }

    function fulfillRandomWords(
        uint256 requestId,
        uint256[] memory randomWords
    ) internal {
        if (rockPaperScissorsIDs[requestId] == address(0)) revert();
        RockPaperScissorsGame storage game = rockPaperScissorsGames[
            rockPaperScissorsIDs[requestId]
        ];

        uint8[] memory randomActions = new uint8[](game.numBets);
        uint8[] memory outcomes = new uint8[](game.numBets);
        uint256[] memory payouts = new uint256[](game.numBets);
        
        GameResult memory rst = GameResult(0, 0, 0);
        // int256 totalValue;
        // uint256 payout;
        // uint32 i;

        address tokenAddress = game.tokenAddress;

        for (rst.numGames = 0; rst.numGames < game.numBets; rst.numGames++) {
            if (rst.totalValue >= int256(game.stopGain)) {
                break;
            }
            if (rst.totalValue <= -int256(game.stopLoss)) {
                break;
            }

            randomActions[rst.numGames] = uint8(randomWords[rst.numGames] % 3);
            outcomes[rst.numGames] = _determineRPSResult(game.action, randomActions[rst.numGames]);

            if (outcomes[rst.numGames] == 2) {
                rst.payout += (game.wager * 99) / 100;
                rst.totalValue -= int256((game.wager) / 100);
                payouts[rst.numGames] = (game.wager * 99) / 100;
                continue;
            }

            if (outcomes[rst.numGames] == 1) {
                rst.payout += (game.wager * 198) / 100;
                rst.totalValue += int256((game.wager * 98) / 100);
                payouts[rst.numGames] = (game.wager * 198) / 100;
                continue;
            }

            rst.totalValue -= int256(game.wager);
        }

        rst.payout += (game.numBets - rst.numGames) * game.wager;

        _transferToBankroll(tokenAddress, game.wager * game.numBets);
        if (rst.payout != 0) {
            _transferPayout(
                rockPaperScissorsIDs[requestId],
                rst.payout,
                tokenAddress
            );
        }
        emit RockPaperScissors_Outcome_Event(
            rockPaperScissorsIDs[requestId],
            game.wager,
            game.numBets,
            rst.payout,
            randomActions,
            payouts,
            rst.numGames,
            requestId
        );
        delete (rockPaperScissorsGames[rockPaperScissorsIDs[requestId]]);
        delete (rockPaperScissorsIDs[requestId]);
    }

    // 0 loss, 1-> win, 2-> draw //0->Rock, 1-> Paper, 2->Scissors
    function _determineRPSResult(
        uint8 playerPick,
        uint8 rngPick
    ) internal pure returns (uint8) {
        if (playerPick == rngPick) {
            return 2;
        }
        if (playerPick == 0) {
            if (rngPick == 1) {
                return 0;
            } else {
                return 1;
            }
        }

        if (playerPick == 1) {
            if (rngPick == 2) {
                return 0;
            } else {
                return 1;
            }
        }

        if (playerPick == 2) {
            if (rngPick == 0) {
                return 0;
            } else {
                return 1;
            }
        }
        // Yin: the code should never reach here!!!!
        return 0;
    }

    /**
     * @dev calculates the maximum wager allowed based on the bankroll size
     */
    function _kellyWager(uint256 wager, address tokenAddress) internal view {
        uint256 balance;
        if (tokenAddress == address(0)) {
            balance = address(vault).balance;
        } else {
            balance = IERC20(tokenAddress).balanceOf(address(vault));
        }
        uint256 maxWager = (balance * 1683629) / 100000000;
        if (wager > maxWager) {
            revert WagerAboveLimit(wager, maxWager);
        }
    }
}
