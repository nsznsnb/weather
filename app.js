const axios = require("axios"); // http通信ライブラリ
const cron = require("node-cron"); // 定期処理ライブラリ
const fs = require("fs"); // ファイル処理ライブラリ
const winston = require("winston"); // ロギングライブラリ

// ロガー設定
const logger = winston.createLogger({
  level: "debug",
  format: winston.format.combine(
    // winston.format.timestamp(),  // timestampを出力する
    winston.format.json()
  ),
  transports: [new winston.transports.Console()],
});

let appSettings; // アプリ設定オブジェクト
try {
  // アプリ設定ファイルを読み込む
  appSettings = loadAppSettings();
  logger.debug(appSettings);
} catch (error) {
  logger.error(`アプリ設定ファイルの読み込みに失敗しました => ${error}`);
}

const url = `https://www.jma.go.jp/bosai/forecast/data/forecast/${appSettings.weather_info.area_code}.json`;
// 毎日定刻に送信を行う
cron.schedule(appSettings.cron_schedule, () => {
  let weatherForecastData;
  /**
   * 気象庁のWebサイトから天気予報データを取得する
   */
  (async function getWeatherForecastData() {
    try {
      const response = await axios.get(url);
      weatherForecastData = response.data[0];

      console.log(weatherForecastData);
    } catch (error) {
      logger.error(`${error}`);
    }
  })().then((response) => {
    //logger.debug(`天気予報データの取得成功 => ${weatherForecastData}`);

    // 最高降水確率とその時間帯を取得する
    const maxPopInfo = analyzeWeatherForecastData(weatherForecastData);
    console.log(maxPopInfo);
    //logger.info(JSON.stringify(maxPopInfo))

    //LINEに傘が必要かどうかの送信情報を組み立てる
    const lineMsg = makeLineMessage(maxPopInfo);
    logger.info(lineMsg);
  });
});

/**
 *
 * @param {Object} weatherForecastData 天気データのオブジェクト
 * @returns 今日の6時から24時までの降水確率を解析した結果{最高降水確率, その時間帯}
 */
function analyzeWeatherForecastData(weatherForecastData) {
  let maxPop; // １日の最高降水確率
  let maxPopTimeZone; // 最高降水確率の時間帯
  const timeZone = ["18-0時", "0-6時", "6-12時", "12-18時", "18-24時"];

  // 取得した天気データの中から降水確率を取り出し、6-12,12-18,18-24の時間帯の中で最高降水確率を探す。
  maxPop = parseInt(
    weatherForecastData["timeSeries"][1]["areas"][0]["pops"][2]
  );
  maxPopTimeZone = timeZone[2];
  for (let i = 2; i <= 4; i++) {
    const pop = parseInt(
      weatherForecastData["timeSeries"][1]["areas"][0]["pops"][i]
    );
    if (pop > maxPop) {
      maxPop = pop;
      maxPopTimeZone = timeZone[i];
    }
  }

  return { maxPop, maxPopTimeZone };
}

/**
 * Lineに送信するメッセージを組み立てる
 * @param {*} maxPopInfo 最高降水確率に関する情報オブジェクト
 * @returns lineに送信するメッセージ
 */
function makeLineMessage(maxPopInfo) {
  let lineMsg = ""; // LINEに配信するメッセージ
  const maxPop = maxPopInfo.maxPop;

  if (maxPop < 30) {
    lineMsg += `今日は傘はいらないでしょう。\n今日は${maxPopInfo.maxPopTimeZone}に最高降水確率${maxPop}%となっています。`;
  } else {
    lineMsg += `今日は傘を持って外出したほうがいいでしょう。\n今日は${maxPopInfo.maxPopTimeZone}に最高降水確率${maxPop}%となっています。`;
  }

  return lineMsg;
}

/**
 * アプリ設定ファイルを読み込む
 */
function loadAppSettings() {
  const appSettingsPath = "./settings/appSettings.json";
  if (!fs.existsSync(appSettingsPath)) {
    logger.error(`アプリ設定ファイルは存在しません。 => ${appSettingsPath}`);
  }

  let appSettings; // アプリ設定オブジェクト
  try {
    appSettings = JSON.parse(fs.readFileSync(appSettingsPath, "utf8"));
  } catch (error) {
    logger.error(`アプリ設定ファイルのjson形式が不正です。 => ${error}`);
  }

  return appSettings;
}
