// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;

import "./Common.sol";

import "hardhat/console.sol";

/**
 * @title Dice game, players predict if outcome will be over or under the selected number
 */

contract Dice is Common {
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

    struct DiceGame {
        uint256 wager;
        uint256 stopGain;
        uint256 stopLoss;
        uint256 requestID;
        address tokenAddress;
        uint64 blockNumber;
        uint32 numBets;
        uint32 multiplier;
        bool isOver;
    }

    mapping(address => DiceGame) diceGames;
    mapping(uint256 => address) diceIDs;

    /**
     * @dev event emitted at the start of the game
     * @param playerAddress address of the player that made the bet
     * @param wager wagered amount
     * @param multiplier selected multiplier for the wager range 10421-9900000, multiplier values divide by 10000
     * @param tokenAddress address of token the wager was made, 0 address is considered the native coin
     * @param isOver if true dice outcome must be over the selected number, false must be under
     * @param numBets number of bets the player intends to make
     * @param stopGain gain value at which the betting stop if a gain is reached
     * @param stopLoss loss value at which the betting stop if a loss is reached
     */
    event Dice_Play_Event(
        address indexed playerAddress,
        uint256 wager,
        uint32 multiplier,
        address tokenAddress,
        bool isOver,
        uint32 numBets,
        uint256 stopGain,
        uint256 stopLoss,
        uint256 VRFFee,
        uint256 indexed requestId
    );

    /**
     * @dev event emitted by the VRF callback with the bet results
     * @param diceOutcomes dice out come array
     * @param payouts pay out array
     * @param payout total payout transfered to the player
     * @param numGames number of games performed
     */
    event Dice_Outcome_Event(
        address indexed playerAddress,
        uint256 wager,
        uint32 numBets,
        uint256 payout,
        uint256[] diceOutcomes,
        uint256[] payouts,
        uint32 numGames,
        uint256 indexed requestId
    );

    /**
     * @dev event emitted when a refund is done in dice
     * @param player address of the player reciving the refund
     * @param wager amount of wager that was refunded
     * @param tokenAddress address of token the refund was made in
     */
    event Dice_Refund_Event(
        address indexed player,
        uint256 wager,
        address tokenAddress
    );

    error AwaitingVRF(uint256 requestID);
    error InvalidMultiplier(uint256 max, uint256 min, uint256 multiplier);
    error InvalidNumBets(uint256 maxNumBets);
    error WagerAboveLimit(uint256 wager, uint256 maxWager);
    error NotAwaitingVRF();
    error BlockNumberTooLow(uint256 have, uint256 want);

    /**
     * @dev function to get current request player is await from VRF, returns 0 if none
     * @param player address of the player to get the state
     */
    function Dice_GetState(
        address player
    ) external view returns (DiceGame memory) {
        return (diceGames[player]);
    }

    /**
     * @dev Function to play Dice, takes the user wager saves bet parameters and makes a request to the VRF
     * @param wager wager amount
     * @param tokenAddress address of token to bet, 0 address is considered the native coin
     * @param numBets number of bets to make, and amount of random numbers to request
     * @param stopGain treshold value at which the bets stop if a certain profit is obtained
     * @param stopLoss treshold value at which the bets stop if a certain loss is obtained
     * @param isOver if true dice outcome must be over the selected number, false must be under
     * @param multiplier selected multiplier for the wager range 10421-9900000, multiplier values divide by 10000
     */
    function Dice_Play(
        uint256 wager,
        uint32 multiplier,
        address tokenAddress,
        bool isOver,
        uint32 numBets,
        uint256 stopGain,
        uint256 stopLoss
    ) external payable nonReentrant {
        address msgSender = msg.sender;
        require(
            (multiplier >= 10421 && multiplier <= 9900000),
            "invalid multiplier"
        );
        require(diceGames[msgSender].requestID == 0, "multiple submissions");
        require((numBets > 0 && numBets <= 100), "invalid num of bets");

        _kellyWager(wager, tokenAddress, multiplier);
        uint256 fee = _transferWager(
            tokenAddress,
            wager * numBets,
            1000000,
            msgSender
        );

        uint256 requestId = _requestRandomWords(numBets);
        diceGames[msgSender] = DiceGame(
            wager,
            stopGain,
            stopLoss,
            requestId,
            tokenAddress,
            uint64(block.number),
            numBets,
            multiplier,
            isOver
        );
        diceIDs[requestId] = msgSender;

        emit Dice_Play_Event(
            msgSender,
            wager,
            multiplier,
            tokenAddress,
            isOver,
            numBets,
            stopGain,
            stopLoss,
            fee,
            requestId
        );
    }

    function setValut(address payable _v) external {
        vault = _v;
    }

    /**
     * @dev Function to refund user in case of VRF request failling
     */
    function Dice_Refund() external nonReentrant {
        address msgSender = msg.sender;
        DiceGame storage game = diceGames[msgSender];
        require(game.requestID != 0, "bet not found");
        require(game.blockNumber + 200 <= block.number, "block number too low");

        uint256 wager = game.wager * game.numBets;
        address tokenAddress = game.tokenAddress;

        delete (diceIDs[game.requestID]);
        delete (diceGames[msgSender]);

        if (tokenAddress == address(0)) {
            (bool success, ) = payable(msgSender).call{value: wager}("");
            if (!success) {
                revert TransferFailed();
            }
        } else {
            IERC20(tokenAddress).safeTransfer(msgSender, wager);
        }
        emit Dice_Refund_Event(msgSender, wager, tokenAddress);
    }

    function rawFulfillRandomWords(
        uint256 requestId,
        uint256[] memory randomWords
    ) external {
        require(msg.sender == ChainLinkVRF, "invalid callee for callback");
        if (msg.sender != ChainLinkVRF) {
            revert OnlyCoordinatorCanFulfill(msg.sender, ChainLinkVRF);
        }
        fulfillRandomWords(requestId, randomWords);
    }

    function fulfillRandomWords(
        uint256 requestId,
        uint256[] memory randomWords
    ) internal {
        if (diceIDs[requestId] == address(0)) revert();
        DiceGame storage game = diceGames[diceIDs[requestId]];

        int256 totalValue;
        uint256 payout;
        uint32 i;
        uint256[] memory diceOutcomes = new uint256[](game.numBets);
        uint256[] memory payouts = new uint256[](game.numBets);

        uint256 winChance = 99000000000 / game.multiplier;
        uint256 numberToRollOver = 10000000 - winChance;
        uint256 gamePayout = (game.multiplier * game.wager) / 10000;

        for (i = 0; i < game.numBets; i++) {
            if (totalValue >= int256(game.stopGain)) {
                break;
            }
            if (totalValue <= -int256(game.stopLoss)) {
                break;
            }
            diceOutcomes[i] = randomWords[i] % 10000000;
            if (diceOutcomes[i] >= numberToRollOver && game.isOver == true) {
                totalValue += int256(gamePayout - game.wager);
                payout += gamePayout;
                payouts[i] = gamePayout;
                continue;
            }

            if (diceOutcomes[i] <= winChance && game.isOver == false) {
                totalValue += int256(gamePayout - game.wager);
                payout += gamePayout;
                payouts[i] = gamePayout;
                continue;
            }

            totalValue -= int256(game.wager);
        }

        payout += (game.numBets - i) * game.wager;
        _transferToBankroll(game.tokenAddress, game.wager * game.numBets);
        if (payout != 0) {
            _transferPayout(diceIDs[requestId], payout, game.tokenAddress);
        }
        emit Dice_Outcome_Event(
            diceIDs[requestId],
            game.wager,
            game.numBets,
            payout,
            diceOutcomes,
            payouts,
            i,
            requestId
        );
        delete (diceGames[diceIDs[requestId]]);
        delete (diceIDs[requestId]);
    }

    /**
     * @dev calculates the maximum wager allowed based on the bankroll size
     */
    function _kellyWager(
        uint256 wager,
        address tokenAddress,
        uint256 multiplier
    ) internal view {
        uint256 balance;
        if (tokenAddress == address(0)) {
            // balance = address(Bankroll).balance;
            balance = vault.balance;
        } else {
            // balance = IERC20(tokenAddress).balanceOf(address(Bankroll));
            balance = IERC20(tokenAddress).balanceOf(vault);
        }
        uint256 maxWager = (balance * (11000 - 10890)) / (multiplier - 10000);
        require(wager <= maxWager, "wager exeed max wager");
    }
}
