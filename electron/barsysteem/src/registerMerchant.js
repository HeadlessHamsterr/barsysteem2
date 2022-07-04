const fs = require('fs')
const https = require('https')
const crypto = require('crypto')
const path = require('path')

const registerMerchant = (signingKeyPath, signingCertPath, tlsKeyPath, tlsCertPath, host, accessToken, keyId, callback) =>{
    const url = '/payment-requests/registrations'
    const method = "post"

    const dateOb = new Date()
    const date = dateOb.toUTCString()
    const data = `{
        "merchantId": "0612324444",
        "merchantName": "Scouting Hoograven Plusscouts",
        "merchantIBAN": "NL26INGB0003275339",
        "dailyReceivableLimit": {
            "value": 50000.00,
            "currency": "EUR"
        },
        "allowIngAppPayments": "Y"
    }`

    const digest = `SHA-256=${crypto.createHash('sha256').update(data).digest('base64')}`
    const signing = `(request-target): ${method} ${url}\ndate: ${date}\ndigest: ${digest}`

    const privKey = fs.readFileSync(path.join(__dirname, signingKeyPath), 'utf-8')
    const signature = crypto.createSign('sha256').update(signing).sign(privKey, 'base64')

    const headers = {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Digest: digest,
        Date: date,
        Signature: `keyId="${keyId}",algorithm="rsa-sha256",headers="(request-target) date digest",signature="${signature}"`,
        Authorization: `Bearer ${accessToken}`
    }

    console.log(headers)

    const options = {
        host: host,
        port: 443,
        path: url,
        method: "POST",
        key: fs.readFileSync(path.join(__dirname, tlsKeyPath), 'utf-8'),
        cert: fs.readFileSync(path.join(__dirname, tlsCertPath), 'utf-8'),
        headers: headers
    }

    console.log(options)

    const req = https.request(options, function(res){
        res.setEncoding('utf-8')
        console.log(res.statusMessage)
        console.log(res.headers)
        res.on('data', function(chunk){
            callback(chunk.toString())
        })
    })

    req.on('error', function(e){
        console.log(`Request error: ${e}`)
    })

    req.write(data)
    req.end()
}

module.exports = { registerMerchant }