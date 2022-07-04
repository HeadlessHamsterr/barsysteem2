const fs = require('fs')
const https = require('https')
const crypto = require('crypto')
const  path = require('path')
const uuid = require('uuid')

const requestPayment = (signingKeyPath, tlsKeyPath, tlsCertPath, host, accessToken, merchantCert, keyId, amount, cardAmount, callback) => {
    const url = '/payment-requests'
    const method = 'post'

    const date = new Date().toUTCString()
    const expDate = new Date()
    expDate.setHours(expDate.getHours()+1)
    const expDateStr = `${expDate.toISOString().replace("Z", "")}+01:00`
    console.log(expDateStr)
    const data = `{
        "fixedAmount": {
          "value": 99.95,
          "currency": "EUR"
        },
        "validUntil": "${expDateStr}",
        "maximumAllowedPayments": 1,
        "maximumReceivableAmount": {
          "value": 99.95,
          "currency": "EUR"
        },
        "purchaseId": "abcdefg1234567890",
        "description": "Your purchase reference abcdefg1234567890",
        "returnUrl": "https://www.webshop.com/return?purchaseId=abcdefg1234567890"
      }
      `

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
        Authorization: `Bearer ${accessToken}`,
        'X-ING-ReqID': `"${uuid.v1()}"`
    }

    const options = {
        host: host,
        port: 443,
        path: url,
        method: "POST",
        key: fs.readFileSync(path.join(__dirname, tlsKeyPath), 'utf-8'),
        cert: fs.readFileSync(path.join(__dirname, tlsCertPath), 'utf-8'),
        headers: headers
    }

    const req = https.request(options, function(res){
        res.setEncoding('utf-8')
        console.log(res.statusMessage)
        res.on('data', function(chunk){
            callback(chunk.toString())
        })
    })

    req.write(data)
    req.end()
}

module.exports = { requestPayment }