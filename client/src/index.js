import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';

ReactDOM.render(<App />, document.getElementById('root'));

if (window.ethereum) {
  const web3 = new window.Web3(window.ethereum);
  try { 
     window.ethereum.enable().then(function() {
         // User has allowed account access to DApp...
     });
  } catch(e) {
     // User has denied account access to DApp...
  }
}

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
