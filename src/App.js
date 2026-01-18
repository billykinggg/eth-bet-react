import React, { Component } from 'react';
import logo from './eth-logo2.png';
import './App.css';
import web3 from './web3';
import chainlink from './chainlink';
import ethbet from './ethbet';
import 'bootstrap/dist/css/bootstrap.min.css';
import PriceChart from './PriceChart';
import Header from './Header';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      latestAnswer: '',
      account: '',
      accountBalance: '',
      countdown: 60,
      ethbetManager: '',
      ethbetBalance: '',
      ethbetPlayers: [],
      ethbetValue: '0.001',
      ethbetBetValue: '',
      ethbetMessage: '',
      walletMessage: '',
      ethbetPlayersList: [],
      ethbetPlayerBetsList: { players: [], bets: [] },
      theme: 'light'
    };
    this.priceInterval = null;
    this.handleAccountsChanged = this.handleAccountsChanged.bind(this);
  }

  toggleTheme = () => {
    this.setState(prevState => ({
      theme: prevState.theme === 'light' ? 'dark' : 'light'
    }));
  };

  componentDidUpdate(prevProps, prevState) {
    if (prevState.theme !== this.state.theme) {
      document.body.className = this.state.theme === 'dark' ? 'bg-dark' : 'bg-light';
    }
  }

  async componentDidMount() {
    // Listen for account changes
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', this.handleAccountsChanged);
    }

    this.connectWallet(true); // Try to connect wallet silently on load
    this.handleGetLatestAnswer(); // Initial fetch
    this.priceInterval = setInterval(() => {
      this.setState(prevState => {
        if (prevState.countdown > 1) {
          return { countdown: prevState.countdown - 1 };
        } else {
          this.handleGetLatestAnswer();
          return { countdown: 60 };
        }
      });
    }, 1000);

    try {
      const latestAnswer = await chainlink.methods.getChainlinkDataFeedLatestAnswer().call();
      this.setState({ latestAnswer });

      if (ethbet) {
        const ethbetManager = await ethbet.methods.manager().call();
        const ethbetBalance = await web3.eth.getBalance(ethbet.options.address);
        this.setState({ ethbetManager, ethbetBalance });
      }
    } catch (err) {
      console.error('Error during component mount:', err);
    }
  }

  connectWallet = async (silently = false) => {
    if (typeof window.ethereum === 'undefined') {
      this.setState({ walletMessage: 'Please install MetaMask to use this app.' });
      return;
    }
    try {
      const accounts = await (silently ? web3.eth.getAccounts() : window.ethereum.request({ method: 'eth_requestAccounts' }));
      if (accounts.length > 0) {
        const account = accounts[0];
        const balance = await web3.eth.getBalance(account);
        this.setState({ account, accountBalance: web3.utils.fromWei(balance, 'ether'), walletMessage: '' });
      } else if (!silently) {
        this.setState({ walletMessage: 'Please connect to MetaMask.' });
      }
    } catch (error) {
      if (!silently) {
        console.error("Error connecting to MetaMask", error);
        this.setState({ walletMessage: 'Failed to connect wallet.' });
      }
    }
  };

  handleAccountsChanged = async (accounts) => {
    if (accounts.length === 0) {
      // MetaMask is locked or the user has disconnected all accounts.
      this.setState({ account: '', accountBalance: '' });
    } else if (accounts[0] !== this.state.account) {
      const account = accounts[0];
      const balance = await web3.eth.getBalance(account);
      this.setState({ account, accountBalance: web3.utils.fromWei(balance, 'ether') });
    }
  };

  componentWillUnmount() {
    clearInterval(this.priceInterval);
    if (window.ethereum) {
      window.ethereum.removeListener('accountsChanged', this.handleAccountsChanged);
    }
  }

  handleGetLatestAnswer = async () => {
    try {
      const latestAnswer = await chainlink.methods.getChainlinkDataFeedLatestAnswer().call();
      this.setState({ latestAnswer });
    } catch (err) {
      console.error('Failed to get latest answer from Chainlink.', err);
    }
  };

  handleEthbetSubmit = async (event) => {
    event.preventDefault();
    const { ethbetBetValue, ethbetValue } = this.state;
    if (!ethbetBetValue) {
      this.setState({ ethbetMessage: 'Please enter a bet value.' });
      return;
    }
    this.setState({ ethbetMessage: 'Waiting on transaction success...' });
    const accounts = await web3.eth.getAccounts();
    try {
      await ethbet.methods.Enter(ethbetBetValue).send({
        from: accounts[0],
        value: web3.utils.toWei(ethbetValue, 'ether')
      });
      this.setState({ ethbetMessage: 'You have been entered into the Ethereum Betting!' });
      const ethbetBalance = await web3.eth.getBalance(ethbet.options.address);
      this.setState({ ethbetBalance });
    } catch (err) {
      let message = 'Ethbet transaction failed.';
      const reason = err.message.match(/revert\s+(.*)/);
      if (reason && reason[1]) {
        message = `Ethbet transaction failed: ${reason[1]}`;
      } else {
        message = `Ethbet transaction failed: ${err.message}`;
      }
      this.setState({ ethbetMessage: message });
      console.error(err);
    }
  };

  handleEthbetPickWinner = async () => {
    this.setState({ ethbetMessage: 'Picking an Ethbet winner...' });
    const accounts = await web3.eth.getAccounts();
    try {
      await ethbet.methods.pickWinner().send({
        from: accounts[0]
      });
      this.setState({ ethbetMessage: 'An Ethbet winner has been picked!' });
      const ethbetBalance = await web3.eth.getBalance(ethbet.options.address);
      this.setState({ ethbetBalance, ethbetPlayersList: [], ethbetPlayerBetsList: { players: [], bets: [] } });
    } catch (err) {
      this.setState({ ethbetMessage: 'Failed to pick an Ethbet winner.' });
      console.error(err);
    }
  };

  handleGetEthbetPlayers = async () => {
    try {
      const players = await ethbet.methods.getPlayer().call();
      this.setState({ ethbetPlayersList: players, ethbetMessage: 'Players list refreshed.' });
    } catch (err) {
      this.setState({ ethbetMessage: 'Failed to get players.' });
    }
  };

  handleGetEthbetPlayerBets = async () => {
    try {
      const result = await ethbet.methods.getPlayerBets().call();
      this.setState({ ethbetPlayerBetsList: { players: result[0], bets: result[1] }, ethbetMessage: 'Player bets refreshed.' });
    } catch (err) {
      this.setState({ ethbetMessage: 'Failed to get player bets.' });
    }
  };

  render() {
    const { theme } = this.state;
    const isEthbetManager = this.state.ethbetManager && this.state.account &&
      this.state.ethbetManager.toLowerCase() === this.state.account.toLowerCase();

    const cardClass = theme === 'dark' ? 'bg-secondary text-white' : '';
    const linkClass = theme === 'dark' ? 'text-white' : '';

    return (
      <div className={`container mt-5 ${theme === 'dark' ? 'text-white' : ''}`}>
        <Header />
        <div className={`card shadow mt-4 ${cardClass}`}>
          <div className="card-body">
            <div className="text-center mb-4">
              <img src={logo} alt="Logo" style={{ width: 80 }} />
              <h2 className="mt-3">ETH Price Forecast Bet</h2>
            </div>
            <div className="row justify-content-center">
              <div className="col-lg-8">
                <div className="text-center">
                  <div className="mt-4 mt-lg-0">
                    <PriceChart theme={this.state.theme} />
                  </div>
                  <p className="mt-3">
                    <strong>Latest ETH Price (Chainlink):</strong> {this.state.latestAnswer ? `$${(Number(this.state.latestAnswer) / 10 ** 8).toFixed(2)}` : 'Loading...'}
                    <span className="ms-2 text-muted"> (Updates in {this.state.countdown}s)</span>
                  </p>
                </div>
              </div>
            </div>
            <hr />
            <div className="row justify-content-center">
              <div className="col-md-8 text-center">
                <h3 className="text-center">Ethereum Betting</h3>
                {ethbet && <p><strong>Contract Address:</strong> {ethbet.options.address}</p>}
                <p><strong>Manager:</strong> {this.state.ethbetManager}</p>
                <p><strong>Prize Pool:</strong> {web3.utils.fromWei(this.state.ethbetBalance, 'ether')} ether</p>
                <hr />

                <form onSubmit={this.handleEthbetSubmit}>
                  {this.state.account ? (
                    <div>
                      <p><strong>Wallet:</strong> {this.state.account}</p>
                      <p><strong>Balance:</strong> {parseFloat(this.state.accountBalance).toFixed(4)} ETH</p>
                    </div>
                  ) : (
                    <button className="btn btn-outline-primary mb-3" onClick={() => this.connectWallet()}>Connect Wallet</button>
                  )}
                  <div className="mb-3">
                    <label className="form-label">Your ETH Price Bet (in USD, e.g., 3500):</label>
                    <input
                      type="number"
                      style={{ width: '20ch' }}
                      className="form-control mx-auto"
                      value={this.state.ethbetBetValue}
                      onChange={event => this.setState({ ethbetBetValue: event.target.value })}
                      placeholder="e.g., 3500"
                      required
                    />
                    <div className="form-text">Entry fee is a fixed {this.state.ethbetValue} ETH.</div>
                  </div>
                  <button type="submit" className="btn btn-primary">Enter Ethbet</button>
                </form>
              </div>
            </div>


            <hr />
            <div className="row justify-content-center">
              <div className="col-md-8 text-center">
            {isEthbetManager && (
              <div className="mb-3">
                <h4>Ethbet Manager Controls</h4>
                <button className="btn btn-warning" onClick={this.handleEthbetPickWinner}>Pick Ethbet Winner</button>
              </div>
            )}
            <div className="mb-3">
              <h4>Player Information</h4>
              <button className="btn btn-info" onClick={this.handleGetEthbetPlayerBets}>Get Player and Bets</button>
            </div>

            {this.state.ethbetPlayersList.length > 0 && (
              <div>
                <h5>Players ({this.state.ethbetPlayersList.length}):</h5>
                <ul className="list-group">
                  {this.state.ethbetPlayersList.map((player, index) => <li key={index} className="list-group-item">{player}</li>)}
                </ul>
              </div>
            )}

            {this.state.ethbetPlayerBetsList.players.length > 0 && (
              <div className="mt-3">
                <h5>Player Bets:</h5>
                <ul className="list-group">
                  {this.state.ethbetPlayerBetsList.players.map((player, index) => (
                    <li key={index} className="list-group-item">
                      <strong>{player}:</strong> ${this.state.ethbetPlayerBetsList.bets[index]}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {this.state.ethbetMessage && (
              <div className="alert alert-info mt-3">{this.state.ethbetMessage}</div>
            )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
