import { IMT } from "@zk-kit/imt";
import { buildPoseidon } from "circomlibjs";
import { groth16 } from "snarkjs";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const stringifyInputs = (inputs: any) => JSON.parse(JSON.stringify(inputs, (_, v) => typeof v === 'bigint' ? v.toString() : v))

export const generateProof = async (notesTree: IMT, noteIndex: number, secretValue: bigint) => {
    const {
        root: notesRoot,
        pathIndices,
        siblings
    } = notesTree.createProof(noteIndex);
    
    // Compute nullifier
    const poseidon = await buildPoseidon();
    const nullifier = poseidon([BigInt(noteIndex), secretValue]);

    const circuitInputs = {
        notesRoot,
        nullifier,
        noteIndex: BigInt(noteIndex),
        secret: secretValue,
        siblings,
        indices: pathIndices,
    }

    const { proof, publicSignals } = await groth16.fullProve(
        stringifyInputs(circuitInputs), 
        '../../circuits/build/nullifierVerifier_js/nullifierVerifier.wasm', 
        '../../circuits/build/nullifierVerifier_0001.zkey'
    )

    const contractProof = await groth16.exportSolidityCallData(proof, publicSignals);

    return { contractProof, nullifier, notesRoot };
}