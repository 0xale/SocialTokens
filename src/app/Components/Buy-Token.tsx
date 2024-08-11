"use client";
import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import {
  parseEther,
  formatEther,
  createPublicClient,
  http,
  createWalletClient,
  custom,
  Address,
} from 'viem';
import { baseSepolia } from 'viem/chains';
import contractABI from '../Contract/SocialTokenABI.json';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';


interface BuyTokenProps {
  token: string | null;
}

const BuyToken: React.FC<BuyTokenProps> = ({ token }) => {
  const params = useParams();
  const { address, isConnected } = useAccount();
  const [amount, setAmount] = useState<string>('');
  const [calculatedPrice, setCalculatedPrice] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [farcasterFollowers, setFarcasterFollowers] = useState<number | null>(null);
  const { openConnectModal } = useConnectModal();
  const [basePrice, setBasePrice] = useState<string>('');
  const [priceIncreasePerToken, setPriceIncreasePerToken] = useState<string>('');
  const [priceIncreasePer100Followers, setPriceIncreasePer100Followers] = useState<string>('');
  const [minDiscount, setMinDiscount] = useState<string>('');
  const [maxDiscount, setMaxDiscount] = useState<string>('');
  const [symbol, setSymbol] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [totalSupply, setTotalSupply] = useState<string>('');
  const [tokenBalance, setTokenBalance] = useState<string>('');

  const contractAddress = params.token as Address;

  const publicClient = createPublicClient({
    chain: baseSepolia,
    transport: http()
  });

  useEffect(() => {
    
    const fetchContractData = async () => {
      console.log("calling")
      if (publicClient && contractAddress) {
        try {
          const [
            fetchedBasePrice,
            fetchedPriceIncreasePerToken,
            fetchedPriceIncreasePer100Followers,
            fetchedMinDiscount,
            fetchedMaxDiscount,
            fetchedSymbol,
            fetchedName,
            userBalance,
            totalSupply,
          ] = await Promise.all([
            publicClient.readContract({
              address: contractAddress,
              abi: contractABI,
              functionName: 'basePrice',
            }),
            publicClient.readContract({
              address: contractAddress,
              abi: contractABI,
              functionName: 'priceIncreasePerToken',
            }),
            publicClient.readContract({
              address: contractAddress,
              abi: contractABI,
              functionName: 'priceIncreasePer100Followers',
            }),
            publicClient.readContract({
              address: contractAddress,
              abi: contractABI,
              functionName: 'minBonus',
            }),
            publicClient.readContract({
              address: contractAddress,
              abi: contractABI,
              functionName: 'maxBonus',
            }),
            publicClient.readContract({
              address: contractAddress,
              abi: contractABI,
              functionName: 'symbol',
            }),
            publicClient.readContract({
              address: contractAddress,
              abi: contractABI,
              functionName: 'name',
            }),
           
            publicClient.readContract({
              address: contractAddress,
              abi: contractABI,
              functionName: 'balanceOf',
              args: [address!],
            }),
            publicClient.readContract({
              address: contractAddress,
              abi: contractABI,
              functionName: 'totalSupply',
            }),
          ]);

          setBasePrice(formatEther(fetchedBasePrice as bigint));
          setPriceIncreasePerToken(formatEther(fetchedPriceIncreasePerToken as bigint));
          setPriceIncreasePer100Followers(formatEther(fetchedPriceIncreasePer100Followers as bigint));
          setMinDiscount(formatEther(fetchedMinDiscount as bigint));
          setMaxDiscount(formatEther(fetchedMaxDiscount as bigint));
          setSymbol(fetchedSymbol as string);
          setName(fetchedName as string);
          setTokenBalance(formatEther(userBalance as bigint));
          setTotalSupply(formatEther(totalSupply as bigint));
        } catch (error) {
          console.error('Error fetching contract data:', error);
        }
      }
    };
    fetchContractData();
  },[address])


  useEffect(() => {
    const fetchPrice = async () => {
      if (amount && publicClient && contractAddress) {
        try {
          const priceData = await publicClient.readContract({
            address: contractAddress,
            abi: contractABI,
            functionName: 'getPrice',
            args: [parseEther(amount), 0],
          });
          setCalculatedPrice(formatEther(priceData as bigint));
        } catch (error) {
          console.error('Error fetching price:', error);
        }
      }
    };

    fetchPrice();
  }, [amount, publicClient, contractAddress]);
 

  const handleBuy = async () => {
    if (!isConnected) {
      openConnectModal;
      return;
    }

    setIsLoading(true);
    setSuccessMessage('');
    setErrorMessage('');

    let walletClient;
    try {
      const walletClient = createWalletClient({
        chain: {
          id: 84532,
          name: 'Base Sepolia',
          network: 'base-sepolia',
          nativeCurrency: {
            decimals: 18,
            name: 'Base Sepolia Ether',
            symbol: 'ETH',
          },
          rpcUrls: {
            default: {
              http: ["https://base-sepolia.g.alchemy.com/v2/9WBG_MVRsmOhaR5bEVKYclPwb_q9tIiw"],
            },
            public: {
              http: ["https://base-sepolia.g.alchemy.com/v2/9WBG_MVRsmOhaR5bEVKYclPwb_q9tIiw"],
            },
          },
        },
        transport: custom(window.ethereum),
      });

      if (walletClient && publicClient && contractAddress && address) {
        console.log("the amount",parseEther(amount));
        const { request } = await publicClient.simulateContract({
          account: address,
          address: contractAddress,
          abi: contractABI,
          functionName: 'buyTokens',
          args: [parseEther(amount), 0],
          value: parseEther(calculatedPrice),
        });
        const hash = await walletClient.writeContract(request);
        console.log(hash);
        setAmount('');
        setSuccessMessage('Transaction sent successfully!');
      }
    } catch (error) {
      console.error('Error buying tokens:', error);
      setErrorMessage('Failed to purchase tokens. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-lg">
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-900">{name} Token Purchase</h1>

      {isConnected ? (
        <div className="bg-white shadow-lg rounded-lg p-6 space-y-6">
          <div className="space-y-4 text-gray-700">
            <div className="flex flex-col space-y-2">
              <p className="font-semibold">Contract Address:</p>
              <p>{contractAddress}</p>
            </div>
            <div className="flex flex-col space-y-2">
              <p className="font-semibold">Total Supply:</p>
              <p>{totalSupply} {symbol}</p>
            </div>
            <div className="flex flex-col space-y-2">
              <p className="font-semibold">Your {symbol} Token Balance:</p>
              <p>{tokenBalance} {symbol}</p>
            </div>
            <div className="flex flex-col space-y-2">
              <p className="font-semibold">Farcaster Followers:</p>
              <p>{farcasterFollowers !== null ? farcasterFollowers : 'Loading...'}</p>
            </div>
            <div className="flex flex-col space-y-2">
              <p className="font-semibold">Base Price:</p>
              <p>{basePrice} ETH</p>
            </div>
            <div className="flex flex-col space-y-2">
              <p className="font-semibold">Price Increase Per Token:</p>
              <p>{priceIncreasePerToken} ETH</p>
            </div>
            <div className="flex flex-col space-y-2">
              <p className="font-semibold">Price Increase Per 100 Followers:</p>
              <p>{priceIncreasePer100Followers} ETH</p>
            </div>
            <div className="flex flex-col space-y-2">
              <p className="font-semibold">Min Bonus:</p>
              <p>{minDiscount} %</p>
            </div>
            <div className="flex flex-col space-y-2">
              <p className="font-semibold">Max Bonus:</p>
              <p>{maxDiscount} %</p>
            </div>
          </div>

          <div className="space-y-4">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Amount of tokens to buy"
              className="w-full border border-gray-300 p-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            />
            <button
              onClick={handleBuy}
              disabled={isLoading}
              className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {isLoading ? 'Buying...' : 'Buy Tokens'}
            </button>
            {calculatedPrice && (
              <p className="text-lg font-semibold text-gray-800">Estimated Price: {calculatedPrice} ETH</p>
            )}
            {successMessage && (
              <p className="text-green-600 text-center">{successMessage}</p>
            )}
            {errorMessage && (
              <p className="text-red-600 text-center">{errorMessage}</p>
            )}
          </div>
        </div>
      ) : (
        <div className="text-center">
          <button
            onClick={openConnectModal}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Connect Wallet
          </button>
        </div>
      )}
    </div>
  );
};

export default BuyToken;
