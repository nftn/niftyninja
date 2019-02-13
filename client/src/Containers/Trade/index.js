import React, { Component, Fragment, useRef } from 'react';

import KittyCard from '../../components/KittyCard'

import { getTrade, setOrder, tellOrderFilled } from '../../lib/api'
import { enableMetaMask } from '../../lib/metamask'
import { approveAsync, signOrder, awaitTransactionMined, createOrder, userOwnsToken, fillOrder, generatePRSalt, isProxyApproved } from '../../lib/zero'
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
    modalWaiting: false,
    submitted: false,
    complete: false,
    copySuccess: null
  }

  tradeLink = null

  componentDidMount = async () => {
    const { match: { params: { tradeId } } } = this.props;
    if (tradeId) {
      const resp = await getTrade(tradeId)
      let { data: { have, want, order, txReceipt }, success } = resp;
      if (order) {
        Object.keys(order).map((key, i) => {
          if (typeof order[key] === 'number') order[key] = new BigNumber(order[key])
        })
      }
      if (txReceipt) order.txReceipt = txReceipt;
      console.log(have, want)
      let loaded = false;
      if (have && want) loaded = true;
      else alert(resp.data)
      console.log(order)
      const complete = order && order.txReceipt !== undefined;
      this.setState({have, want, loaded, order, tradeId, complete})
    }
  }

  setAuthInfo = async () => {
    await enableMetaMask();
    let isMaker = false, canTrade = false;
    const { order, have, want, } = this.state
    const haveTokenId = have.id;
    const tokenOwned = await userOwnsToken(haveTokenId)
    console.log('user owns token? ', tokenOwned)
    isMaker = tokenOwned;
    if (!order) {
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
    }
    this.setState({ isMaker, canTrade, order, })
  }

  handleUnlockSubmit = async () => {
    try {
      console.log('unlocked')
    const { order, have, want, tradeId, isMaker, canTrade } = this.state
    const tokenId = isMaker ? have.id : want.id;
    console.log(tokenId)
    const approveTxHash = await approveAsync(tokenId);
    console.log(approveTxHash)
    this.setState({ modalWaiting: true })
    await awaitTransactionMined(approveTxHash);
    this.setState({ modalWaiting: false, modalStage: isMaker ? 'confirm' : 'fill' })
    } catch(e) {console.log(e)}
  }

  handleConfirmSubmit = async () => {
    const { have, want, tradeId, isMaker, canTrade } = this.state
    const haveTokenId = have.id;
    const wantTokenId = want.id;
    const order = await createOrder( haveTokenId, wantTokenId )
    const signedOrder = await signOrder(order)
    const resp = await setOrder(signedOrder, tradeId)
    this.setState({ order: signedOrder })
    if (resp.success) console.log('success! server received signed order')
    else {
      console.log('failed for some reason, error message printed to console')
    }
    this.setState({ modalWaiting: false, showModal: false, canTrade: false, submitted: true })
  }

  handleClose = () => {
    this.setState({ showModal: false })
  }

  handleFillSubmit = async () => {
    const { order, have, want, tradeId, isMaker, canTrade } = this.state
    const fillTxHash = await fillOrder(order, have.id, want.id)
    this.setState({ modalWaiting: true })
    const txReceipt = await awaitTransactionMined(fillTxHash);
    console.log(txReceipt)
    await tellOrderFilled(tradeId, txReceipt)
    const signedOrder = { ...order, txReceipt }
    this.setState({ modalWaiting: false, showModal: false, canTrade: false, order: signedOrder })
  }

  renderLink = () => {
    const { submitted, tradeId, copySuccess } = this.state
    if (!submitted) return ''
    return (<div className='link-container'>
      <h1>Almost there...</h1>
      <p>Your order has been posted to the NiftyNinja discord. Alternatively, send this link to the counterparty to complete the trade!</p>
      <div className="link-box">
        <div className="text-wrap">
          <textarea spellCheck="false" ref={(tradeLink) => this.tradeLink = tradeLink} value={`http://niftyninja.io/trade/${tradeId}`} />
          <div id="copyToClipboard-a" class="clipboard icon" onClick={this.copyToClipboard}></div>
        </div>
        <button onClick={this.copyToClipboard} className={copySuccess ? 'copied' : ''}>
          {copySuccess ? 'Link Copied ' : 'Copy link'}
        </button>
      </div>
    </div>)
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
    const isApproved = await isProxyApproved(isMaker ? have.id : want.id) // currently not working
    console.log('is approved?', isApproved)
    this.setState({ showModal: true, modalStage: isApproved ? (isMaker ? 'confirm' : 'fill') : 'unlock'})
  }

  renderTradeButton = () => {
    const { canTrade, isMaker } = this.state;
    if (!canTrade) return ""
    const btnText = isMaker ? "Create Trade" : "Complete Trade"
    return (
      <button onClick={this.submitTrade}>
        {btnText}!
      </button>
    )
  }

  renderKitties = () => {
    const { order, have, want } = this.state;
    const makerKittyLocked  = !order;
    const takerKittyLocked = !order || !order.txReceipt;
    if (this.state.loaded) {
      return <Fragment>
        <KittyCard cat={have} have locked={makerKittyLocked} />
        <div className="transfer-box">
          <img src={TransferIcon} alt="transfer" />
          {this.renderTradeButton()}
        </div>
        <KittyCard cat={want} locked={takerKittyLocked} />
      </Fragment>
    }
    else return "";
  }

  copyToClipboard = (e) => {
    this.tradeLink.select();
    document.execCommand('copy');
    // This is just personal preference.
    // I prefer to not show the the whole text area selected.
    e.target.focus();
    this.setState({ copySuccess: 'Copied!' });
  };

  checkOwner = () => {
    const {have, want} = this.state;
    userOwnsToken(have.id).then(b => `user owns ${have.id} : ${b}`)
    userOwnsToken(want.id).then(b => `user owns ${want.id} : ${b}`)
  }

  render () {
    const {tradeId} = this.state;
    if (this.state.loaded && this.state.canTrade == null) this.setAuthInfo();
    return (
      <div className="trade">
        {this.renderModal()}
        {
          this.state.submitted 
            ? 
              this.renderLink() 
            : 
            <Fragment>
              <h1>Trade #{tradeId}</h1>
              <div className="kitty-container">
                {this.renderKitties()}
              </div>
            </Fragment>
        }
      </div>
    )
  }
}

export default Trade;
