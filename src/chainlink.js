import web3 from './web3';  // Importing the web3 instance for blockchain interactions

const address = '0x9b76c8235F2e9Bd5CE07FC88b762802b48489c68'; // Replace with your contract address
const abi = [
  {
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [],
    "name": "getChainlinkDataFeedLatestAnswer",
    "outputs": [
      {
        "internalType": "int256",
        "name": "",
        "type": "int256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
]

export default new web3.eth.Contract(abi, address);

// This code exports a web3 contract instance for interacting with the Lottery contract.
// The contract address and ABI are specified, allowing the application to call functions and access data from the contract on the Ethereum blockchain.
// Ensure that the address and ABI match those of your deployed contract for successful interactions.   