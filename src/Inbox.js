import web3 from './web3';  // Importing the web3 instance for blockchain interactions

const address = '0x1615a4049bD02440871260C9DFFE2957f9492BC5'; // Replace with your contract address
const abi = [
  {
    inputs: [ [Object] ],
    stateMutability: 'nonpayable',
    type: 'constructor'
  },
  {
    inputs: [],
    name: 'message',
    outputs: [ [Object] ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [ [Object] ],
    name: 'setMessage',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  }
]

export default new web3.eth.Contract(abi, address);

// This code exports a web3 contract instance for interacting with the Lottery contract.
// The contract address and ABI are specified, allowing the application to call functions and access data from the contract on the Ethereum blockchain.
// Ensure that the address and ABI match those of your deployed contract for successful interactions.   