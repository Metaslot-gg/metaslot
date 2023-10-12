// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import {SafeERC20, IERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";


contract Vault is Ownable {
  using SafeERC20 for IERC20;

  event FundAdded(uint256 value, uint256 newFund, address tokenAddress);
  event FundRemoved(uint256 value, uint256 newFund, address tokenAddress);
  event ProfitClaimed(address to, uint256 value, address tokenAddress);
  event VaultDestructed(address to, uint256 value);
  event GameAdded(address gameContract);
  event GameRemoved(address gameContract);

  uint256 public fund;
  mapping(address => bool) _supportGames;
  mapping(address => uint256) _tokenFunds;
  mapping(address=>bool) blacklist;
  address payable public operator;
  address payable public developer;

  constructor(address payable _operator, address payable _developer) {
    operator = _operator;
    developer = _developer;
  }

  function setOperator(address payable _operator) public onlyOwner {
    operator = _operator;
  }

  function setDeveloper(address payable _developer) public onlyOwner {
    developer = _developer;
  }

  function addFund(address tokenAddress, uint64 amount) external payable onlyOwner {
    if (tokenAddress == address(0)) {
      fund = fund + msg.value;
      emit FundAdded(msg.value, fund, tokenAddress);
    } else {
      IERC20(tokenAddress).safeTransferFrom(msg.sender, address(this), amount);
      _tokenFunds[tokenAddress] = _tokenFunds[tokenAddress] + amount;
      emit FundAdded(amount, _tokenFunds[tokenAddress], tokenAddress);
    }
  }

  function removeFund(address tokenAddress, uint256 amount) external onlyOwner {
      if (tokenAddress == address(0)) {
        require(fund > amount, "insufficient fund for remove");
        fund = fund - amount;
        payable(msg.sender).transfer(amount);
        emit FundRemoved(amount, fund, tokenAddress);
      } else {
        require(_tokenFunds[tokenAddress] > amount, "insufficient fund for remove");
        IERC20(tokenAddress).safeTransfer(msg.sender, amount);
        _tokenFunds[tokenAddress] = _tokenFunds[tokenAddress] - amount;
        emit FundRemoved(amount, _tokenFunds[tokenAddress], tokenAddress);
      }
  }

  receive() external payable {}

  fallback() external payable {}

  /**
   * Sends payout to player address.
   *
   * @param _to player address
   * @param _amount amount payout for the player address
   * @param tokenAddress token address of ERC-20 token or native token
   */
  function sendWinner(address payable _to, uint256 _amount, address tokenAddress) public {
    require(_supportGames[msg.sender], "unsupported game");
    if (tokenAddress == address(0)) {
      require(address(this).balance >= _amount, "insufficient fund");
      _to.transfer(_amount);
    } else {
      uint256 balance = IERC20(tokenAddress).balanceOf(address(this));
      require(balance >= _amount, "insuffecient amount for ERC-20 token");
      IERC20(tokenAddress).safeTransfer(_to, _amount);
    }
  }

  function addGame(address game) public onlyOwner {
    _supportGames[game] = true;
    emit GameAdded(game);
  }

  function removeGame(address game) public onlyOwner {
    require(_supportGames[game]);
    delete _supportGames[game];
    emit GameRemoved(game);
  }


  /**
   * Claims profit for developer and operator
   * Notice: the fund acmounts of different tokens are not profit,
   * the profit = current_token_balance - accumulated token fund
   * It is possible that there is no profit, since fund amount is less than the fund.
   * It means the contract is doing charity at this moment.
   *
   * @param tokenAddress token address for cliam
   */
  function claim(address tokenAddress) public onlyOwner {
    if (tokenAddress == address(0)) {
      require(address(this).balance > fund, "insufficient native amount for claim.");
      uint256 profit = address(this).balance - fund;
      uint256 devShare = profit * 33 / 100;
      uint256 opShare = profit * 67 / 100;
      developer.transfer(devShare);
      operator.transfer(opShare);
      emit ProfitClaimed(developer, devShare, tokenAddress);
      emit ProfitClaimed(operator, opShare, tokenAddress);
    } else {
      uint256 balance = IERC20(tokenAddress).balanceOf(address(this));
      uint256 tokenFund = _tokenFunds[tokenAddress];
      require(balance - tokenFund > 4, "insufficient native amount for claim.");
      uint256 profit = balance - tokenFund;
      uint256 devShare = profit * 33 / 100;
      uint256 opShare = profit * 67 / 100;
      IERC20(tokenAddress).safeTransfer(developer, devShare);
      IERC20(tokenAddress).safeTransfer(operator, opShare);
      emit ProfitClaimed(developer, devShare, tokenAddress);
      emit ProfitClaimed(operator, opShare, tokenAddress);
    }

  }

  function destruct(address payable receiver) public onlyOwner {
    emit VaultDestructed(receiver, address(this).balance);
  }

  function blackList(address _user) public onlyOwner {
      require(!blacklist[_user], "user already blacklisted");
      blacklist[_user] = true;
      // emit events as well
  }

  function removeFromBlacklist(address _user) public onlyOwner {
      require(blacklist[_user], "user already whitelisted");
      blacklist[_user] = false;
      // emit events as well
  }

  function hasBlacklist(address _user) public view returns(bool){
    return blacklist[_user];
  }
}