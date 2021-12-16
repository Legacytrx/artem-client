import React, { useContext, useEffect } from 'react';

import web3 from './connection/web3';
import Navbar from './components/Layout/Navbar';
import {Main, MyNFT} from './components/Content/Main';
import Web3Context from './store/web3-context';
import CollectionContext from './store/collection-context';
import MarketplaceContext from './store/marketplace-context'
import NFTCollection from './abis/NFTCollection.json';
import NFTMarketplace from './abis/NFTMarketplace.json';
import MintForm from "./components/Content/MintNFT/MintForm";
import Spinner from "./components/Layout/Spinner";
import "./app.css";
import ethonft_headline from "./img/ethonft_headline.png";
import ethonft_gallery from "./img/ethonft_gallery.png";
import ethonft_minting from "./img/ethonft_minting.png";


const App = () => {
  const web3Ctx = useContext(Web3Context);
  const collectionCtx = useContext(CollectionContext);
  const marketplaceCtx = useContext(MarketplaceContext);
  
  useEffect(() => {
    // Check if the user has Metamask active
    if(!web3) {
      window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!');
      return;
    }
    
    // Function to fetch all the blockchain data
    const loadBlockchainData = async() => {
      // Request accounts acccess if needed
      try {
        await window.ethereum.request({ method: 'eth_requestAccounts' });  
      } catch(error) {
        console.error(error);
      }
      
      // Load account
      const account = await web3Ctx.loadAccount(web3);

      // Load Network ID
      const networkId = await web3Ctx.loadNetworkId(web3);

      // Load Contracts      
      const nftDeployedNetwork = NFTCollection.networks[networkId];
      const nftContract = collectionCtx.loadContract(web3, NFTCollection, nftDeployedNetwork);

      const mktDeployedNetwork = NFTMarketplace.networks[networkId];
      const mktContract = marketplaceCtx.loadContract(web3, NFTMarketplace, mktDeployedNetwork);

      if(nftContract) {        
        // Load total Supply
        const totalSupply = await collectionCtx.loadTotalSupply(nftContract);
        
        // Load Collection
        collectionCtx.loadCollection(nftContract, totalSupply);       

        // Event subscription
        nftContract.events.Transfer()
        .on('data', (event) => {
          collectionCtx.updateCollection(nftContract, event.returnValues.tokenId, event.returnValues.to);
          collectionCtx.setNftIsLoading(false);
        })
        .on('error', (error) => {
          console.log(error);
        });
        
      } else {
        window.alert('NFTCollection contract not deployed to detected network.')
      }

      if(mktContract) {
        // Load offer count
        const offerCount = await marketplaceCtx.loadOfferCount(mktContract);
        
        // Load offers
        marketplaceCtx.loadOffers(mktContract, offerCount); 
        
        // Load User Funds
        account && marketplaceCtx.loadUserFunds(mktContract, account);

        // Event OfferFilled subscription 
        mktContract.events.OfferFilled()
        .on('data', (event) => {
          marketplaceCtx.updateOffer(event.returnValues.offerId);
          collectionCtx.updateOwner(event.returnValues.id, event.returnValues.newOwner);
          marketplaceCtx.setMktIsLoading(false);
        })
        .on('error', (error) => {
          console.log(error);
        });

        // Event Offer subscription 
        mktContract.events.Offer()
        .on('data', (event) => {
          marketplaceCtx.addOffer(event.returnValues);
          marketplaceCtx.setMktIsLoading(false);
        })
        .on('error', (error) => {
          console.log(error);
        });

        // Event offerCancelled subscription 
        mktContract.events.OfferCancelled()
        .on('data', (event) => {
          marketplaceCtx.updateOffer(event.returnValues.offerId);
          collectionCtx.updateOwner(event.returnValues.id, event.returnValues.owner);
          marketplaceCtx.setMktIsLoading(false);
        })
        .on('error', (error) => {
          console.log(error);
        });
        
      } else {
        window.alert('ETHONFTMarketplace contract not deployed to detected network.')
      }

      collectionCtx.setNftIsLoading(false);
      marketplaceCtx.setMktIsLoading(false);

      // Metamask Event Subscription - Account changed
      window.ethereum.on('accountsChanged', (accounts) => {
        web3Ctx.loadAccount(web3);
        accounts[0] && marketplaceCtx.loadUserFunds(mktContract, accounts[0]);
      });

      // Metamask Event Subscription - Network changed
      window.ethereum.on('chainChanged', (chainId) => {
        window.location.reload();
      });
    };
    
    loadBlockchainData();
  }, []);

  const showNavbar = web3 && collectionCtx.contract && marketplaceCtx.contract;
  const showContent = web3 && collectionCtx.contract && marketplaceCtx.contract && web3Ctx.account;
  
  return(
      <div className="container-fluid container-main bg-dark h">
        <React.Fragment>
            {showNavbar && <Navbar />}
            <div className="container-fluid container-main bg-dark h">
              {showContent && <Main />}
            </div>
        </React.Fragment>
      </div>
  );
};

const MyNFTpage = () => {
  const web3Ctx = useContext(Web3Context);
  const collectionCtx = useContext(CollectionContext);
  const marketplaceCtx = useContext(MarketplaceContext);
  
  useEffect(() => {
    // Check if the user has Metamask active
    if(!web3) {
      window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!');
      return;
    }
    
    // Function to fetch all the blockchain data
    const loadBlockchainData = async() => {
      // Request accounts acccess if needed
      try {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
      } catch(error) {
        console.error(error);
      }
      
      // Load account
      const account = await web3Ctx.loadAccount(web3);
      
      // Load Network ID
      const networkId = await web3Ctx.loadNetworkId(web3);
      
      // Load Contracts
      const nftDeployedNetwork = NFTCollection.networks[networkId];
      const nftContract = collectionCtx.loadContract(web3, NFTCollection, nftDeployedNetwork);
      
      const mktDeployedNetwork = NFTMarketplace.networks[networkId];
      const mktContract = marketplaceCtx.loadContract(web3, NFTMarketplace, mktDeployedNetwork);
      
      if(nftContract) {
        // Load total Supply
        const totalSupply = await collectionCtx.loadTotalSupply(nftContract);
        
        // Load Collection
        collectionCtx.loadCollection(nftContract, totalSupply);
        
        // Event subscription
        nftContract.events.Transfer()
            .on('data', (event) => {
              collectionCtx.updateCollection(nftContract, event.returnValues.tokenId, event.returnValues.to);
              collectionCtx.setNftIsLoading(false);
            })
            .on('error', (error) => {
              console.log(error);
            });
        
      } else {
        window.alert('NFTCollection contract not deployed to detected network.')
      }
      
      if(mktContract) {
        // Load offer count
        const offerCount = await marketplaceCtx.loadOfferCount(mktContract);
        
        // Load offers
        marketplaceCtx.loadOffers(mktContract, offerCount);
        
        // Load User Funds
        account && marketplaceCtx.loadUserFunds(mktContract, account);
        
        // Event OfferFilled subscription
        mktContract.events.OfferFilled()
            .on('data', (event) => {
              marketplaceCtx.updateOffer(event.returnValues.offerId);
              collectionCtx.updateOwner(event.returnValues.id, event.returnValues.newOwner);
              marketplaceCtx.setMktIsLoading(false);
            })
            .on('error', (error) => {
              console.log(error);
            });
        
        // Event Offer subscription
        mktContract.events.Offer()
            .on('data', (event) => {
              marketplaceCtx.addOffer(event.returnValues);
              marketplaceCtx.setMktIsLoading(false);
            })
            .on('error', (error) => {
              console.log(error);
            });
        
        // Event offerCancelled subscription
        mktContract.events.OfferCancelled()
            .on('data', (event) => {
              marketplaceCtx.updateOffer(event.returnValues.offerId);
              collectionCtx.updateOwner(event.returnValues.id, event.returnValues.owner);
              marketplaceCtx.setMktIsLoading(false);
            })
            .on('error', (error) => {
              console.log(error);
            });
        
      } else {
        window.alert('ETHONFTMarketplace contract not deployed to detected network.')
      }
      
      collectionCtx.setNftIsLoading(false);
      marketplaceCtx.setMktIsLoading(false);
      
      // Metamask Event Subscription - Account changed
      window.ethereum.on('accountsChanged', (accounts) => {
        web3Ctx.loadAccount(web3);
        accounts[0] && marketplaceCtx.loadUserFunds(mktContract, accounts[0]);
      });
      
      // Metamask Event Subscription - Network changed
      window.ethereum.on('chainChanged', (chainId) => {
        window.location.reload();
      });
    };
    
    loadBlockchainData();
  }, []);
  
  const showNavbar = web3 && collectionCtx.contract && marketplaceCtx.contract;
  const showContent = web3 && collectionCtx.contract && marketplaceCtx.contract && web3Ctx.account;
  
  return(
      <div className="container-fluid container-main bg-dark h">
    
        <React.Fragment>
            {showNavbar && <Navbar />}
            <div className="container-fluid container-main bg-dark h">
              {showContent && <MyNFT />}
            </div>
        </React.Fragment>
      </div>
  );
};



const Homepage = () => {
  const web3Ctx = useContext(Web3Context);
  const collectionCtx = useContext(CollectionContext);
  const marketplaceCtx = useContext(MarketplaceContext);
  
  useEffect(() => {
    // Check if the user has Metamask active
    if(!web3) {
      window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!');
      return;
    }
    
    // Function to fetch all the blockchain data
    const loadBlockchainData = async() => {
      // Request accounts acccess if needed
      try {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
      } catch(error) {
        console.error(error);
      }
      
      // Load account
      const account = await web3Ctx.loadAccount(web3);
      
      // Load Network ID
      const networkId = await web3Ctx.loadNetworkId(web3);
      
      // Load Contracts
      const nftDeployedNetwork = NFTCollection.networks[networkId];
      const nftContract = collectionCtx.loadContract(web3, NFTCollection, nftDeployedNetwork);
      
      const mktDeployedNetwork = NFTMarketplace.networks[networkId];
      const mktContract = marketplaceCtx.loadContract(web3, NFTMarketplace, mktDeployedNetwork);
      
      if(nftContract) {
        // Load total Supply
        const totalSupply = await collectionCtx.loadTotalSupply(nftContract);
        
        // Load Collection
        collectionCtx.loadCollection(nftContract, totalSupply);
        
        // Event subscription
        nftContract.events.Transfer()
            .on('data', (event) => {
              collectionCtx.updateCollection(nftContract, event.returnValues.tokenId, event.returnValues.to);
              collectionCtx.setNftIsLoading(false);
            })
            .on('error', (error) => {
              console.log(error);
            });
        
      } else {
        window.alert('NFTCollection contract not deployed to detected network.')
      }
      
      if(mktContract) {
        // Load offer count
        const offerCount = await marketplaceCtx.loadOfferCount(mktContract);
        
        // Load offers
        marketplaceCtx.loadOffers(mktContract, offerCount);
        
        // Load User Funds
        account && marketplaceCtx.loadUserFunds(mktContract, account);
        
        // Event OfferFilled subscription
        mktContract.events.OfferFilled()
            .on('data', (event) => {
              marketplaceCtx.updateOffer(event.returnValues.offerId);
              collectionCtx.updateOwner(event.returnValues.id, event.returnValues.newOwner);
              marketplaceCtx.setMktIsLoading(false);
            })
            .on('error', (error) => {
              console.log(error);
            });
        
        // Event Offer subscription
        mktContract.events.Offer()
            .on('data', (event) => {
              marketplaceCtx.addOffer(event.returnValues);
              marketplaceCtx.setMktIsLoading(false);
            })
            .on('error', (error) => {
              console.log(error);
            });
        
        // Event offerCancelled subscription
        mktContract.events.OfferCancelled()
            .on('data', (event) => {
              marketplaceCtx.updateOffer(event.returnValues.offerId);
              collectionCtx.updateOwner(event.returnValues.id, event.returnValues.owner);
              marketplaceCtx.setMktIsLoading(false);
            })
            .on('error', (error) => {
              console.log(error);
            });
        
      } else {
        window.alert('ETHONFTMarketplace contract not deployed to detected network.')
      }
      
      collectionCtx.setNftIsLoading(false);
      marketplaceCtx.setMktIsLoading(false);
      
      // Metamask Event Subscription - Account changed
      window.ethereum.on('accountsChanged', (accounts) => {
        web3Ctx.loadAccount(web3);
        accounts[0] && marketplaceCtx.loadUserFunds(mktContract, accounts[0]);
      });
      
      // Metamask Event Subscription - Network changed
      window.ethereum.on('chainChanged', (chainId) => {
        window.location.reload();
      });
    };
    
    loadBlockchainData();
  }, []);
  
  const showNavbar = web3 && collectionCtx.contract && marketplaceCtx.contract;
  
  return (
      <div className="container-fluid container-main bg-dark h">
        <React.Fragment>
          {showNavbar && <Navbar />}
          <div className="container-fluid container-main bg-dark h">
            <div className="row text-white align-items-center">
              <div className="container col-md p-3">
                  <div className="container">
    
                      <img src={ethonft_headline} alt="Decentralized Marketplace" width="100%" align="center"></img>
                    <h1>
                      Art is subjective, freedom is not
                    </h1>
                    <p>Etho Protocol is the only NFT platform where you Mint with Storage, Sell, and Buy all on the one blockchain.</p>
                    <ul className="p-3">
                     <li>100% Ethereum compliant</li>
                     <li>100% decentralized</li>
                    </ul>
                    <h4>
                      Etho Protocol - Redefining NFT Technology
                    </h4>
                  </div>
              
              </div>
              <div className="col-md p-3">
                <img src={ethonft_gallery} alt="Decentrlized Marketplace" width="100%"></img>
              </div>
            </div>
          </div>
          
        </React.Fragment>
    </div>
  );
};



const Mintpage = () => {
  const web3Ctx = useContext(Web3Context);
  const collectionCtx = useContext(CollectionContext);
  const marketplaceCtx = useContext(MarketplaceContext);
  
  useEffect(() => {
    // Check if the user has Metamask active
    if(!web3) {
      window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!');
      return;
    }
    
    // Function to fetch all the blockchain data
    const loadBlockchainData = async() => {
      // Request accounts acccess if needed
      try {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
      } catch(error) {
        console.error(error);
      }
      
      // Load account
      const account = await web3Ctx.loadAccount(web3);
      
      // Load Network ID
      const networkId = await web3Ctx.loadNetworkId(web3);
      
      // Load Contracts
      const nftDeployedNetwork = NFTCollection.networks[networkId];
      const nftContract = collectionCtx.loadContract(web3, NFTCollection, nftDeployedNetwork);
      
      const mktDeployedNetwork = NFTMarketplace.networks[networkId];
      const mktContract = marketplaceCtx.loadContract(web3, NFTMarketplace, mktDeployedNetwork);
      
      if(nftContract) {
        // Load total Supply
        const totalSupply = await collectionCtx.loadTotalSupply(nftContract);
        
        // Load Collection
        collectionCtx.loadCollection(nftContract, totalSupply);
        
        // Event subscription
        nftContract.events.Transfer()
            .on('data', (event) => {
              collectionCtx.updateCollection(nftContract, event.returnValues.tokenId, event.returnValues.to);
              collectionCtx.setNftIsLoading(false);
            })
            .on('error', (error) => {
              console.log(error);
            });
        
      } else {
        window.alert('NFTCollection contract not deployed to detected network.')
      }
      
      if(mktContract) {
        // Load offer count
        const offerCount = await marketplaceCtx.loadOfferCount(mktContract);
        
        // Load offers
        marketplaceCtx.loadOffers(mktContract, offerCount);
        
        // Load User Funds
        account && marketplaceCtx.loadUserFunds(mktContract, account);
        
        // Event OfferFilled subscription
        mktContract.events.OfferFilled()
            .on('data', (event) => {
              marketplaceCtx.updateOffer(event.returnValues.offerId);
              collectionCtx.updateOwner(event.returnValues.id, event.returnValues.newOwner);
              marketplaceCtx.setMktIsLoading(false);
            })
            .on('error', (error) => {
              console.log(error);
            });
        
        // Event Offer subscription
        mktContract.events.Offer()
            .on('data', (event) => {
              marketplaceCtx.addOffer(event.returnValues);
              marketplaceCtx.setMktIsLoading(false);
            })
            .on('error', (error) => {
              console.log(error);
            });
        
        // Event offerCancelled subscription
        mktContract.events.OfferCancelled()
            .on('data', (event) => {
              marketplaceCtx.updateOffer(event.returnValues.offerId);
              collectionCtx.updateOwner(event.returnValues.id, event.returnValues.owner);
              marketplaceCtx.setMktIsLoading(false);
            })
            .on('error', (error) => {
              console.log(error);
            });
        
      } else {
        window.alert('ETHONFTMarketplace contract not deployed to detected network.')
      }
      
      collectionCtx.setNftIsLoading(false);
      marketplaceCtx.setMktIsLoading(false);
      
      // Metamask Event Subscription - Account changed
      window.ethereum.on('accountsChanged', (accounts) => {
        web3Ctx.loadAccount(web3);
        accounts[0] && marketplaceCtx.loadUserFunds(mktContract, accounts[0]);
      });
      
      // Metamask Event Subscription - Network changed
      window.ethereum.on('chainChanged', (chainId) => {
        window.location.reload();
      });
    };
    
    loadBlockchainData();
  }, []);
  
  const showNavbar = web3 && collectionCtx.contract && marketplaceCtx.contract;
  
  return (
      <div>
        <React.Fragment>
          {showNavbar && <Navbar />}
          <div className="container-fluid container-main bg-dark h">
            <div className="row text-white align-items-center">
              <div className="col-md">
                <img src={ethonft_minting} alt="Mint a NFT" width="100%"></img>
              </div>
            </div>
            <div className="row text-white align-items-center">
              <div className="col-md">

              </div>
              <div className="col-md">
                  <h1>
                      Minting an NFT
                  </h1>
                  {!collectionCtx.nftIsLoading && <MintForm />}
                {collectionCtx.nftIsLoading && <Spinner />}
              </div>
            </div>

          </div>
        
        </React.Fragment>
      </div>
  );
};

export {Homepage, Mintpage, App, MyNFTpage} ; //new

