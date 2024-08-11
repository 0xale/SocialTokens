"use client"
import React, { useEffect, useState } from 'react';
import { useReadContract } from 'wagmi';
import contractABI from '../Contract/FactoryABI.json';


const contractAddress = '0x5338B0Fa96fD3C7e76dafbD6F27Ca1EFb06E14fe';

const TokenList: React.FC = () => {
  const [tokens, setTokens] = useState<string[]>([]);
  
  

  const { data: tokenAddresses } = useReadContract({
    address: contractAddress,
    abi: contractABI,
    functionName: 'getAllTokens',
  });

  useEffect(() => {
    if (tokenAddresses) {
      setTokens(tokenAddresses as string[]);
    }
    console.log("first")
  }, [tokenAddresses]);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Available Social Tokens</h1>
      <ul>
        {tokens.map((token, index) => (
          <li key={index}>
            <a href={`/buy-tokens/${token}`} className="text-blue-500">
              View and Purchase {token}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TokenList;
