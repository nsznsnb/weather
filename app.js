const axios = require("axios");     // http通信ライブラリ
const cron = require("node-cron");  // 定期処理ライブラリ
const fs = require("fs");           // ファイル処理ライブラリ
const winston = require('winston'); // ロギングライブラリ

const url = "https://www.jma.go.jp/bosai/forecast/data/forecast/";
const KAGOSIMA_AREA_CODE = "460100";
const area = KAGOSIMA_AREA_CODE; // 鹿児島県内

// ロガー設定
const logger = winston.createLogger({
    level: 'debug',
    format: winston.format.combine(
        // winston.format.timestamp(),  // timestampを出力する
        winston.format.json()
    ),
    transports: [
        new winston.transports.Console()
    ]
});

let appSettings // アプリ設定オブジェクト
try {
    // アプリ設定ファイルを読み込む
    appSettings = loadAppSettings();
    logger.debug(appSettings)
} catch (error) {
    logger.error(`アプリ設定ファイルの読み込みに失敗しました => ${error}`)
}

// 毎日定刻に送信を行う
cron.schedule(appSettings.cron_schedule, () => {

    let weatherForecastData;
  /**
   * 気象庁のWebサイトから天気予報データを取得してLINEアプリに傘が必要かどうかを配信
   */
  (async function getWeatherForecastData() {
    try {
      weatherForecastData = await axios.get(`${url}${area}.json`);
    } catch (error) {
      logger.error(error);
    }
  })();

  const popsInfo = analyzeWeatherForecastData(weatherForecastData);


});

/**
 * 
 * @param {Object} weatherForecastData 天気データのオブジェクト 
 * @returns 今日の6時から24時までの降水確率を解析した結果{最高降水確率, その時間帯}
 */
function analyzeWeatherForecastData(weatherForecastData) {
    let maxpop  // １日の最高降水確率
    let maxPopTimeZone // 最高降水確率の時間帯
    const timeZone = ["18-0時","0-6時","6-12時","12-18時", "18-24時"];

    maxpop = parseInt(weatherForecastData[1]["areas"][0]["pops"][i])
    for (let i = 2; i <= 4; i++) {
        pop = parseInt(weatherForecastData[1]["areas"][0]["pops"][i])
        if(pop > maxpop) {
            maxpop = pop
            maxPopTimeZone = timeZone[i]
        }
    }

    return {maxPop, timeZone}
}

function makeSendMessage()

/**
 * アプリ設定ファイルを読み込む
 */
function loadAppSettings() {
    const appSettingsPath = "./settings/appSettings.json";
    if (!fs.existsSync(appSettingsPath)) {
        logger.error(`アプリ設定ファイルは存在しません。 => ${appSettingsPath}`)
    }

    let appSettings;    // アプリ設定オブジェクト
    try {
        appSettings = JSON.parse(fs.readFileSync(appSettingsPath, 'utf8'));
    } catch (error) {
        logger.error(`アプリ設定ファイルのjson形式が不正です。 => ${error}`)
    }

    return appSettings
}

