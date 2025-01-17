// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const MixerModule = buildModule("MixerModule", (m) => {
  
  const mixer = m.contract("Mixer");

  return { mixer };
});

export default MixerModule;
