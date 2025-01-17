import { randomBytes } from 'ethers';
import toHex from 'uint8-to-hex';

export const generateSecretValue = () => {
    return BigInt('0x' + toHex(randomBytes(30)));
}

console.log(generateSecretValue());