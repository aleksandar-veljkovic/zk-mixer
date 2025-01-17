import { JsonRpcSigner, parseEther } from "ethers";
import { Contract } from "ethers";
import { BrowserProvider } from "ethers";
import { ethers } from "ethers";
import mixerJson from "../../artifacts/contracts/Mixer.sol/Mixer.json";
import { EventLog } from "ethers";

export class BlockchainService {
    contractAddress: string;
    provider: BrowserProvider;
    signer: JsonRpcSigner | null;
    Mixer: Contract | null;
    isConnected: boolean;

    constructor(contractAddress: string) {
        this.contractAddress = contractAddress;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        this.provider = new ethers.BrowserProvider((window as any).ethereum);
        this.signer = null;
        this.Mixer = null;
        this.isConnected = false;
    }

    async connect() {
        this.signer = await this.provider.getSigner();
        this.isConnected = true;

        this.Mixer = new Contract(
            this.contractAddress,
            mixerJson.abi,
            this.signer
          );
    }

    async getWalletAddress() {
        return this.signer!.address;
    }

    async deposit(secretValueHash: bigint) {
        const tx = await this.Mixer!.deposit(secretValueHash, {value: parseEther("0.5")});
        const receipt = await tx.wait();
        console.log(receipt);
    }

    async withdraw(pA: bigint[], pB: bigint[][], pC: bigint[][], nullifiersecretValueHash: bigint) {
        const tx = await this.Mixer!.withdraw(pA, pB, pC, nullifiersecretValueHash, {value: parseEther("0.5")});
        const receipt = await tx.wait();
        console.log(receipt);
    }

    async getDeposits() {
        const currentBlockNumber = await this.provider.getBlockNumber();

        const depositEventFilter = this.Mixer!.filters.Deposit();
        const deposits = await this.Mixer!.queryFilter(depositEventFilter, 0, currentBlockNumber);

        const noteLeaves : bigint[][] = [];

        deposits.forEach(event => {
            const [index, secretValueHash] = (event as EventLog).args;
            noteLeaves.push([index, secretValueHash]);
        });

        return noteLeaves;
    }
}