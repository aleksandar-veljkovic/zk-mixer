import { useRef, useState } from "react";
import { BlockchainService } from "./services/blockchain"
import { generateSecretValue } from "./services/utils";

const blockchainService = new BlockchainService("0xcFda208EB8f8f6427EC87e96098a6F179BF45394");

function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string>('');

  const noteIdRef = useRef<HTMLInputElement>(null);
  const secretRef = useRef<HTMLInputElement>(null);

  const depositFunds = async () => {
    const secret = generateSecretValue();
    console.log(secret);
  }

  const withdrawFunds = async () => {
    const noteId = noteIdRef.current!.value;
    const secret = secretRef.current!.value;

    if (noteId == null || noteId.trim().length === 0) {
      alert('Missing or invalid note ID');
      return;
    }

    if (secret == null || secret.trim().length === 0) {
      alert('Missing or invalid secret');
      return;
    }

    console.log(secret, noteId);
  }

  const connectWallet = async () => {
    setIsLoading(true);
    try {
      await blockchainService.connect()
      setWalletAddress(await blockchainService.getWalletAddress());
      setIsConnected(true);
    } catch (err) {
      console.log(err);
    } finally {
      setIsLoading(false);
    }
  }

  if (isLoading) {
    return 'Loading...';
  }

  if (!isConnected) {
    return (
      <button onClick={() => connectWallet()}>Connect wallet</button>
    )
  }

  return (
    <>
      Hello! {walletAddress}
      <div>
      <button onClick={() => depositFunds()}>Deposit</button>
      </div>
      
      <div>
        <input ref={noteIdRef} placeholder="Note Index" type="number"/>      
        <input ref={secretRef} placeholder="Secret" type="password"/>
        <button onClick={() => withdrawFunds()}>Withdraw</button>
      </div>
    </>
  )
}

export default App
