import { IMT } from '@zk-kit/imt';
import { buildPoseidon } from 'circomlibjs';
import { randomBytes } from 'ethers';
import toHex from 'uint8-to-hex';

export const createMerkleTree = async (leaves: bigint[], maxDepth: number = 10) => {
    const poseidon = await buildPoseidon();

    const poseidonHash = (inputs: bigint[]) => poseidon.F.toObject(poseidon(inputs));
    const leavesBigInt = leaves.map(l => BigInt(l));
    const imt = new IMT(poseidonHash, maxDepth, BigInt(0), 2, leavesBigInt);
    return imt;
}

export const generateSecretValue = () => {
    return BigInt('0x' + toHex(randomBytes(30)));
}