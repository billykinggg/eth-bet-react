import React, { Component } from 'react';
import Header from './Header';

const API_KEY = process.env.REACT_APP_ETHERSCAN_API_KEY;
const BASE_URL = 'https://api.etherscan.io/v2/api';
const CHAIN_ID = 1; // Ethereum Mainnet

const delay = ms => new Promise(res => setTimeout(res, ms));

// Get the latest block number
const getLatestBlock = async () => {
  const url = `${BASE_URL}?chainid=${CHAIN_ID}&module=proxy&action=eth_blockNumber&apikey=${API_KEY}`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    if (data.result) {
      return parseInt(data.result, 16);
    }
    console.error('Error in response for latest block:', data);
    return null;
  } catch (error) {
    console.error('Error fetching latest block:', error);
    return null;
  }
};

// Get total supply of Ether
const getTotalSupply = async () => {
  const url = `${BASE_URL}?chainid=${CHAIN_ID}&module=stats&action=ethsupply&apikey=${API_KEY}`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    if (data.result) {
      return data.result / 1e18; // Convert from Wei to Ether
    }
    console.error('Error in response for total supply:', data);
    return null;
  } catch (error) {
    console.error('Error fetching total supply:', error);
    return null;
  }
};

// Get total staked ETH (ETH2 supply)
const getTotalStaked = async () => {
    const url = `${BASE_URL}?chainid=${CHAIN_ID}&module=stats&action=ethsupply2&apikey=${API_KEY}`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        if (data.status === "1" && data.result && data.result.Eth2Staking) {
            return data.result.Eth2Staking / 1e18; // Value is in Wei
        }
        console.error('Error in response for total staked ETH:', data);
        return null;
    } catch (error) {
        console.error('Error fetching total staked ETH:', error);
        return null;
    }
};


class Etherscan extends Component {
    state = {
        latestBlock: null,
        totalStaked: null,
        totalSupply: null,
        stakedPercentage: 0,
        theme: 'light' // Default theme
    };

    componentDidMount() {
        this.fetchEtherscanData();
    }

    fetchEtherscanData = async () => {
        const latestBlock = await getLatestBlock();
        await delay(1000); // Delay to avoid hitting rate limit
        const totalStaked = await getTotalStaked();
        await delay(1000); // Delay to avoid hitting rate limit
        const totalSupply = await getTotalSupply();
        const stakedPercentage = totalStaked / 100000;
        this.setState({ latestBlock, totalStaked, totalSupply, stakedPercentage });
    };

    render() {
        const { theme } = this.state;
        const cardClass = theme === 'dark' ? 'bg-secondary text-white' : '';
        const linkClass = theme === 'dark' ? 'text-white' : '';

        return (
            <div className={`container mt-5 ${theme === 'dark' ? 'text-white' : ''}`}>
                <Header />
                <br />
                <div className={`card shadow-sm mb-4 ${cardClass}`}>
                    <div className="card-body">
                        <h5 className="card-title">Ethereum Network Stats</h5>
                        <div className="row">
                            <div className="col-md-6">
                                <p><strong>Latest Block:</strong> {this.state.latestBlock ? this.state.latestBlock.toLocaleString() : 'Loading...'}</p>
                                <p><strong>Total Staked %:</strong> {this.state.stakedPercentage > 0 ? `${this.state.stakedPercentage.toFixed(2)}%` : 'Loading...'}</p>
                            </div>
                            <div className="col-md-6">
                                <p><strong>Total ETH Supply:</strong> {this.state.totalSupply ? this.state.totalSupply.toLocaleString() : 'Loading...'}</p>
                                <p><strong>Total ETH Staked:</strong> {this.state.totalStaked ? this.state.totalStaked.toLocaleString() : 'Loading...'}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
} 

export default Etherscan; 
