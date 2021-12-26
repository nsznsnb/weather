const axios = require("axios");
const cron = resuire("node-cron")

const url = "https://www.jma.go.jp/bosai/forecast/data/forecast/";
const area = "460100"; // 鹿児島県内

// 毎日定刻に送信を行う
cron.schedule("", () => {
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
