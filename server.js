const express = require('express');     // サーバライブラリ
const line = require('@line/bot-sdk');  // LINEライブラリ


const config = {
    channelAccessToken: '',     // 作成したBOTのチャンネルシークレット
    channelSecret: ''           // 作成したBOTのチャンネルアクセストークン
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

// pushMessageを送る処理
function sendPushMessage(mes) {
   client.pushMessage('送信先ID', {
    type: 'text',
    text: mes,
   })
}
