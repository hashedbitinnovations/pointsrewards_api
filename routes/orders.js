const express = require('express');
const router = express.Router();
const db = require('../db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const axios = require('axios');


const { checkUserByEmail, checkUserByUsername } = require('../controllers/checkUser');
const checkUser = require('../controllers/checkUser');
const verifyJwt = require('../verify.js')
const verifyJwtAdmin = require('../verifyadmin.js')


// http://localhost:4000/orders/makepayment
router.post('/makepayment', async (req, res) => {
    console.log('Inside payment request');

    const merchantTransactionId = req.body.transactioId;

    const paydata = {
        "merchantId": "PGTESTPAYUAT",
        "merchantTransactionId": merchantTransactionId,
        "merchantUserId": req.body.MUID,
        "name": req.body.name,
        "amount": req.body.amount * 100,
        "redirectUrl": "https://www.hashedbit.com/checkout",
        "redirectMode": "POST",
        "callbackUrl": "https://www.hashedbit.com/checkout",
        "mobileNumber": req.body.number,
        "paymentInstrument": {
            "type": "PAY_PAGE"
        }
    }

    const payload = JSON.stringify(paydata);
    //console.log('paylod - ', payload);
    const payloadMain = Buffer.from(payload).toString('base64');
    //console.log('payloadMain - ', payloadMain);

    const keyIndex = 1;
    const string = payloadMain + '/pg/v1/pay' + '099eb0cd-02cf-4e2a-8aca-3e6c6aff0399';
    //const sha256 = crypto.createHash('sha256').update(string).digest('hex');
    const datasha256 = crypto.createHash('sha256').update(string).digest('hex');
    const checksum = datasha256 + '###' + keyIndex;
    //console.log('checksum - ', checksum);


    const prod_url = 'https://api-preprod.phonepe.com/apis/hermes/pg/v1/pay';

    const options = {
        method: 'post',
        url: prod_url,
        headers: {
            accept: 'application/json',
            'Content-Type': 'application/json',
            'X_VERIFY': checksum
        },
        // data: {
        //     fname: '',
        //     lname: '',
        //     cname: '',
        //     hnumber: '',
        //     city: '',
        //     pcode: '',
        //     number: '',
        //     email: ''
        // }
        data: {
            request: payloadMain
        }

    };


    try {
        axios.request(options).then(function(response) {
            console.log(response.data);
            return res.redirect(response.data.data.instrumentResponse.redirectInfo.url)
        })
        .catch(function(error) {
            console.log(error);
        })
        // const response = await axios(options);

        // if(response) {
        //     console.log('response.data', response.data.data.instrumentResponse);
        //     res.json(response.data.data.instrumentResponse);

        // }
            // .then(function (response) {
            //     console.log('response.data', response.data.data.instrumentResponse);
            //     //return response.redirect(response.data.data.instrumentResponse.redirectInfo.url);
            // })
            // .catch(function (error) {
            //     console.error('error', error);
            // });

        //res.status(201).json(response);
    } catch (err) {
        //console.log(err);
        res.status(400).json(err);
    }
})



module.exports = router;

