
const googleMapsClient = require('@google/maps').createClient({
    key: process.env.API_KEY_GOOGLE
});

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
function getMoneyAtLocation(location) {
    // TODO: RESASのAPIとかを使ってちゃんと計算する
    return 100;
}

function getAddressFromLocation(location, callback) {
    var response = googleMapsClient.reverseGeocode({
        latlng: [location.latitude, location.longitude]
    }, function (err, response) {
        if (!err) {
            callback(response.json.results);
        }
    });
}

function getPrefCode(name) {

    const prefecturesData = [
        {
            prefCode: 1,
            prefName: '北海道'
        },
        {
            prefCode: 2,
            prefName: '青森県'
        },
        {
            prefCode: 3,
            prefName: '岩手県'
        },
        {
            prefCode: 4,
            prefName: '宮城県'
        },
        {
            prefCode: 5,
            prefName: '秋田県'
        },
        {
            prefCode: 6,
            prefName: '山形県'
        },
        {
            prefCode: 7,
            prefName: '福島県'
        },
        {
            prefCode: 8,
            prefName: '茨城県'
        },
        {
            prefCode: 9,
            prefName: '栃木県'
        },
        {
            prefCode: 10,
            prefName: '群馬県'
        },
        {
            prefCode: 11,
            prefName: '埼玉県'
        },
        {
            prefCode: 12,
            prefName: '千葉県'
        },
        {
            prefCode: 13,
            prefName: '東京都'
        },
        {
            prefCode: 14,
            prefName: '神奈川県'
        },
        {
            prefCode: 15,
            prefName: '新潟県'
        },
        {
            prefCode: 16,
            prefName: '富山県'
        },
        {
            prefCode: 17,
            prefName: '石川県'
        },
        {
            prefCode: 18,
            prefName: '福井県'
        },
        {
            prefCode: 19,
            prefName: '山梨県'
        },
        {
            prefCode: 20,
            prefName: '長野県'
        },
        {
            prefCode: 21,
            prefName: '岐阜県'
        },
        {
            prefCode: 22,
            prefName: '静岡県'
        },
        {
            prefCode: 23,
            prefName: '愛知県'
        },
        {
            prefCode: 24,
            prefName: '三重県'
        },
        {
            prefCode: 25,
            prefName: '滋賀県'
        },
        {
            prefCode: 26,
            prefName: '京都府'
        },
        {
            prefCode: 27,
            prefName: '大阪府'
        },
        {
            prefCode: 28,
            prefName: '兵庫県'
        },
        {
            prefCode: 29,
            prefName: '奈良県'
        },
        {
            prefCode: 30,
            prefName: '和歌山県'
        },
        {
            prefCode: 31,
            prefName: '鳥取県'
        },
        {
            prefCode: 32,
            prefName: '島根県'
        },
        {
            prefCode: 33,
            prefName: '岡山県'
        },
        {
            prefCode: 34,
            prefName: '広島県'
        },
        {
            prefCode: 35,
            prefName: '山口県'
        },
        {
            prefCode: 36,
            prefName: '徳島県'
        },
        {
            prefCode: 37,
            prefName: '香川県'
        },
        {
            prefCode: 38,
            prefName: '愛媛県'
        },
        {
            prefCode: 39,
            prefName: '高知県'
        },
        {
            prefCode: 40,
            prefName: '福岡県'
        },
        {
            prefCode: 41,
            prefName: '佐賀県'
        },
        {
            prefCode: 42,
            prefName: '長崎県'
        },
        {
            prefCode: 43,
            prefName: '熊本県'
        },
        {
            prefCode: 44,
            prefName: '大分県'
        },
        {
            prefCode: 45,
            prefName: '宮崎県'
        },
        {
            prefCode: 46,
            prefName: '鹿児島県'
        },
        {
            prefCode: 47,
            prefName: '沖縄県'
        }
    ];
    var prefData = prefecturesData.filter(function (value) {
        // 県名が一致するものを抽出
        return value.prefName === name
    });

    return prefData.length === 1 ? prefData[0].prefCode : undefined
}

// exports functions
exports.getCurrnetDestination = getCurrnetDestination;
exports.getMoneyAtLocation = getMoneyAtLocation;

exports.getAddressFromLocation = getAddressFromLocation;