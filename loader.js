exports.loadMarkets = ( markets ) => {
    const promises = Object.keys(markets).map( async (marketKey) => {
        return {
            name:    marketKey,
            tickers: await markets[marketKey].loadMarkets()
        }
    })
    return Promise.all(promises)
}




exports.assessPotentialTrades = (exchanges, marketObjects) => {
    // Keep track of which markets we've check against
    let comparisons = {
        tickers:       [],
        opportunities: []
    }
    // Check each market against the other
    marketObjects.map( ( baseMarket, baseIndex ) => {
        // For every market that we check, we need to check it against every other market
        // We do this to look for every possible arbitrage opportunity available at the moment
        marketObjects.map( ( againstMarket, againstIndex) => {
            // We don't need to check an exchange against itself
            if( againstIndex === baseIndex )
                return null
            // Check for every currency in the ticker
            //console.log(baseMarket, againstMarket.name);
            Object.keys(baseMarket.tickers).map( ticker => {
                // We only need to check each market comparison once, and not from the other side
                // so we'll skip out if this comparison has already been made
                if( comparisons.tickers.indexOf(`${baseMarket.name}/${againstMarket.name}/${ticker}`) > -1 || comparisons.tickers.indexOf(`${againstMarket.name}/${baseMarket.name}/${ticker}`) > -1 )
                    return null
                // If the ticker is present at one exchange but not the other then we can't trade and therefore
                // get outta here
                if( typeof baseMarket.tickers[ticker] === 'undefined' || typeof againstMarket.tickers[ticker] === 'undefined' )
                    return null
                // Take note that this comparison has been made so we don't check twice
                comparisons.tickers.push(`${baseMarket.name}/${againstMarket.name}/${ticker}`)
                // Found a pair of exchanges / ticker that needs to be inspected for arbitrage opportunities
                // Returns opportunity object if one found, otherwise return false
                let opportunity = checkPotentialTrade(exchanges, baseMarket, againstMarket, ticker)
                // Ignore if not any opportunity
                if( ! opportunity )
                    return null
                // Send
                comparisons.opportunities.push(opportunity)
            })
        })
    })
    return comparisons.opportunities
}



const checkPotentialTrade = async (exchanges, baseMarket, againstMarket, ticker) => {

    const baseTicker       = await exchanges[baseMarket.name].fetchTicker(ticker)
    const againstTicker    = await exchanges[againstMarket.name].fetchTicker(ticker)
    let opportunity        = []

    if( baseTicker.bid > againstTicker.ask ) {
        opportunity.push({
            spreas:      baseTicker.bid - againstTicker.ask,
            buy: {
                ask:      againstTicker.ask,
                exchange: againstMarket.name,
            },
            sell: {
                bid:      baseTicker.bid,
                exchange: baseMarket.name
            }
        })
    }
    if( againstTicker.bid > baseTicker.ask ) {
        opportunity.push({
            spread:       againstTicker.bid - baseTicker.ask,
            buy: {
                ask:      baseTicker.ask,
                exchange: baseMarket.name
            },
            sell: {
                bid:      againstTicker.bid,
                exchange: againstMarket.name
            }
        })
    }

    if( opportunity.length === 0 )
        return false

    if( opportunity.length === 1 )
        return opportunity

    if( opportunity.length === 2 ){
        return opportunity.sort(sorted)
    }

}



const sorted = (a,b) => {
    return a.spread - b.spread
}
