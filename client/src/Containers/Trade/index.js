import React, { Component, Fragment } from 'react';

import KittyCard from '../../components/KittyCard'

import { getTrade, setOrder, tellOrderFilled } from '../../lib/api'
import { approveAsync, signOrder, awaitTransactionMined, createOrder, userOwnsToken, fillOrder, generatePRSalt,  } from '../../lib/zero'
// doDummyTx, mintToken

import TradeModal from '../TradeModal'

import './Trade.css'
import TransferIcon from './TransferIcon.svg'
import { BigNumber } from '0x.js';

class Trade extends Component {
  state = { 
    have: {}, 
    want: {}, 
    loaded: false, 
    order: null, 
    tradeId: null, 
    canTrade: null, 
    isMaker: null,
    showModal: false,
    modalStage: '',
    modalWaiting: false
  }

  componentDidMount = async () => {
    const { match: { params: { tradeId } } } = this.props;
    if (tradeId) {
      const resp = await getTrade(tradeId)
      let { data: { have, want, order }, success } = resp;
      if (order) {
        Object.keys(order).map((key, i) => {
          if (typeof order[key] === 'number') order[key] = new BigNumber(order[key])
        })
      }
      console.log(have, want)
      let loaded = false;
      if (have && want) loaded = true;
      else alert(resp.data)
      console.log(order)
      this.setState({have, want, loaded, order, tradeId})
    }
  }

  setAuthInfo = async () => {
    if (!window.niftyProvider.done) await window.niftyProvider.catch(e => {
      if (e.message === 'authorize') alert('you must authorize the website to use metamask to use that function')
      else if (e.message === 'install') alert('you must install metamask to use that function')
      else alert('unkown error, logged to console')
      console.error(e)
      return;
    })
    let isMaker = false, canTrade = false;
    const { order, have, want, tradeId, } = this.state
    if (!order) {
      const haveTokenId = have.id;
      const tokenOwned = await userOwnsToken(haveTokenId)
      console.log('user owns token? ', tokenOwned)
      isMaker = tokenOwned;
      canTrade = isMaker;
    }
    else {
      const wantTokenId = want.id;
      canTrade = await userOwnsToken(wantTokenId)
      if (canTrade) {
        Object.keys(order).map((key, i) => {
          if (typeof order[key] === 'number') order[key] = new BigNumber(order[key])
        })
      }
      /*if (canTrade) {
        
      }*/
    }
    this.setState({ isMaker, canTrade, order })
  }

  handleUnlockSubmit = async () => {
    console.log('unlocked')
    const { order, have, want, tradeId, isMaker, canTrade } = this.state
    const tokenId = isMaker ? have.id : want.id;
    const approveTxHash = await approveAsync(tokenId);
    this.setState({ modalWaiting: true})
    await awaitTransactionMined(approveTxHash);
    this.setState({ modalWaiting: false, modalStage: isMaker ? 'confirm' : 'fill'})
  }

  handleConfirmSubmit = async () => {
    const { have, want, tradeId, isMaker, canTrade } = this.state
    const haveTokenId = have.id;
    const wantTokenId = want.id;
    const order = createOrder( haveTokenId, wantTokenId )
    alert('please sign the order')
    const signedOrder = await signOrder(order)
    const resp = await setOrder(signedOrder, tradeId)
    if (resp.success) console.log('success! server received signed order')
    else {
      console.log('failed for some reason, error message printed to console')
    }
    this.setState({ modalWaiting: false, showModal: false})
  }

  handleClose = () => {
    this.setState({ showModal: false })
  }

  handleFillSubmit = async () => {
    const { order, have, want, tradeId, isMaker, canTrade } = this.state
    const fillTxHash = await fillOrder(order)
    this.setState({ modalWaiting: true })
    const txReceipt = await awaitTransactionMined(fillTxHash);
    console.log(txReceipt)
    const resp = await tellOrderFilled(tradeId, txReceipt)
    this.setState({ modalWaiting: false, showModal: false})

  }

  renderModal = () => {
    console.log(this.state)
    if (this.state.showModal) {
      return (<TradeModal 
        onConfirmSubmit={this.handleConfirmSubmit} 
        onClose={this.handleClose}
        onUnlockSubmit={this.handleUnlockSubmit}
        onFillSubmit={this.handleFillSubmit}
        stage={this.state.modalStage}
        want={this.state.want}
        have={this.state.have}
        waiting={this.state.modalWaiting}
      />)
    }
    else return ''
  }

  submitTrade = async () => {
    const { order, have, want, tradeId, isMaker, canTrade } = this.state
    if (!canTrade) {
      alert('sorry, you do not own either token in this trade')
      return;
    }
    /*if (isMaker)*/
     this.setState({ showModal: true, modalStage: 'unlock'})
    //else this.setState({ showModal: true, modalStage: 'fill'})
    /*
    if (isMaker) {
      const haveTokenId = have.id;
      const wantTokenId = want.id;
      alert('please give the 0x exchange access to your token')
      const approveTxHash = await approveAsync(haveTokenId);
      alert('thank you! waiting for block to be mined...')
      await awaitTransactionMined(approveTxHash);
      alert('block mined, please sign the order')
      const order = createOrder( haveTokenId, wantTokenId )
      alert('please sign the order')
      const signedOrder = await signOrder(order)
      alert('thank you! submitting signed order to api')
      const resp = await setOrder(signedOrder, tradeId)
      console.log(resp.data)
      if (resp.success) alert('success! server received signed order')
      else {
        alert('failed for some reason, error message printed to console')
      }
    }
    else {
      // order exists, user owns taker token
      alert('please approve the transaction')
      const fillTxHash = await fillOrder(order)
      alert('thank you! waiting for block to be mined')
      const txReceipt = await awaitTransactionMined(fillTxHash);
      alert('block mined, your token has been traded!')
      const resp = await tellOrderFilled(tradeId, txReceipt)
      console.log(resp)
      alert('told server the order is finished, thank you!')
    }*/

  }

  renderTradeButton = () => {
    const { canTrade, isMaker } = this.state;
    if (!canTrade) return ""
    const btnText = isMaker ? "Create Trade" : "Fill Trade"
    return (
      <button onClick={this.submitTrade}>
        {btnText}!
      </button>
    )
  }

  renderKitties = () => {
    if (this.state.loaded) {
      const {have, want} = this.state;
      return <Fragment>
        <KittyCard cat={have} have />
        <div className="transfer-box">        
          <h4>for</h4>
          <img src={TransferIcon} alt="transfer" />
          {this.renderTradeButton()}
        </div>
        <KittyCard cat={want} />
      </Fragment>
    }
    else return "";
  }
  /*
  makeToken = async () => {
    console.log('gonna mint I swear')
    const tokenId = 1092;
    const mintTxHash = await mintToken(tokenId)
    console.log(mintTxHash)
    alert('made mint tx')
    await awaitTransactionMined(mintTxHash);
    console.log('token id', tokenId)
    alert(`${tokenId} minted and mined`)

    <button onClick={this.makeToken}>Create Test Token</button>
  }*/

  checkOwner = () => {
    const {have, want} = this.state;
    userOwnsToken(have.id).then(b => `user owns ${have.id} : ${b}`)
    userOwnsToken(want.id).then(b => `user owns ${want.id} : ${b}`)
  }

  render () {
    if (this.state.loaded && this.state.canTrade == null) this.setAuthInfo();
    return (
      <div className="trade">
        <h1>Trade</h1>
        {this.renderModal()}
        <div className="kitty-container">
          {this.renderKitties()}
        </div>
      </div>
    )
  }
}

export default Trade;
