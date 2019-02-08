import React, {Component} from 'react'
import './KittyCard.css'

class KittyCard extends Component {
  render() {
    const { cat: { id, imgUrl }, have } = this.props;
    console.log(id, imgUrl, have)
    return (
      <div className="kitty-box">
        <h3>{ have ? "Trading" : "Trading For"} <span className="kitty-id">{id}</span></h3>
        <div className="kitty-card">
          <div className="kitty-avatar">
            <img className="kitty-img" src={imgUrl + '.png'} alt="loading..." />
          </div>
          <div className="kitty-info">
            <h4>Kitty Name</h4>
            <h5>#{id}</h5>
          </div>
        </div>
      </div>
    )
  }
}

export default KittyCard;