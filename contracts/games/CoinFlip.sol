// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;

import "./Common.sol";

/**
 * @title Coin Flip game, players predict if outcome will be heads or tails
 */

contract CoinFlip is Common {
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

    struct CoinFlipGame {
        uint256 wager;
        uint256 stopGain;
        uint256 stopLoss;
        uint256 requestID;
        address tokenAddress;
        uint64 blockNumber;
        uint32 numBets;
        bool isHeads;
    }

    mapping(address => CoinFlipGame) coinFlipGames;
    mapping(uint256 => address) coinIDs;

    /**
     * @dev event emitted at the start of the game
     * @param playerAddress address of the player that made the bet
     * @param wager wagered amount
     * @param tokenAddress address of token the wager was made, 0 address is considered the native coin
     * @param isHeads player bet on which side the coin will land  1-> Heads, 0 ->Tails
     * @param numBets number of bets the player intends to make
     * @param stopGain gain value at which the betting stop if a gain is reached
     * @param stopLoss loss value at which the betting stop if a loss is reached
     */
    event CoinFlip_Play_Event(
        address indexed playerAddress,
        uint256 wager,
        address tokenAddress,
        bool isHeads,
        uint32 numBets,
        uint256 stopGain,
        uint256 stopLoss,
        uint256 VRFFee,
        uint256 indexed requestId
    );
    /**
     * @dev event emitted by the VRF callback with the bet results
     * @param payout total payout transfered to the player
     * @param coinOutcomes results of coinFlip, 1-> Heads, 0 ->Tails
     * @param payouts individual payouts for each bet
     * @param numGames number of games performed
     */
    event CoinFlip_Outcome_Event(
        address playerAddress,
        uint256 wager,
        uint32 numBets,
        uint256 payout,
        uint8[] coinOutcomes,
        uint256[] payouts,
        uint32 numGames,
        uint256 indexed requestId
    );

    /**
     * @dev event emitted when a refund is done in coin flip
     * @param player address of the player reciving the refund
     * @param wager amount of wager that was refunded
     * @param tokenAddress address of token the refund was made in
     */
    event CoinFlip_Refund_Event(
        address indexed player,
        uint256 wager,
        address tokenAddress
    );

    error WagerAboveLimit(uint256 wager, uint256 maxWager);
    error AwaitingVRF(uint256 requestID);
    error InvalidNumBets(uint256 maxNumBets);
    error NotAwaitingVRF();
    error BlockNumberTooLow(uint256 have, uint256 want);

    /**
     * @dev function to get current request player is await from VRF, returns 0 if none
     * @param player address of the player to get the state
     */
    function CoinFlip_GetState(
        address player
    ) external view returns (CoinFlipGame memory) {
        return (coinFlipGames[player]);
    }

    /**
     * @dev Function to play Coin Flip, takes the user wager saves bet parameters and makes a request to the VRF
     * @param wager wager amount
     * @param tokenAddress address of token to bet, 0 address is considered the native coin
     * @param numBets number of bets to make, and amount of random numbers to request
     * @param stopGain treshold value at which the bets stop if a certain profit is obtained
     * @param stopLoss treshold value at which the bets stop if a certain loss is obtained
     * @param isHeads if bet selected heads or Tails
     */
    function CoinFlip_Play(
        uint256 wager,
        address tokenAddress,
        bool isHeads,
        uint32 numBets,
        uint256 stopGain,
        uint256 stopLoss
    ) external payable nonReentrant {
        address msgSender = msg.sender;
        require(
            coinFlipGames[msgSender].requestID == 0,
            "multiple submissions"
        );
        require((numBets > 0 && numBets <= 100), "invalid num of bets");

        _kellyWager(wager, tokenAddress);
        uint256 fee = _transferWager(
            tokenAddress,
            wager * numBets,
            1000000,
            msgSender
        );

        uint256 requestId = _requestRandomWords(numBets);

        coinFlipGames[msgSender] = CoinFlipGame(
            wager,
            stopGain,
            stopLoss,
            requestId,
            tokenAddress,
            uint64(block.number),
            numBets,
            isHeads
        );
        coinIDs[requestId] = msgSender;

        emit CoinFlip_Play_Event(
            msgSender,
            wager,
            tokenAddress,
            isHeads,
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
    function CoinFlip_Refund() external nonReentrant {
        address msgSender = msg.sender;
        CoinFlipGame storage game = coinFlipGames[msgSender];
        if (game.requestID == 0) {
            revert NotAwaitingVRF();
        }
        if (game.blockNumber + 200 > block.number) {
            revert BlockNumberTooLow(block.number, game.blockNumber + 200);
        }

        uint256 wager = game.wager * game.numBets;
        address tokenAddress = game.tokenAddress;

        delete (coinIDs[game.requestID]);
        delete (coinFlipGames[msgSender]);

        if (tokenAddress == address(0)) {
            (bool success, ) = payable(msgSender).call{value: wager}("");
            if (!success) {
                revert TransferFailed();
            }
        } else {
            IERC20(tokenAddress).safeTransfer(msgSender, wager);
        }
        emit CoinFlip_Refund_Event(msgSender, wager, tokenAddress);
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
        address playerAddress = coinIDs[requestId];
        if (playerAddress == address(0)) revert();
        CoinFlipGame storage game = coinFlipGames[playerAddress];

        int256 totalValue;
        uint256 payout;
        uint32 i;
        uint8[] memory coinFlip = new uint8[](game.numBets);
        uint256[] memory payouts = new uint256[](game.numBets);

        address tokenAddress = game.tokenAddress;

        for (i = 0; i < game.numBets; i++) {
            if (totalValue >= int256(game.stopGain)) {
                break;
            }
            if (totalValue <= -int256(game.stopLoss)) {
                break;
            }

            coinFlip[i] = uint8(randomWords[i] % 2);

            if (coinFlip[i] == 1 && game.isHeads == true) {
                totalValue += int256((game.wager * 9800) / 10000);
                payout += (game.wager * 19800) / 10000;
                payouts[i] = (game.wager * 19800) / 10000;
                continue;
            }
            if (coinFlip[i] == 0 && game.isHeads == false) {
                totalValue += int256((game.wager * 9800) / 10000);
                payout += (game.wager * 19800) / 10000;
                payouts[i] = (game.wager * 19800) / 10000;
                continue;
            }

            totalValue -= int256(game.wager);
        }

        payout += (game.numBets - i) * game.wager;

        emit CoinFlip_Outcome_Event(
            playerAddress,
            game.wager,
            game.numBets,
            payout,
            coinFlip,
            payouts,
            i,
            requestId
        );
        _transferToBankroll(tokenAddress, game.wager * game.numBets);
        delete (coinIDs[requestId]);
        delete (coinFlipGames[playerAddress]);
        if (payout != 0) {
            _transferPayout(playerAddress, payout, tokenAddress);
        }
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
        uint256 maxWager = (balance * 1122448) / 100000000;
        if (wager > maxWager) {
            revert WagerAboveLimit(wager, maxWager);
        }
    }
}
