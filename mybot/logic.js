
const appConfig = {
    api: {
        yahoo: {
            'X-API-KEY': process.env.API_KEY_YAHOO,
        },
        resas: {
            'appid': process.env.API_KEY_RESAS
        }
    },
    rail: {
        lineCd: '11301'   //東海道線
    }
}

/**
 * 現在の目的地を取得する
 * @param {*} userId 
 */
function getCurrnetDestination(userId) {
    // TODO: データベースの値を取得する
    return {
        latitude: 35.681236, // 東京駅
        longitude: 139.767125
    };
}

/**
 * 位置情報から獲得できる金額を取得する
 * @param {*} location 
 */
function getMoneyAtLocation(location){
    // TODO: RESASのAPIとかを使ってちゃんと計算する
    return 100;
}

// exports functions
exports.getCurrnetDestination = getCurrnetDestination;
exports.getMoneyAtLocation = getMoneyAtLocation;