const success = (data) => ({ status: 'success', data })
const failure = (err) => ({ status: 'failure', data: err })

module.exports = {success, failure}