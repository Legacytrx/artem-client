import { useContext  } from 'react';

import NFTCollection from './NFTCollection/NFTCollection';
import MyNFTCollection from './NFTCollection/MyNFTCollection';
import MarketplaceContext from '../../store/marketplace-context';
import Spinner from '../Layout/Spinner';

const Main = () => {
  const marketplaceCtx = useContext(MarketplaceContext);
  
  return(
      <div className="container-fluid mt-2 bg-dark">
        {!marketplaceCtx.mktIsLoading && <NFTCollection itemsPerPage={4} />}
        {marketplaceCtx.mktIsLoading && <Spinner />}
      </div>
  );
};

const MyNFT = () => {
  const marketplaceCtx = useContext(MarketplaceContext);
  
  return(
      <div className="container-fluid mt-2 bg-dark">
        {!marketplaceCtx.mktIsLoading && <MyNFTCollection />}
        {marketplaceCtx.mktIsLoading && <Spinner />}
      </div>
  );
};


export {Main, MyNFT};