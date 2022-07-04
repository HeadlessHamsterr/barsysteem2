const https = require('https');
const fs = require('fs');


const getAccessToken = (signingKeyPath, signingCertPath, tlsKeyPath, tlsCertPath, host, keyId, callback) => {
    const test = "'TPP-Signature-Certificate'`-----BEGIN CERTIFICATE-----MIIENjCCAx6gAwIBAgIEXkKZvjANBgkqhkiG9w0BAQsFADByMR8wHQYDVQQDDBZBcHBDZXJ0aWZpY2F0ZU1lYW5zQVBJMQwwCgYDVQQLDANJTkcxDDAKBgNVBAoMA0lORzESMBAGA1UEBwwJQW1zdGVyZGFtMRIwEAYDVQQIDAlBbXN0ZXJkYW0xCzAJBgNVBAYTAk5MMB4XDTIwMDIxMDEyMTAzOFoXDTIzMDIxMTEyMTAzOFowPjEdMBsGA1UECwwUc2FuZGJveF9laWRhc19xc2VhbGMxHTAbBgNVBGEMFFBTRE5MLVNCWC0xMjM0NTEyMzQ1MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAkJltvbEo4/SFcvtGiRCar7Ah/aP0pY0bsAaCFwdgPikzFj+ij3TYgZLykz40EHODtG5Fz0iZD3fjBRRM/gsFPlUPSntgUEPiBG2VUMKbR6P/KQOzmNKF7zcOly0JVOyWcTTAi0VAl3MEO/nlSfrKVSROzdT4Aw/h2RVy5qlw66jmCTcp5H5kMiz6BGpG+K0dxqBTJP1WTYJhcEj6g0r0SYMnjKxBnztuhX5XylqoVdUy1a1ouMXU8IjWPDjEaM1TcPXczJFhakkAneoAyN6ztrII2xQ5mqmEQXV4BY/iQLT2grLYOvF2hlMg0kdtK3LXoPlbaAUmXCoO8VCfyWZvqwIDAQABo4IBBjCCAQIwNwYDVR0fBDAwLjAsoCqgKIYmaHR0cHM6Ly93d3cuaW5nLm5sL3Rlc3QvZWlkYXMvdGVzdC5jcmwwHwYDVR0jBBgwFoAUcEi7XgDA9Cb4xHTReNLETt+0clkwHQYDVR0OBBYEFLQI1Hig4yPUm6xIygThkbr60X8wMIGGBggrBgEFBQcBAwR6MHgwCgYGBACORgEBDAAwEwYGBACORgEGMAkGBwQAjkYBBgIwVQYGBACBmCcCMEswOTARBgcEAIGYJwEDDAZQU1BfQUkwEQYHBACBmCcBAQwGUFNQX0FTMBEGBwQAgZgnAQIMBlBTUF9QSQwGWC1XSU5HDAZOTC1YV0cwDQYJKoZIhvcNAQELBQADggEBAEW0Rq1KsLZooH27QfYQYy2MRpttoubtWFIyUV0Fc+RdIjtRyuS6Zx9j8kbEyEhXDi1CEVVeEfwDtwcw5Y3w6Prm9HULLh4yzgIKMcAsDB0ooNrmDwdsYcU/Oju23ym+6rWRcPkZE1on6QSkq8avBfrcxSBKrEbmodnJqUWeUv+oAKKG3W47U5hpcLSYKXVfBK1J2fnk1jxdE3mWeezoaTkGMQpBBARN0zMQGOTNPHKSsTYbLRCCGxcbf5oy8nHTfJpW4WO6rK8qcFTDOWzsW0sRxYviZFAJd8rRUCnxkZKQHIxeJXNQrrNrJrekLH3FbAm/LkyWk4Mw1w0TnQLAq+s=-----END CERTIFICATE-----`"
    const payload = "grant_type=client_credentials"
    const digest = "SHA-256=" + crypto.createHash('sha256').update(payload).digest('base64')

    const dateOb = new Date()
    const reqDate = dateOb.toUTCString()

    const httpMethod = 'post'
    const reqPath = '/oauth2/token'
    const signingString = `(request-target): ${httpMethod} ${reqPath}\ndate: ${reqDate}\ndigest: ${digest}`

    const privKey = fs.readFileSync(path.join(__dirname, signingKeyPath), 'utf-8')
    const cert = fs.readFileSync(path.join(__dirname, signingCertPath), 'utf-8')
    
    const signature = crypto.createSign('sha256').update(signingString).sign(privKey, 'base64')

    const header = {
        Accept: 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
        Digest: digest,
        Date: reqDate,
        Authorization: `Signature keyId="${keyId}",algorithm="rsa-sha256",headers="(request-target) date digest",signature="${signature}"`
    }

    const options = {
        host: host,
        port: 443,
        path: reqPath,
        method: 'POST',
        key: fs.readFileSync(path.join(__dirname, tlsKeyPath), 'utf-8'),
        cert: fs.readFileSync(path.join(__dirname, tlsCertPath), 'utf-8'),
        headers: header
    }

    const req = https.request(options, function(res){
        res.setEncoding('utf-8')
        res.on('data', function(chunk){
            callback(chunk)
        })
    })

    req.on('error', function(e){
        console.log(`Request error: ${e.message}`)
    })

    req.write(payload)
    req.end()
};

module.exports = { getAccessToken }