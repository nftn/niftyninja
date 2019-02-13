import { BigNumber } from '0x.js';

// tslint:disable-next-line:custom-no-magic-numbers
export const ONE_SECOND_MS = 1000;
// tslint:disable-next-line:custom-no-magic-numbers
export const ONE_MINUTE_MS = ONE_SECOND_MS * 60;
export const ONE_HOUR_MS = ONE_MINUTE_MS * 60;
export const ONE_DAY_MS = ONE_HOUR_MS * 24;
// tslint:disable-next-line:custom-no-magic-numbers
export const TEN_MINUTES_MS = ONE_MINUTE_MS * 10;
// tslint:disable-next-line:custom-no-magic-numbers
export const UNLIMITED_ALLOWANCE_IN_BASE_UNITS = new BigNumber(2).pow(256).minus(1);
// tslint:disable-next-line:custom-no-magic-numbers
export const DECIMALS = 18;
export const NULL_ADDRESS = '0x0000000000000000000000000000000000000000';
export const ZERO = new BigNumber(0);
export const GANACHE_NETWORK_ID = 50;
export const KOVAN_NETWORK_ID = 42;
export const ROPSTEN_NETWORK_ID = 3;
export const RINKEBY_NETWORK_ID = 4;
export const MAINNET_NETWORK_ID = 1;

export const CRYPTO_KITTY_CORE_ADDRESS = '0x06012c8cf97BEaD5deAe237070F9587f8E7A266d';