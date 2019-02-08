import React, { Component } from 'react';
import group38 from './group-38.svg';
import group7 from './group-7.svg';
import './modal.css';

class TradeModal extends Component {
    state = {
        open: true
    }

    close = () => {
        // tell parent the modal is closed
        const { onClose } = this.props;
        if (onClose) onClose()
    }



    /* render functions used internally to display data when appropriate */
    renderUnlockRequest = () => {
        // get onunlocksubmit function from props to tell parent that the button was pressed
        const {onUnlockSubmit} = this.props;
        return ( 
            <div>
            <h3>Checking...</h3>
            <p>Please unlock this token for us friend: </p> 
            <div className="modal-box-img" >
            <img alt="NiftyNinja" src={group7}/>
            </div>
            <button className="modal-unlock-button" onClick={onUnlockSubmit}>Unlock</button>
            </div>
        )
    }

    renderConfirmRequest = () => {
        const {onConfirmSubmit} = this.props;
        return ( 
            <div>
            <h3>Checking...</h3>
            <p>We need you to sign the offer so 0x can validate the transaction when someone responds to it Trading <strong>78965</strong> for <strong>89652</strong></p>
            <div className="modal-box-img" >
            <img alt ="NiftyNinja" src={group38} /> </div>
            <button className="modal-unlock-button"   onClick={onConfirmSubmit}>Sign offer</button>
            </div>
        )
    }

    renderFillRequest = () => {
        const { onFillSubmit, want, have } = this.props;
        return ( 
            <div>
            <h3>Complete Order</h3>
            <p>Trading <strong>{have.id}</strong> for <strong>{want.id}</strong></p>
            <div className="modal-box-img" >
            <img alt ="NiftyNinja" src={group38} /> </div>
            <button className="modal-unlock-button"   onClick={onFillSubmit}>Complete</button>
            </div>
        )
    }

    renderStage = () => {
        const { stage } = this.props
        console.log(stage)
        switch (stage) {
            case 'unlock':
                return this.renderUnlockRequest();
            case 'confirm':
                return this.renderConfirmRequest()
            case 'fill':
                return this.renderFillRequest()
            default:
                return this.renderConfirmRequest()
        }
    }

    render() {
        const { waiting } = this.props
        return ( 
            <div className="modal-wrapper">
                <div className="modal-box" >
                    <button className="modal-close-button" onClick={ this.close }>X</button>{ this.renderStage() }
                    { waiting ? 'waiting for block to be mined...': ''}
                </div>
            </div>
        )
    }
    }

export default TradeModal;