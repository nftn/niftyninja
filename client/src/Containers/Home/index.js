import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import TradeIcon from './TradeIcon.svg'
import './Home.css'

class Home extends Component {
  render () {
    return (
      <div className="home">
        <iframe 
          src="https://discordapp.com/widget?id=534516950647177228&theme=dark" 
          width="600" 
          height="600" 
          allowtransparency="true" 
          frameborder="0" 
          title="discord"
        />
        
      </div>
    )
  }
}
/*<img src={TradeIcon} alt="trade icon" />        
<Link className="start-trading" to="/trade">
  Start Trading
</Link>*/
export default Home;