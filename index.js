'use strict'
const ccxt   = require('ccxt')
const loader = require('./loader.js')
//const EventEmitter = require('events')

// https://github.com/ccxt/ccxt/wiki/

let run = ( async () => {
    // List the exchanges we want to check
    const exchanges = {
        kraken:   new ccxt.kraken(),
        bitfinex: new ccxt.bitfinex(),
        bittrex:  new ccxt.bittrex()
    }
    // Get all our market information from the exchanges listed above
    let marketObjects = await loader.loadMarkets(exchanges)


    console.log(marketObjects);

    //let opportunities = await loader.assessPotentialTrades(exchanges, marketObjects)
    //console.log(opportunities)

})


setInterval(() => {
    run()
}, 10000)
