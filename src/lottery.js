import web3 from './web3';  // Importing the web3 instance for blockchain interactions

const address = '0x536107cFbDc6693F387Cc1E02F05A0eC43179c7B'; // Replace with your contract address
const abi = [
  {
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [],
    "name": "Enter",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getPlayer",
    "outputs": [
      {
        "internalType": "address[]",
        "name": "",
        "type": "address[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "manager",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "pickWinner",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "players",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
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