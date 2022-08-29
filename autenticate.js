var authenticator = require('otplib').authenticator
var QRCode = require('qrcode')
const RippleAPI = require('ripple-lib').RippleAPI;
const api = new RippleAPI({server: 'wss://s.altnet.rippletest.net:51233'});
// source
var address = ""
var secret = ""
// destination
var destination = ""
var token = authenticator.generate(address, secret);

/* 
generates a base32 encoded hex secret that will be used to add your app into an authenticator app like Google Authenticator
*/

function generateLink() {

    try {
        // QR code to terminal
        QRCode.toString(authenticator.keyuri(token, address, secret), (err, url) => {
            //QR code to front end
       // QRCode.toDataURL(authenticator.keyuri(token, address, secret), (err, url) => {
            if (err) {
                throw err
            }
            console.log(url)
        
        })
    } catch (err) {
      console.error(err);
    }
}

   // generateLink()

/* 

Create a Payment on the XRPL

*/

async function payment() {

    const payment = {
        source: {
            address: address,
            maxAmount: {
                value: '1.001',
                currency: 'XRP'
            }
        },
        destination: {
            address: destination,
            //tag: dstTag,
            amount: {
                value: '1',
                currency: 'XRP'
            }
        }
    };
      
    api.connect().then(() => {
        console.log('Connected...');
        return api.preparePayment(address, payment).then(prepared => {
            console.log('Payment transaction prepared...');
          // add security code from APP
             var code = ""
            var isValid = authenticator.check(code, secret);    

            // Possibly await X no of ledgers before discarding??
            // if true make payment
                if (isValid == true) {
                    console.log("2FA success : ", isValid )
                    const { signedTransaction } = api.sign(prepared.txJSON, secret);
                    console.log('Payment transaction signed...');
                    api.submit(signedTransaction).then(quit, fail);
                }
            // if fasle fail transaction.
                else if (isValid == false) {
                    var message = "2FA Fail"
                    fail(message)
                }
        });
      }).catch(fail);
}

payment()

function quit(message) {
    console.log(message);
    process.exit(0);
  }

  function fail(message) {
    console.error(message);
    process.exit(1);
  }

