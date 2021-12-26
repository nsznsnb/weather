const fs = require("fs"); // ファイル処理ライブラリ
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
  