import React, {Component} from 'react'
import './KittyCard.css'

class KittyCard extends Component {
  render() {
    const { cat: { id, imgUrl, name }, have, locked } = this.props;
    console.log(id, imgUrl, have)
    return (
      <div className={locked ? 'kitty-box locked' : 'kitty-box unlocked'}>
        
        <div className="kitty-box-content">
          <h3>{ have ? "Trading" : "Trading For"} <span className="kitty-id">{id}</span></h3>
          <div className="kitty-card">
            <div className="kitty-avatar">
            <div className="overlay"></div>
              <img className="kitty-img" src={imgUrl} alt="loading..." />
            </div>
            <div className="kitty-info">
              <h4>{name}</h4>
              <h5>#{id}</h5>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default KittyCard;