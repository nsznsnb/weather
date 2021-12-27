const express = require('express');     // サーバライブラリ
const line = require('@line/bot-sdk');  // LINEライブラリ
const utility = require(`./utility`) 
const winston = require("winston"); // ロギングライブラリ
const dotenv = require ("dotenv");

dotenv.config()     // .envの項目を環境変数として設定

// ロガー設定
const logger = winston.createLogger({
    level: "debug",
    format: winston.format.combine(
      // winston.format.timestamp(),  // timestampを出力する
      winston.format.json()
    ),
    transports: [new winston.transports.Console()],
  });

let appSettings // アプリ設定オブジェクト
try {
    // アプリ設定ファイルを読み込む
    appSettings = utility.loadAppSettings();
    logger.debug(appSettings);
  } catch (error) {
    logger.error(`アプリ設定ファイルの読み込みに失敗しました => ${error}`);
  }

const config = {
    channelAccessToken: process.env.channelAccessToken,     // 作成したBOTのチャンネルシークレット
    channelSecret: process.env.channelSecret           // 作成したBOTのチャンネルアクセストークン
};

const PORT = process.env.PORT || 3000;  // サーバのポート番号
const app = express();

app.post('/webhook', line.middleware(config), (req, res) => {
    console.log(req.body.events);
    Promise
      .all(req.body.events.map(handleEvent))
      .then((result) => res.json(result));
});

const client = new line.Client(config);

// LINEメッセージを送る処理
exports.sendPushMessage = function(msg) {
   client.pushMessage(process.env.channelId, {
    type: 'text',
    text: msg,
   })
}
