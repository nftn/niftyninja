const dev = true;
const rootUrl = dev ? 'http://localhost:8000' : ''
const apiUrl =  `${rootUrl}/api`

export const getTrade = id => fetch(`${apiUrl}/trade/${id}`).then(res => res.json())

export const setOrder = (order, id) => fetch(`${apiUrl}/trade/setorder`, {
  method: 'POST',
  body: JSON.stringify({order, id}),
  headers: { 'Content-Type': 'application/json' },
}).then(res => res.json())

export const tellOrderFilled = (id, txReceipt) => fetch(`${apiUrl}/trade/fillorder`, {
  method: 'post',
  body: JSON.stringify({ txReceipt, id }),
  headers: { 'Content-Type': 'application/json' },
}).then(res => res.json())

export const getKittyInfo = id => fetch(`${apiUrl}/kittyinfo/${id}`).then(res => res.json())

export const getKittiesByAddress = address => fetch(`${apiUrl}/kittybyaddress/${address}`).then(res => res.json())