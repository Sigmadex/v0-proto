pragma solidity 0.8.9;

interface INFTRewards {
  function mintReward(address _to, address _token, uint256 _rewardAmount) external;
}
