import React, { Component } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { Routes } from './Routes';
// import { getWeb3, initialize as initWeb3 } from './lib/web3'
// import './lib/zerox'



// import { doDummyTx } from './lib/zero'
import logo from './logo.svg';
import './App.css';

class App extends Component {
  
  render() {
    return (
      <div className="App">
        <Router>
          <Routes />
        </Router>
      </div>
    );
  }
}

export default App;
