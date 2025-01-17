pragma circom 2.0.0;

include "../node_modules/circomlib/circuits/poseidon.circom";
include "../node_modules/circomlib/circuits/mux1.circom";

template MerkleTreeInclusionProof(nLevels) {
    signal input leaf;
    signal input pathIndices[nLevels];
    signal input siblings[nLevels];

    signal output root;

    component poseidons[nLevels];
    component mux[nLevels];

    signal hashes[nLevels + 1];
    hashes[0] <== leaf;

    for (var i = 0; i < nLevels; i++) {
        pathIndices[i] * (1 - pathIndices[i]) === 0;

        poseidons[i] = Poseidon(2);
        mux[i] = MultiMux1(2);

        mux[i].c[0][0] <== hashes[i];
        mux[i].c[0][1] <== siblings[i];

        mux[i].c[1][0] <== siblings[i];
        mux[i].c[1][1] <== hashes[i];

        mux[i].s <== pathIndices[i];

        poseidons[i].inputs[0] <== mux[i].out[0];
        poseidons[i].inputs[1] <== mux[i].out[1];

        hashes[i + 1] <== poseidons[i].out;
    }

    root <== hashes[nLevels];
}

template NullifierVerifier(treeDepth) {
    // Public inputs
    signal input notesRoot;
    signal input nullifier;

    // Private inputs
    signal input noteIndex;
    signal input secret;
    signal input siblings[treeDepth];
    signal input indices[treeDepth];

    // Compute secret hash
    component secretHasher = Poseidon(1);
    secretHasher.inputs[0] <== secret;

    // Compute note hash
    component noteHasher = Poseidon(2);
    noteHasher.inputs[0] <== noteIndex;
    noteHasher.inputs[1] <== secretHasher.out;

    // Compute note root hash
    component inclusionProof = MerkleTreeInclusionProof(treeDepth);
    inclusionProof.leaf <== noteHasher.out;

    for (var i = 0; i < treeDepth; i++) {
        inclusionProof.pathIndices[i] <== indices[i];
        inclusionProof.siblings[i] <== siblings[i];
    }

    // Compute nullifier
    component nullifierHasher = Poseidon(2);
    nullifierHasher.inputs[0] <== noteIndex;
    nullifierHasher.inputs[1] <== secret;

    // Verify nullifier and notes root
    nullifier === nullifierHasher.out;
    notesRoot === inclusionProof.root;
}

component main { public [notesRoot, nullifier]} = NullifierVerifier(10);