const {
  assetDataUtils,
  BigNumber,
  ContractWrappers,
  generatePseudoRandomSalt,
  Order,
  orderHashUtils,
  signatureUtils,
} = require('0x.js');

console.log('loaded')
const { fromRpcSig, ecrecover } = require('ethereumjs-util')



const contractAddr = '0x06012c8cf97BEaD5deAe237070F9587f8E7A266d';

const checkOrderAssets = async(trade) => {
  const { order, have, want } = trade;
  const makerTokenId = new BigNumber(have.id)
  const takerTokenId = new BigNumber(want.id)
  const { makerAssetData, takerAssetData } = order;
  const validMakerAsset = makerAssetData == assetDataUtils.encodeERC721AssetData(contractAddr, new BigNumber(makerTokenId));
  const validTakerAsset = takerAssetData == assetDataUtils.encodeERC721AssetData(contractAddr, new BigNumber(takerTokenId));
}

const stripHexPrefix = (str) => str.replace('0x', '')

const checkOrderSignature = async (signedOrder) => {
  const orderHashHex = orderHashUtils.getOrderHashHex(order);
  const { signature, ...order } = signedOrder;
  const { makerAddress } = order;
  const [ v, r, s ] = [[0, 1], [1, 32], [33, 32 ]].map(([ idx, length ], i) => i === 0 ? Number('0x' + stripHexPrefix(signature).substr(idx, length)) : toBuffer('0x' + stripHexPrefix(signature).substr(idx, length)));
  const a = ecrecover(orderHashHex, v, r, s)
  console.log(a)
}


module.exports = {
  checkOrderSignature
}