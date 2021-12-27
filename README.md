
## 気象庁の天気予報JSONデータを使用して、傘が必要かどうか毎朝Lineに通知する
- 毎朝天気予報をチェックする手間を省くために作成した。


### ◆処理内容：
- 当日6-24時の最高降水確率が30%以上なら、傘が必要と判定、そうでない場合は、不要と判定。
- 6-12時、12-18時、18-24時の中での最高降水確率となる時間帯を情報として付加する。  
- [LINE Messaging API](https://developers.line.biz/ja/services/messaging-api/)を使って、LINEへ通知（毎朝7時)  


### ◆使用技術：
- Node.js v14.15.5
- LINE Messaging API

 
### ◆LINEへの通知結果
- 今回はAWS LambdaやHerokuなどにはアップロードせずに、手元の環境で実行して一通り動作するかだけををチェックした。
- 以下の例では、通知が１分正時間隔で行われるようcronを設定した。
![https://github.com/nsznsnb/weather/blob/master/line_info_result.PNG](https://github.com/nsznsnb/weather/blob/master/line_info_result.PNG)
