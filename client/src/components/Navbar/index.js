import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import brand from './brand.svg';
import './navbar.css';



class Navbar extends Component {
  render() {
    return (
      <div className='navbar'>
        <img src={brand} className="brand" alt="NiftyNinja" />
      </div>
    )
  }
}

export default Navbar;