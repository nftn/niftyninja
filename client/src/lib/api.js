const apiUrl = '/api' // 'http://localhost:8000'

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
