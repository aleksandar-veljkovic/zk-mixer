pragma solidity ^0.8.4;

import {LeanIMT, LeanIMTData} from "./LeanIMT.sol";
import {PoseidonT3} from "poseidon-solidity/PoseidonT3.sol";
import {Groth16Verifier} from "./Verifier.sol";

contract Mixer {
    event Deposit(uint256 noteIndex, uint256 secretValueHash);
    error InvalidProof();

    modifier fixedSumOnly {
        require(msg.value == 0.5 ether, "Invalid amount");
        _;
    }

    LeanIMTData notes;
    mapping (uint256 => bool) nullifiers;
    uint256 noteIndex;
    Groth16Verifier verifier;

    constructor() {
        noteIndex = 0;
        verifier = new Groth16Verifier();
    }

    function deposit(uint256 secretValueHash) public payable fixedSumOnly {
        uint256 noteHash = PoseidonT3.hash([noteIndex, secretValueHash]);
        LeanIMT.insert(notes, noteHash);

        emit Deposit(noteIndex, secretValueHash);
        noteIndex += 1;
    }

    function withdraw(uint[2] calldata _pA, uint[2][2] calldata _pB, uint[2] calldata _pC, uint256 nullifier) public {
        bool isValid = verifier.verifyProof(_pA, _pB, _pC, [getNotesRoot(), nullifier]);

        if (!isValid) {
            revert InvalidProof();
        }

        msg.sender.call{value: 0.5 ether}("");
    }

    function getNotesRoot() public view returns (uint256) {
        return LeanIMT.root(notes);
    }
}