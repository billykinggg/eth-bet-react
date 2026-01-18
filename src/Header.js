import React from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
    const linkClass = "text-decoration-none text-white";
    return (
        <div className="container-fluid bg-dark py-3">
            <h1 className="text-white">Eth Price Bet</h1>
            <p className="text-white">
                <Link to="/" className={linkClass}>Eth Price Bet</Link>  | <Link to="/etherscan" className={linkClass}>Etherscan Stats</Link> | <Link to="/Wallet" className={linkClass}>Wallet Information</Link>
            </p>
        </div>
    );
};

export default Header;
 