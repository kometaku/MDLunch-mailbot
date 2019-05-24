# MDLunch-mailbot
[MDLunch](https://www2.mdlife-md-lunch.com/itami2userhtml/order/XXeHcFaF9E/top.html)の本日の昼食をメールでお知らせします。

## Install
Google App Engine Standard Environmentを用意します。
```
user@cloudshell:~@ git clone https://github.com/kometaku/MDLunch-mailbot.git
user@cloudshell:~@ cd MDLunch-mailbot
user@cloudshell:~@ npm install
```

## Testrun
Google Cloud Platform Marketplaceを使用してSendGrid Emailサービスに登録し、APIキーを作成します。
```
user@cloudshell:~@ export SENDGRID_API_KEY=your-api-key
user@cloudshell:~@ export SENDGRID_SENDER=MDLunch@example.com
user@cloudshell:~@ export SENDGRID_TO=yourmail@example.com
user@cloudshell:~@ npm start
```

## Deploy
app.yamlを編集して環境変数の設定を行い、アプリケーションのデプロイとcronジョブの登録を行います。
```
user@cloudshell:~@ vi app.yaml
user@cloudshell:~@ gcloud app deploy
user@cloudshell:~@ gcloud app deploy cron.yaml
```
