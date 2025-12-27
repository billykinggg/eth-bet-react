import React, { useState, useEffect } from 'react';
import web3 from './web3';
import { Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const Wallet = ({ onAccountChanged }) => {
  const [account, setAccount] = useState('');
  const [accountBalance, setAccountBalance] = useState('');

  const handleAccountsChanged = async (accounts) => {
    if (accounts.length === 0) {
      setAccount('');
      setAccountBalance('');
      if (onAccountChanged) {
        onAccountChanged('');
      }
    } else {
      const newAccount = accounts[0];
      setAccount(newAccount);
      if (onAccountChanged) {
        onAccountChanged(newAccount);
      }
      if (web3.utils.isAddress(newAccount)) {
        const balance = await web3.eth.getBalance(newAccount);
        setAccountBalance(web3.utils.fromWei(balance, 'ether'));
      }
    }
  };

  const connectWallet = async (silently = false) => {
    try {
      const accounts = await (silently ? web3.eth.getAccounts() : window.ethereum.request({ method: 'eth_requestAccounts' }));
      if (accounts.length > 0) {
        handleAccountsChanged(accounts);
      }
    } catch (error) {
      if (!silently) {
        console.error("Error connecting to MetaMask", error);
      }
    }
  };

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
    }
    
    connectWallet(true);

    return () => {
      if (window.ethereum) {
        // Using a new reference for the listener removal
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      }
    };
  }, []);

  return (
    <div className="d-flex justify-content-center my-4">
      <Card style={{ width: '33rem' }} className="text-center">
        <Card.Header as="h5">Wallet Information</Card.Header>
        <Card.Body>
          {account ? (
            <div>
              <Card.Title>Connected Account</Card.Title>
              <Card.Text>
                <strong>Address:</strong> {account}
              </Card.Text>
              <Card.Text>
                <strong>Balance:</strong> {accountBalance ? parseFloat(accountBalance).toFixed(4) : '0.0000'} ETH
              </Card.Text>
            </div>
          ) : (
            <div>
              <Card.Title>Not Connected</Card.Title>
              <Card.Text>
                Please connect your wallet to continue.
              </Card.Text>
              <Button variant="primary" onClick={() => connectWallet()}>Connect Wallet</Button>
            </div>
          )}
        </Card.Body>
        <Card.Footer>
            <Link to="/">
                <Button variant="secondary">Back to Main Page</Button>
            </Link>
        </Card.Footer>
      </Card>
    </div>
  );
};

export default Wallet;
