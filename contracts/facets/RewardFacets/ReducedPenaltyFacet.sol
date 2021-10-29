pragma solidity 0.8.9;

import { AppStorage, LibAppStorage, Modifiers, RPAmount } from '../../libraries/LibAppStorage.sol';
import '../../interfaces/IERC1155.sol';
import '@openzeppelin/contracts/token/ERC1155/IERC1155Receiver.sol';
import '@openzeppelin/contracts/token/ERC20/IERC20.sol';

import '@openzeppelin/contracts/utils/Context.sol';
import '@openzeppelin/contracts/utils/Address.sol';
import '../../interfaces/ISdexReward.sol';


contract ReducedPenaltyFacet is IERC1155, /*ISdexReward,*/ Context, Modifiers {
  using Address for address;

  constructor() {
    AppStorage storage s = LibAppStorage.diamondStorage();
    s.rPNextId = 1;
    s.rPUri = 'https://api.sigmadex.org/nft/{id}';
  }

  function balanceOf(address account, uint256 id) public view returns (uint256) {
    require(account != address(0), "ERC1155: balance query for the zero address");
    AppStorage storage s = LibAppStorage.diamondStorage();
    return s.rPBalances[id][account];

  }

  function balanceOfBatch(address[] calldata accounts, uint256[] calldata ids)
  public
  view
  returns (uint256[] memory) {
    require(accounts.length == ids.length, "ERC1155: accounts and ids length mismatch");
    AppStorage storage s = LibAppStorage.diamondStorage();
    uint256[] memory batchBalances = new uint256[](accounts.length);
    for (uint256 i = 0; i < accounts.length; ++i) {
      batchBalances[i] = balanceOf(accounts[i], ids[i]);
    }
    return batchBalances;
  }

  function setApprovalForAll(address operator, bool approved) public {
    require(_msgSender() != operator, "ERC1155: setting approval status for self");
    AppStorage storage s = LibAppStorage.diamondStorage();

    s.rPOperatorApprovals[_msgSender()][operator] = approved;
    emit ApprovalForAll(_msgSender(), operator, approved);
  }

  function isApprovedForAll(address account, address operator) public view returns (bool) {
    AppStorage storage s = LibAppStorage.diamondStorage();
    return s.rPOperatorApprovals[account][operator];
  }

  function safeTransferFrom(
    address from,
    address to,
    uint256 id,
    uint256 amount,
    bytes calldata data
  ) public {
    require(
      from == _msgSender() || isApprovedForAll(from, _msgSender()),
      "ERC1155: caller is not owner nor approved"
    );
    _safeTransferFrom(from, to, id, amount, data);
  }

  function safeBatchTransferFrom(
    address from,
    address to,
    uint256[] calldata ids,
    uint256[] calldata amounts,
    bytes calldata data
  ) public {
    require(
      from == _msgSender() || isApprovedForAll(from, _msgSender()),
      "ERC1155: transfer caller is not owner nor approved"
    );
    _safeBatchTransferFrom(from, to, ids, amounts, data);
  }

  function _safeTransferFrom(
    address from,
    address to,
    uint256 id,
    uint256 amount,
    bytes memory data
  ) internal {
    require(to != address(0), "ERC1155: transfer to the zero address");

    AppStorage storage s = LibAppStorage.diamondStorage();
    address operator = _msgSender();

    uint256 fromBalance = s.rPBalances[id][from];
    require(fromBalance >= amount, "ERC1155: insufficient balance for transfer");
    unchecked {
      s.rPBalances[id][from] = fromBalance - amount;
    }
    s.rPBalances[id][to] += amount;

    emit TransferSingle(operator, from, to, id, amount);

    _doSafeTransferAcceptanceCheck(operator, from, to, id, amount, data);
  }

  function _safeBatchTransferFrom(
    address from,
    address to,
    uint256[] memory ids,
    uint256[] memory amounts,
    bytes memory data
  ) internal virtual {
    require(ids.length == amounts.length, "ERC1155: ids and amounts length mismatch");
    require(to != address(0), "ERC1155: transfer to the zero address");

    AppStorage storage s = LibAppStorage.diamondStorage();
    address operator = _msgSender();

    for (uint256 i = 0; i < ids.length; ++i) {
      uint256 id = ids[i];
      uint256 amount = amounts[i];

      uint256 fromBalance = s.rPBalances[id][from];
      require(fromBalance >= amount, "ERC1155: insufficient balance for transfer");
      unchecked {
        s.rPBalances[id][from] = fromBalance - amount;
      }
      s.rPBalances[id][to] += amount;
    }

    emit TransferBatch(operator, from, to, ids, amounts);

    _doSafeBatchTransferAcceptanceCheck(operator, from, to, ids, amounts, data);
  }

  function _doSafeTransferAcceptanceCheck(
    address operator,
    address from,
    address to,
    uint256 id,
    uint256 amount,
    bytes memory data
  ) private {
    if (to.isContract()) {
      try IERC1155Receiver(to).onERC1155Received(operator, from, id, amount, data) returns (bytes4 response) {
        if (response != IERC1155Receiver.onERC1155Received.selector) {
          revert("ERC1155: ERC1155Receiver rejected tokens");
        }
      } catch Error(string memory reason) {
        revert(reason);
      } catch {
        revert("ERC1155: transfer to non ERC1155Receiver implementer");
      }
    }
  }
  function _doSafeBatchTransferAcceptanceCheck(
    address operator,
    address from,
    address to,
    uint256[] memory ids,
    uint256[] memory amounts,
    bytes memory data
  ) private {
    if (to.isContract()) {
      try IERC1155Receiver(to).onERC1155BatchReceived(operator, from, ids, amounts, data) returns (
        bytes4 response
      ) {
        if (response != IERC1155Receiver.onERC1155BatchReceived.selector) {
          revert("ERC1155: ERC1155Receiver rejected tokens");
        }
      } catch Error(string memory reason) {
        revert(reason);
      } catch {
        revert("ERC1155: transfer to non ERC1155Receiver implementer");
      }
    }
  }

  function _mint(
    address account,
    uint256 id,
    uint256 amount,
    bytes memory data
  ) internal  {
    require(account != address(0), "ERC1155: mint to the zero address");
    AppStorage storage s = LibAppStorage.diamondStorage();
    address operator = _msgSender();

    s.rPBalances[id][account] += amount;
    emit TransferSingle(operator, address(0), account, id, amount);

    _doSafeTransferAcceptanceCheck(operator, address(0), account, id, amount, data);
  }

  function rewardNFT(
    address to,
    address token,
    uint256 amount
  ) external onlyOwner {
    AppStorage storage s = LibAppStorage.diamondStorage();
    RPAmount memory reductionAmount = RPAmount({
      token: token,
      amount: amount
    });
    s.rPAmounts[s.rPNextId] = reductionAmount;
    bytes memory data = 'data';
    _mint(to, s.rPNextId, 1, data);
    s.rPNextId++;
  }

  function reductionAmount(uint256 id) external returns (RPAmount memory) {
    AppStorage storage s = LibAppStorage.diamondStorage();
    return s.rPAmounts[id];
  }
}

