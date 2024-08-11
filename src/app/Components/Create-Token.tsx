"use client"
import React, { useState } from 'react';
import { createPublicClient, http, createWalletClient, custom, parseEther } from 'viem';
import { baseSepolia } from 'viem/chains';
import contractABI from '../Contract/FactoryABI.json';

const contractAddress = '0x5338B0Fa96fD3C7e76dafbD6F27Ca1EFb06E14fe';

const publicClient = createPublicClient({
  chain: baseSepolia,
  transport: http()
});

const CreateToken: React.FC = () => {
  const [name, setName] = useState('');
  const [symbol, setSymbol] = useState('');
  const [basePrice, setBasePrice] = useState('');
  const [priceIncreasePerToken, setPriceIncreasePerToken] = useState('');
  const [priceIncreasePer100Followers, setPriceIncreasePer100Followers] = useState('');
  const [minBonus, setMinBonus] = useState('');
  const [maxBonus, setMaxBonus] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);

  const handleCreate = async () => {
    if (typeof window.ethereum === 'undefined') {
      console.log("MetaMask is not installed!");
      return;
    }

    setIsLoading(true);
    let walletClient;
    try {
        walletClient = createWalletClient({
            chain: {
              id: 84532, // BTTC Donau testnet chain ID
              rpcUrls: {
                public: "https://base-sepolia.g.alchemy.com/v2/9WBG_MVRsmOhaR5bEVKYclPwb_q9tIiw",
                websocket: "https://base-sepolia.g.alchemy.com/v2/9WBG_MVRsmOhaR5bEVKYclPwb_q9tIiw", // WebSocket URL (optional)
              },
            },
            transport: custom(window ? window.ethereum : ""),
          });

      const [address] = await walletClient.requestAddresses();

      const { request } = await publicClient.simulateContract({
        account: address,
        address: contractAddress,
        abi: contractABI,
        functionName: 'createFarcasterToken',
        args: [
          name,
          symbol,
          parseEther(basePrice),
          parseEther(priceIncreasePerToken),
          parseEther(priceIncreasePer100Followers),
          parseEther(minBonus),
          parseEther(maxBonus),
          "https://pbs.twimg.com/media/F4PQm7tXMAEQW3N?format=jpg&name=medium"
        ],
      });

      const hash = await walletClient.writeContract(request);
      setTxHash(hash);

      console.log('Transaction hash:', hash);

      // Wait for transaction to be mined
      const receipt = await publicClient.waitForTransactionReceipt({ hash });
      console.log('Transaction receipt:', receipt);

      // Reset form
      setName('');
      setSymbol('');
      setBasePrice('');
      setPriceIncreasePerToken('');
      setPriceIncreasePer100Followers('');
      setMinBonus('');
      setMaxBonus('');
    } catch (error) {
      console.error('Error creating token:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Create Social Token</h1>
      <div className="mb-4">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Token Name"
          className="border p-2 w-full"
        />
      </div>
      <div className="mb-4">
        <input
          type="text"
          value={symbol}
          onChange={(e) => setSymbol(e.target.value)}
          placeholder="Token Symbol"
          className="border p-2 w-full"
        />
      </div>
      <div className="mb-4">
        <input
          type="text"
          value={basePrice}
          onChange={(e) => setBasePrice(e.target.value)}
          placeholder="Base Price (in ETH)"
          className="border p-2 w-full"
        />
      </div>
      <div className="mb-4">
        <input
          type="text"
          value={priceIncreasePerToken}
          onChange={(e) => setPriceIncreasePerToken(e.target.value)}
          placeholder="Price Increase per Token (in ETH)"
          className="border p-2 w-full"
        />
      </div>
      <div className="mb-4">
        <input
          type="text"
          value={priceIncreasePer100Followers}
          onChange={(e) => setPriceIncreasePer100Followers(e.target.value)}
          placeholder="Price Increase per 100 Followers (in ETH)"
          className="border p-2 w-full"
        />
      </div>
      <div className="mb-4">
        <input
          type="text"
          value={minBonus}
          onChange={(e) => setMinBonus(e.target.value)}
          placeholder="Min Discount (in ETH)"
          className="border p-2 w-full"
        />
      </div>
      <div className="mb-4">
        <input
          type="text"
          value={maxBonus}
          onChange={(e) => setMaxBonus(e.target.value)}
          placeholder="Max Discount (in ETH)"
          className="border p-2 w-full"
        />
      </div>
      <button
        onClick={handleCreate}
        disabled={isLoading}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        {isLoading ? 'Creating...' : 'Create Token'}
      </button>
      {txHash && (
        <p className="mt-4">
          Transaction submitted: {txHash}
        </p>
      )}
    </div>
  );
};

export default CreateToken;