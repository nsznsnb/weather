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
        winston.format.timestamp(),  // timestampを出力する
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
  /**
   * 気象庁からデータを取得してLINEに配信
   */
  (async function getWeatherForecast() {
    try {
      const response = await axios.get(`${url}${area}.json`);
      for (const area of response.data[0].timeSeries[0].areas) {
        console.log(`----${area.area.name}----`);
        for (const weather of area.weathers) {
          console.log(weather);
        }
      }
    } catch (error) {
      console.error(error);
    }
  })();
});

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

