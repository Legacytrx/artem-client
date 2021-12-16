import { useContext, useRef, createRef, useEffect, useState } from 'react';
import ReactPaginate from 'react-paginate';


import web3 from '../../../connection/web3';
import Web3Context from '../../../store/web3-context';
import CollectionContext from '../../../store/collection-context';
import MarketplaceContext from '../../../store/marketplace-context';
import { formatPrice } from '../../../helpers/utils';
import eth from '../../../img/eth.png';
import './NFTCollection.css';

// Example items, to simulate fetching from another resources.
const items = [1,2,3,4,5,6,7,8,9,10];

function Items({ currentItems }) {
    console.log("Curr: ",JSON.stringify(currentItems));
    const web3Ctx = useContext(Web3Context);
    const collectionCtx = useContext(CollectionContext);
    const marketplaceCtx = useContext(MarketplaceContext);
    const priceRefs = useRef([]);
    if (priceRefs.current.length !== collectionCtx.collection.length) {
        priceRefs.current = Array(collectionCtx.collection.length).fill().map((_, i) => priceRefs.current[i] || createRef());
    }
    
    for (let i=1; i<=collectionCtx.collection.length;i++) {
        items[i-1]=i;
    }
    
    const makeOfferHandler = (event, id, key) => {
        event.preventDefault();
        
        const enteredPrice = web3.utils.toWei(priceRefs.current[key].current.value, 'ether');
        
        collectionCtx.contract.methods.approve(marketplaceCtx.contract.options.address, id).send({ from: web3Ctx.account })
            .on('transactionHash', (hash) => {
                marketplaceCtx.setMktIsLoading(true);
            })
            .on('receipt', (receipt) => {
                marketplaceCtx.contract.methods.makeOffer(id, enteredPrice).send({ from: web3Ctx.account })
                    .on('error', (error) => {
                        window.alert('Something went wrong when pushing to the blockchain');
                        marketplaceCtx.setMktIsLoading(false);
                    });
            });
    };
    
    const buyHandler = (event) => {
        const buyIndex = parseInt(event.target.value);
        marketplaceCtx.contract.methods.fillOffer(marketplaceCtx.offers[buyIndex].offerId).send({ from: web3Ctx.account, value: marketplaceCtx.offers[buyIndex].price })
            .on('transactionHash', (hash) => {
                marketplaceCtx.setMktIsLoading(true);
            })
            .on('error', (error) => {
                window.alert('Something went wrong when pushing to the blockchain');
                marketplaceCtx.setMktIsLoading(false);
            });
    };
    
    const cancelHandler = (event) => {
        const cancelIndex = parseInt(event.target.value);
        marketplaceCtx.contract.methods.cancelOffer(marketplaceCtx.offers[cancelIndex].offerId).send({ from: web3Ctx.account })
            .on('transactionHash', (hash) => {
                marketplaceCtx.setMktIsLoading(true);
            })
            .on('error', (error) => {
                window.alert('Something went wrong when pushing to the blockchain');
                marketplaceCtx.setMktIsLoading(false);
            });
    };
    
    
    return (
      <>
      <div className="justify-content-center row text-center d-flex align-items-end">
          <h1 className="text-white">Etho protocol NFTs</h1>
        {currentItems && collectionCtx.collection.slice(currentItems[0]-1,currentItems[currentItems.length-1]).map((NFT, key) => {
                const index = marketplaceCtx.offers ? marketplaceCtx.offers.findIndex(offer => offer.id === NFT.id) : -1;
                const owner = index === -1 ? NFT.owner : marketplaceCtx.offers[index].user;
                const price = index !== -1 ? formatPrice(marketplaceCtx.offers[index].price).toFixed(2) : null;
        
        
                return(
                    <div key={key} className="col-md-2 m-3 pb-3 card border-info">
                        <div className={"card-body"}>
                            <h5 className="card-title">{NFT.title}</h5>
                            <p>{NFT.description}</p>
                        </div>
                        <img src={`https://ipfs.infura.io/ipfs/${NFT.img}`} className="card-img-bottom" alt={`NFT ${key} not on ethofs yet, please wait.`} />
                        <p className="fw-light fs-6">Owner: {`${owner.substr(0,7)}...${owner.substr(owner.length - 7)}`}</p>
                        <p className="card-text"><a href={`https://data.ethoprotocol.com/ipfs/${NFT.img}`} target="_blank" rel="noreferrer">HOSTED ON ETHOFS</a></p>
                        {index !== -1 ?
                            owner !== web3Ctx.account ?
                                <div className="row">
                                    <div className="d-grid gap-2 col-5 mx-auto">
                                        <button onClick={buyHandler} value={index} className="btn btn-success">BUY</button>
                                    </div>
                                    <div className="col-7 d-flex justify-content-end">
                                        <img src={eth} width="25" height="25" className="align-center float-start" alt="price icon"></img>
                                        <p className="text-start"><b>{`${price}`}</b></p>
                                    </div>
                                </div> :
                                <div className="row">
                                    <div className="d-grid gap-2 col-5 mx-auto">
                                        <button onClick={cancelHandler} value={index} className="btn btn-danger">CANCEL</button>
                                    </div>
                                    <div className="col-7 d-flex justify-content-end">
                                        <img src={eth} width="25" height="25" className="align-center float-start" alt="price icon"></img>
                                        <p className="text-start"><b>{`${price}`}</b></p>
                                    </div>
                                </div> :
                            owner === web3Ctx.account ?
                                <form className="row g-2" onSubmit={(e) => makeOfferHandler(e, NFT.id, key)}>
                                    <div className="col-5 d-grid gap-2">
                                        <button type="submit" className="btn btn-secondary">PUT ON SALE</button>
                                    </div>
                                    <div className="col-7">
                                        <input
                                            type="number"
                                            step="0.01"
                                            placeholder="ETHO..."
                                            className="form-control"
                                            ref={priceRefs.current[key]}
                                        />
                                    </div>
                                </form> :
                                <p><br/></p>}
                    </div>
                );
            })}
      </div>
      </>
  );
}



function NFTCollection({ itemsPerPage }) {
  
  // We start with an empty list of items.
  const [currentItems, setCurrentItems] = useState(null);
  const [pageCount, setPageCount] = useState(0);
  // Here we use item offsets; we could also use page offsets
  // following the API or data you're working with.
  const [itemOffset, setItemOffset] = useState(0);
  
  useEffect(() => {
    // Fetch items from another resources.
    const endOffset = itemOffset + itemsPerPage;
    console.log(`Loading items from ${itemOffset} to ${endOffset}`);
    setCurrentItems(items.slice(itemOffset, endOffset));
    setPageCount(Math.ceil(items.length / itemsPerPage));
  }, [itemOffset, itemsPerPage]);
  
  // Invoke when user click to request another page.
  const handlePageClick = (event) => {
    const newOffset = (event.selected * itemsPerPage) % items.length;
    console.log(
        `User requested page number ${event.selected}, which is offset ${newOffset}`
    );
    setItemOffset(newOffset);
  };
  
  return(
      <>
      <div className="d-flex justify-content-center">
      <ReactPaginate
              nextLabel="next >"
              onPageChange={handlePageClick}
              pageRangeDisplayed={3}
              marginPagesDisplayed={2}
              pageCount={pageCount}
              previousLabel="< previous"
              pageClassName="page-item"
              pageLinkClassName="page-link"
              previousClassName="page-item"
              previousLinkClassName="page-link"
              nextClassName="page-item"
              nextLinkClassName="page-link"
              breakLabel="..."
              breakClassName="page-item"
              breakLinkClassName="page-link"
              containerClassName="pagination"
              activeClassName="active"
              renderOnZeroPageCount={null}
          />
              </div>
          <Items currentItems={currentItems} />
      </>

  );
}



export default NFTCollection;
