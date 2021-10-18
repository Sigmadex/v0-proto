pragma solidity 0.8.9;

import 'contracts/pancake/pancake-lib/token/BEP20/IBEP20.sol';

interface IMigratorChef {
	// Perform LP token migration from legacy PancakeSwap to CakeSwap.
	// Take the current LP token address and return the new LP token address.
	// Migrator should have full access to the caller's LP token.
	// Return the new LP token address.
	//
	// XXX Migrator must have allowance access to PancakeSwap LP tokens.
	// CakeSwap must mint EXACTLY the same amount of CakeSwap LP tokens or
	// else something bad will happen. Traditional PancakeSwap does not
	// do that so be careful!
	function migrate(IBEP20 token) external returns (IBEP20);
}
