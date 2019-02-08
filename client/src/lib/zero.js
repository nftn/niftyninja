import {
  assetDataUtils,
  BigNumber,
  ContractWrappers,
  generatePseudoRandomSalt,
  Order,
  orderHashUtils,
  signatureUtils,
} from '0x.js';
import { Web3Wrapper } from '@0x/web3-wrapper';

import { NETWORK_CONFIGS, TX_DEFAULTS } from './configs';
import { DECIMALS, NULL_ADDRESS, ZERO, TEN_MINUTES_MS, ONE_SECOND_MS, CRYPTO_KITTY_CORE_ADDRESS, ONE_DAY_MS } from './constants';
import { contractAddresses,  } from './contracts'; // dummyERC721TokenContracts

import { getAccount, getWeb3Wrapper, getProviderEngine } from './provider_engine';
// import { start } from 'repl';

export const generatePRSalt = () => generatePseudoRandomSalt();

const getRandomFutureDateInSeconds = () => {
  return new BigNumber(Date.now() + TEN_MINUTES_MS * 6).div(ONE_SECOND_MS).integerValue()
};

/*
const timeOut = (ms) => new Promise((resolve) => setTimeout(() => resolve(), ms))

let providerReady = false;
export const providerReadyAsync = () => new Promise((resolve, reject) => {

})
*/
const providerEngine = getProviderEngine();
const contractWrappers = new ContractWrappers(providerEngine, { networkId: NETWORK_CONFIGS.networkId });

const erc721Proxy = contractAddresses.erc721Proxy;
const erc721Wrapper = contractWrappers.erc721Token;

/*
const dummyERC721TokenContract = dummyERC721TokenContracts[0];
if (!dummyERC721TokenContract) {
  console.log('No Dummy ERC721 Tokens deployed on this network');
}*/
const contractAddr = CRYPTO_KITTY_CORE_ADDRESS // contractAddr;

/*
export const mintToken = async (tokenId) => {
  console.log(tokenId)
  const address = getAccount();
  console.log(address)
  const txHash = await dummyERC721TokenContract.mint.sendTransactionAsync(address, tokenId, { from: address });
  console.log(txHash)
  return txHash;
}*/

export const userOwnsToken = async (tokenId) => {
  const address = getAccount();
  const owner = await erc721Wrapper.getOwnerOfAsync(contractAddr, new BigNumber(tokenId))
  console.log(`${address} | ${tokenId} - owner: ${owner}`)
  return owner === address;
}

export const approveAsync = async (tokenId) => {
  // const maker = getAccount();
  const txHash = await erc721Wrapper.setProxyApprovalAsync(
    contractAddr, // token address
    new BigNumber(tokenId)
  )
  return txHash;
  /*
  
  
  return contractWrappers.erc721Token.setProxyApprovalForAllAsync(
    contractAddr,
    // '0x06012c8cf97BEaD5deAe237070F9587f8E7A266d',
    maker,
    true,
  );
  */
}

export const signOrder = async (order) => {
  console.log(order)
  const maker = getAccount();
  const orderHashHex = orderHashUtils.getOrderHashHex(order);
  console.log('order hash', orderHashHex)
  const signature = await signatureUtils.ecSignHashAsync(providerEngine, orderHashHex, maker);
  console.log('order signature', signature)
  return { ...order, signature };
}

export const fillOrder = async (signedOrder) => {
  const taker = getAccount();
  console.log(taker)
  console.log('get signed order')
  //let { signature, ...order } = signedOrder;
  console.log(signedOrder)
  signedOrder.expirationTimeSeconds = new BigNumber(signedOrder.expirationTimeSeconds)
  signedOrder.makerAssetAmount = new BigNumber(1);
  signedOrder.takerAssetAmount = new BigNumber(1);
  const takerAssetAmount = new BigNumber(1);
  signedOrder.makerFee = ZERO;
  signedOrder.takerFee = ZERO;
  signedOrder.salt = new BigNumber(signedOrder.salt)
  console.log(signedOrder)
  const txHash = await contractWrappers.exchange.fillOrderAsync(signedOrder, takerAssetAmount, taker, { gasLimit: 150000 });
  return txHash;
}

export const awaitTransactionMined = async (txHash) => {
  const web3Wrapper = getWeb3Wrapper();
  try {
    const receipt = await web3Wrapper.awaitTransactionMinedAsync(txHash);
    return receipt;
  } catch (e) {
    throw e;
  }
}

export const createOrder = ( makerTokenId, takerTokenId ) => {
  console.log(makerTokenId, takerTokenId)
  const makerAddress = getAccount();
  const randomExpiration = getRandomFutureDateInSeconds();
  const makerAssetAmount = new BigNumber(1);
  const takerAssetAmount = new BigNumber(1);
  const makerAssetData = assetDataUtils.encodeERC721AssetData(contractAddr, new BigNumber(makerTokenId));
  const takerAssetData = assetDataUtils.encodeERC721AssetData(contractAddr, new BigNumber(takerTokenId));
  const exchangeAddress = contractAddresses.exchange;
  const order = {
    exchangeAddress,
    makerAddress,
    takerAddress: NULL_ADDRESS,
    senderAddress: NULL_ADDRESS,
    feeRecipientAddress: NULL_ADDRESS,
    expirationTimeSeconds: randomExpiration,
    salt: generatePseudoRandomSalt(),
    makerAssetAmount,
    takerAssetAmount,
    makerAssetData,
    takerAssetData,
    makerFee: ZERO,
    takerFee: ZERO,
  };
  console.log(order)
  return order;
}

/*
ORDER OF OPERATIONS
1. Maker approves 0x erc721 address to control token
2. Maker creates order
3. Maker signs order
4. Taker approves 0x erc721 address to control token
5. Taker fills order
*/
/*
export const doDummyTx = async () => {
  if (!dummyERC721TokenContract) {
      console.log('No Dummy ERC721 Tokens deployed on this network');
      return;
  }
  const web3Wrapper = getWeb3Wrapper();
  console.log(web3Wrapper)
  const addresses = await web3Wrapper.getAvailableAddressesAsync();
  console.log(addresses)
  const [maker, taker] = addresses
  const tokenId1 = generatePseudoRandomSalt(); // new BigNumber(1342629);
  const tokenId2 = generatePseudoRandomSalt();
  // '0x06012c8cf97BEaD5deAe237070F9587f8E7A266d'
  const makerAssetAmount = new BigNumber(1);
  const takerAssetAmount = new BigNumber(1);
  const makerAssetData = assetDataUtils.encodeERC721AssetData(contractAddr, tokenId1);
  const takerAssetData = assetDataUtils.encodeERC721AssetData(contractAddr, tokenId2);
  let txHash;
  console.log('MINTING TOKEN')
  const mintTxHash1 = await dummyERC721TokenContract.mint.sendTransactionAsync(maker, tokenId1, { from: maker });
  console.log('TOKEN 1 MINT TX HASH', mintTxHash1)
  // const mintTxHash2 = await dummyERC721TokenContract.mint.sendTransactionAsync(taker, tokenId2, { from: taker });
  // console.log('TOKEN 2 MINT TX HASH', mintTxHash2)
  
  console.log('APPROVING TRANSFER OF MAKER TOKEN')
  const makerERC721ApprovalTxHash = await contractWrappers.erc721Token.setProxyApprovalForAllAsync(
    contractAddr,
    // '0x06012c8cf97BEaD5deAe237070F9587f8E7A266d',
    maker,
    true,
  );

  console.log('MAKER APPROVAL TX HASH', makerERC721ApprovalTxHash);
  
  // console.log('APPROVING TRANSFER OF TAKER TOKEN')
  // const takerERC721ApprovalTxHash = await contractWrappers.erc721Token.setProxyApprovalForAllAsync(
    //contractAddr,
    // '0x06012c8cf97BEaD5deAe237070F9587f8E7A266d',
    //taker,
    //true,
  //);
  //console.log('TAKER APPROVAL TX HASH', takerERC721ApprovalTxHash);
  
  const randomExpiration = getRandomFutureDateInSeconds();
  const exchangeAddress = contractWrappers.exchange.address;//contractAddresses.exchange;
  const order = {
    exchangeAddress,
    makerAddress: maker,
    takerAddress: NULL_ADDRESS,
    senderAddress: NULL_ADDRESS,
    feeRecipientAddress: NULL_ADDRESS,
    expirationTimeSeconds: randomExpiration,
    salt: generatePseudoRandomSalt(),
    makerAssetAmount,
    takerAssetAmount,
    makerAssetData,
    takerAssetData,
    makerFee: ZERO,
    takerFee: ZERO,
  };
  console.log('ORDER', order)
  const orderHashHex = orderHashUtils.getOrderHashHex(order);
  console.log('ORDER HASH', orderHashHex)
  const signature = await signatureUtils.ecSignHashAsync(providerEngine, orderHashHex, maker);
  console.log('ORDER SIGNATURE', signature)
  const signedOrder = { ...order, signature };

}

*/
