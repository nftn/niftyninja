export const enableMetaMask = async () => {
  const provider = window.ethereum || (window.web3 && window.web3.currentProvider);
  let enabled = false;
  if (!provider) throw new Error('install')
  if (window.ethereum) {
    enabled = await window.ethereum.enable().then(() => true).catch(() => false);
  }
  else if (window.web3) {
    enabled = true;
  }
  if (!enabled) throw new Error('authorize')
}