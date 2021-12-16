import { useContext, useState } from 'react';

import Web3Context from '../../store/web3-context';
import MarketplaceContext from '../../store/marketplace-context';
import web3 from '../../connection/web3';
import { formatPrice } from '../../helpers/utils';
import ethonft from "../../img/ethonft.png";
import "./navbar.css";

const Navbar = () => {
  const [fundsLoading, setFundsLoading] = useState(false);
  
  const web3Ctx = useContext(Web3Context);
  const marketplaceCtx = useContext(MarketplaceContext);
  
  const connectWalletHandler = async() => {
    try {
      // Request account access
      await window.ethereum.request({ method: 'eth_requestAccounts' });
    } catch(error) {
      console.error(error);
    }

    // Load accounts
    web3Ctx.loadAccount(web3);
  };

  const claimFundsHandler = () => {
    marketplaceCtx.contract.methods.claimFunds().send({ from: web3Ctx.account })
    .on('transactionHash', (hash) => {
      setFundsLoading(true);
    })
    .on('error', (error) => {
      window.alert('Something went wrong when pushing to the etho blockchain');
      setFundsLoading(false);
    });
  };

  // Event ClaimFunds subscription 
  marketplaceCtx.contract.events.ClaimFunds()
  .on('data', (event) => {
    marketplaceCtx.loadUserFunds(marketplaceCtx.contract, web3Ctx.account);
    setFundsLoading(false);
  })
  .on('error', (error) => {
    console.log(error);
  });

  
  return (
    
    
    <nav className="navbar navbar-custom navbar-expand-sm navbar-light  p-0 navbar-center" >
      <div className="container-fluid">
        <a className="navbar-brand" href="/">
          <img src={ethonft} alt="" width="75%"></img>
        </a>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse"
                data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false"
                aria-label="Toggle navigation">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="container-fluid">
          <form className="d-flex">
            <input className="form-control me-2" type="search" placeholder="Search" aria-label="Search">
            </input>
            <button className="btn btn-outline-success" type="submit">Search</button>
          </form>
        </div>
        <div className="collapse navbar-collapse" id="navbarSupportedContent">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0 navbar-center">
             <li className="nav-item">
              <a className="nav-link text-white" href="explore">Explore</a>
            </li>
            <li className="nav-item">
              <a className="nav-link text-white" href="mint">Mint</a>
            </li>
            {web3Ctx.account &&
              <li className="nav-item">
                <a className="nav-link text-white" aria-current="page" href="/mynft">MyNFT</a>
              </li>
            }
            <li className="nav-item">
            {marketplaceCtx.userFunds > 0 && !fundsLoading &&
              <button
                type="button"
                className="btn btn-info btn-block navbar-btn text-white"
                onClick={claimFundsHandler}
              >
                {`YOU SOLD AN ITEM! CLAIM ${formatPrice(marketplaceCtx.userFunds)} ETHO`}
              </button>}
            {fundsLoading &&
              <div className="d-flex justify-content-center text-info">
                <div className="spinner-border" role="status">
                  <span className="sr-only"></span>
                </div>
            </div>}
          </li>
          <li className="nav-item text-white">
            {web3Ctx.account &&
              <a
                className="nav-link small text-white"
                href={`https://explorer.ethoprotocol.com/address/${web3Ctx.account}`}
                target="blank"
                rel="noopener noreferrer"
              >
                Connected {web3Ctx.account.substring(0,6)}...
              </a>}
            {!web3Ctx.account &&
              <button
                type="button"
                className="btn btn-info text-white"
                onClick={connectWalletHandler}
              >
                Connect your wallet
              </button>}
          </li>
        </ul>
      </div>
      </div>
    </nav>

);
};

export default Navbar;
