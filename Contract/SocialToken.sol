// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import {Math} from "@openzeppelin/contracts/utils/math/Math.sol";
import "@pythnetwork/pyth-sdk-solidity/IPyth.sol";
import "@pythnetwork/pyth-sdk-solidity/PythStructs.sol";

contract SocialTokenFactory is Ownable {
    IPyth public pyth;
    mapping(address => address[]) public userTokens; // Store tokens created by each user
    address[] public allTokens; // Store all created token addresses

    event SocialTokenCreated(
        address tokenAddress,
        string name,
        string symbol,
        address creator,
        string tokenURI
    );

    constructor(address _pythAddress) Ownable(msg.sender) {
        pyth = IPyth(_pythAddress);
    }

    function createFarcasterToken(
        string memory name,
        string memory symbol,
        uint256 basePrice,
        uint256 priceIncreasePerToken,
        uint256 priceIncreasePer100Followers,
        uint256 minBonus,
        uint256 maxBonus,
        string memory tokenURI
    ) external returns (address) {
        SocialToken newToken = new SocialToken(
            name,
            symbol,
            basePrice,
            priceIncreasePerToken,
            priceIncreasePer100Followers,
            msg.sender,
            minBonus,
            maxBonus,
            address(pyth),
            tokenURI
        );

        allTokens.push(address(newToken)); // Add token to the list of all tokens
        userTokens[msg.sender].push(address(newToken)); // Add token to the user's list of created tokens
        emit SocialTokenCreated(
            address(newToken),
            name,
            symbol,
            msg.sender,
            tokenURI
        );

        return address(newToken);
    }

    function getAllTokens() external view returns (address[] memory) {
        return allTokens;
    }

    function getUserTokens(
        address user
    ) external view returns (address[] memory) {
        return userTokens[user];
    }
}

contract SocialToken is ERC20, ERC20Burnable, Ownable {
    using Math for uint256;

    uint256 public basePrice;
    uint256 public priceIncreasePerToken;
    uint256 public priceIncreasePer100Followers;
    uint256 public minBonus;
    uint256 public maxBonus;
    bytes32 public constant ethUsdPriceId =
        0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace;

    IPyth public pyth;
    string private _tokenURI;

    event TokensPurchased(
        address indexed buyer,
        uint256 amount,
        uint256 price,
        uint256 bonusAmount
    );
    event EthWithdrawn(uint256 amount);
    event TokenURIUpdated(string newTokenURI);
    event basePrices(uint256 price);

    constructor(
        string memory name,
        string memory symbol,
        uint256 _basePrice,
        uint256 _priceIncreasePerToken,
        uint256 _priceIncreasePer100Followers,
        address _owner,
        uint256 _minBonus,
        uint256 _maxBonus,
        address _pyth,
        string memory tokenURI_
    ) ERC20(name, symbol) Ownable(_owner) {
        basePrice = _basePrice;
        priceIncreasePerToken = _priceIncreasePerToken;
        priceIncreasePer100Followers = _priceIncreasePer100Followers;
        minBonus = _minBonus;
        maxBonus = _maxBonus;
        pyth = IPyth(_pyth);
        _tokenURI = tokenURI_;
    }

    function buyTokens(uint256 amount, uint256 _followers) external payable {
        require(amount > 0, "Amount must be greater than 0");
        uint256 price = getPrice(amount, _followers);
        require(msg.value >= price, "Insufficient payment");

        uint256 bonusPercentage = getBonusPercentage();
        uint256 bonusAmount = (amount * bonusPercentage) / 100;
        uint256 totalAmount = amount + bonusAmount;

        _mint(msg.sender, totalAmount);

        if (msg.value > price) {
            payable(msg.sender).transfer(msg.value - price);
        }

        emit TokensPurchased(msg.sender, totalAmount, price, bonusAmount);
    }

    function getPrice(
        uint256 amount,
        uint256 _followers
    ) public returns (uint256) {
        uint256 supply = totalSupply();

        uint256 baseTokenPrice = amount.mulDiv(basePrice, 1e18);
        emit basePrices(baseTokenPrice);
        uint256 increasedPrice = amount.mulDiv(
            (supply / 1e18) * priceIncreasePerToken,
            1e18
        );
        uint256 followerPrice = amount.mulDiv(_followers, 100).mulDiv(
            priceIncreasePer100Followers,
            1e18
        );

        return baseTokenPrice + increasedPrice + followerPrice;
    }

    function getBonusPercentage() public view returns (uint256) {
        PythStructs.Price memory ethPrice = pyth.getPriceNoOlderThan(
            ethUsdPriceId,
            6000
        );
        uint256 randomSeed = uint256(
            keccak256(abi.encodePacked(block.timestamp, ethPrice.price))
        );
        return minBonus + (randomSeed % (maxBonus - minBonus + 1));
    }

    function withdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No balance to withdraw");
        payable(owner()).transfer(balance);
        emit EthWithdrawn(balance);
    }

    function tokenURI() public view returns (string memory) {
        return _tokenURI;
    }

    function setTokenURI(string memory newTokenURI) external onlyOwner {
        _tokenURI = newTokenURI;
        emit TokenURIUpdated(newTokenURI);
    }
}
