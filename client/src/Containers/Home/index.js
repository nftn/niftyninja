import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import TradeIcon from './TradeIcon.svg'
import './Home.css'

class Home extends Component {
  render () {
    return (
      <div class="home">
        <img src={TradeIcon} alt="trade icon" />
        <h1>Join our Discord server to try out our beta!</h1>        
        <a className="start-trading" href="https://discord.gg/U3xNfDz" target="_blank">
          Start Trading
        </a>
      </div>
    )
  }
}

export default Home;