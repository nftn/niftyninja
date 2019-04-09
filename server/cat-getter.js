'use strict';
const { XMLHttpRequest } = require('xmlhttprequest');

const INFURA_TOKEN = '-';

// web3-utils#soliditySha3('getKitty(uint256)') first 4 bytes (8 hex chars)
const GET_KITTY_SIGNATURE = 'e98b7f4d';


const KITTY_FIELDS = [
  'isGestating',
  'isReady',
  'cooldownIndex',
  'nextActionAt',
  'siringWithId',
  'birthTime',
  'matronId',
  'sireId',
  'generation',
  'genes',
];

const zipObject = (fields, data) => fields.reduce((r, v, i) => {
  r[v] = data[i];
  return r;
}, {});

const addHexPrefix = (s) => s.substr(0, 2).toLowerCase() === '0x' ? s : '0x' + s;

const padLeftZero = (s, n) => Array(Math.max(n - s.length + 1, 1)).join('0') + s;

/*
  generateKittyFetchImpl
    params:
      XMLHttpRequest: just pass in window.XMLHttpRequest if you're in the browser, see the test suite for what to do in node
      network: this can be whatever network you want, probably 'mainnet'
      ckAddress: address of cryptokitties contract
    returns:
      Returns a new function of the form:
      (id) => Promise<Kitty>
        See CryptoKitties contract for Kitty fields
*/

const generateKittyFetchImpl = (XMLHttpRequest, network = 'mainnet', ckAddress = '0x06012c8cf97bead5deae237070f9587f8e7a266d') => {
  let id = 0;
  const jsonRPCCall = (method, params = []) => new Promise((resolve, reject) => {
    const req = new XMLHttpRequest();
    req.addEventListener('readystatechange', () => {
      try {
        if (req.readyState === 4) resolve(JSON.parse(req.responseText).result);
      } catch (e) {
        reject(e);
      }
    });
    req.open('POST', 'https://' + network + '.infura.io/' + INFURA_TOKEN);
    req.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
    try {
      req.send(JSON.stringify({
        jsonrpc: '2.0',
        id: id++,
        method,
        params
      }));
    } catch (e) {
      reject(e);
    }
  });
  // need bn.js instead of Number if you want cats with ID greater than Number.MAX_SAFE_INTEGER (9007199254740991)
  const getCatById = async (id) => {
    const catData = await jsonRPCCall('eth_call', [ {
      to: ckAddress,
      data: '0x' + GET_KITTY_SIGNATURE + padLeftZero(Number(id).toString(16), 64)
    }, 'latest' ]);
    // slice it into 10 32 byte fields
    return Object.assign({
      imgUrl: 'https://img.cryptokitties.co/' + ckAddress + '/' + String(Number(id))
    }, zipObject(KITTY_FIELDS, Array.apply(null, { length: 10 }).map((_, i) => [ i*64, 2 ]).map(([ base, length ], i) => i < 2 ? Boolean(Number('0x' + catData.substr(base + 2, 64))) : (i === 9 ? String : Number)(addHexPrefix(catData.substr(base + 2, 64))))));
  };
  return {
    jsonRPCCall,
    getCatById
  };
};

const getKittyCat = async (id) => {
  const { getCatById } = generateKittyFetchImpl(XMLHttpRequest);
  const cat = await getCatById(id);
  return parseKittyCat(id, cat)
}

const parseKittyCat = (id, cat) => {
  const { imgUrl, isReady, cooldownIndex, birthTime, generation, } = cat;
  return {
    id, imgUrl, isReady, cooldownIndex, birthTime, generation,
  }
}

const toExport = {
  generateKittyFetchImpl,
  getKittyCat,
  _padLeftZero: padLeftZero,
};

try {
  Object.assign(module.exports, toExport);
} catch (e) {
  Object.assign(window, toExport);
}
