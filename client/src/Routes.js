import React, { Component } from 'react'
import { Route, Switch, Redirect } from 'react-router-dom';

import Navbar from './components/Navbar'
import Home  from './Containers/Home'
import Trade from './Containers/Trade'

export const Routes = () => <div>
  <Navbar />
  <Switch>
    <Route exact path="/" component={Home} />
    <Route path="/trade/:tradeId?" component={Trade} />
  </Switch>
</div>