pragma solidity 0.8.7;


interface IACL {
  function onlyACL() external;
  function pantry() external returns (address);
  function kitchen() external returns (address);
  function masterChef() external returns (address);
  function selfCakeChef() external returns (address);
  function autoCakeChef()  external returns (address);
}
