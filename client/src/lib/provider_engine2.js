import { SignerSubprovider, RPCSubprovider, Web3ProviderEngine, MetamaskSubprovider } from '@0x/subproviders';
import { Web3Wrapper } from '@0x/web3-wrapper';

// Create a Web3 Provider Engine
const pe = new Web3ProviderEngine();

const provider = window.ethereum || (window.web3 && window.web3.currentProvider);


let web3Wrapper = new Web3Wrapper(provider), 
userAddress, 
enabled;
pe.addProvider(new MetamaskSubprovider(provider));
pe.addProvider(new RPCSubprovider('https://mainnet.infura.io/v3/a8145bcd5ba445bb918386a40c452b42'))
pe.start();

export const providerEngine = pe;

export const getAccount = () => web3Wrapper.getAvailableAddressesAsync().then(accts => accts[0]);
/*
export const startProvider = async () => {
  if (!provider) throw new Error('install')
  if (window.ethereum) {
    enabled = await window.ethereum.enable().then(() => true).catch(() => false);
  }
  else if (window.web3) {
    enabled = true;
  }
  if (!enabled) throw new Error('authorize')
  // Compose our Providers, order matters
  // Use the SignerSubprovider to wrap the browser extension wallet
  // All account based and signing requests will go through the SignerSubprovider
  providerEngine.addProvider(new MetamaskSubprovider(provider));

  // Use an RPC provider to route all other requests
  providerEngine.addProvider(new RPCSubprovider('https://mainnet.infura.io/v3/a8145bcd5ba445bb918386a40c452b42'))//'http://localhost:8545'));
  providerEngine.start();
  // Get all of the accounts through the Web3Wrapper
  
  userAddress = await web3Wrapper.getAvailableAddressesAsync().then(accts => accts[0]);
  return providerEngine
}*/

// window.niftyProvider = window.niftyProvider || startProvider().then(window.niftyProvider = { done: true})


export const getWeb3Wrapper = () => web3Wrapper;
export const isEnabled = () => enabled;