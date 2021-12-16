import ReactDOM from 'react-dom';
import 'bootstrap/dist/css/bootstrap.css';

import Web3Provider from './store/Web3Provider';
import CollectionProvider from './store/CollectionProvider';
import MarketplaceProvider from './store/MarketplaceProvider';

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import {Homepage, App, Mintpage, MyNFTpage} from './App'; //new


ReactDOM.render(
  <Web3Provider>
    
      <CollectionProvider>
      <MarketplaceProvider>
          <Router>
              <Routes>
                  <Route exact path="/" element={<Homepage/>}/>
                  <Route exact path="/explore" element={<App/>}/>
                  <Route exact path="/mint" element={<Mintpage/>}/>
                  <Route exact path="/mynft" element={<MyNFTpage/>}/>
              </Routes>
          </Router>

      </MarketplaceProvider>
    </CollectionProvider>
  </Web3Provider>, 
  document.getElementById('root')
);



