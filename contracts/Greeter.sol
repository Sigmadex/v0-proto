pragma solidity 0.8.7;
import 'contracts/uniswap/v2-core/UniswapV2ERC20.sol';
contract Greeter is UniswapV2ERC20 {

    string greeting;

    constructor(string memory _greeting) {
        greeting = _greeting;
    }

    function greet() public view returns (string memory) {
        return greeting;
    }

    function setGreeting(string memory _greeting) public {
        greeting = _greeting;
    }

}
