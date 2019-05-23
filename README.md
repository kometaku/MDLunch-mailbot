# MDLunch-mailbot
[MDLunch](https://www2.mdlife-md-lunch.com/itami2userhtml/order/XXeHcFaF9E/top.html)の本日の昼食をメールでお知らせします。

## Install
Google App Engineの環境を用意します。
```
user@cloudshell:~@ sudo su -
root@cloudshell:~@ apt-get install graphicsmagick
root@cloudshell:~@ exit
user@cloudshell:~@ git clone https://github.com/kometaku/MDLunch-mailbot.git
user@cloudshell:~@ cd MDLunch-mailbot
user@cloudshell:~@ npm install
user@cloudshell:~@ npm install
```

## Testrun
```
user@cloudshell:~@ export SENDGRID_API_KEY=your-api-key
user@cloudshell:~@ export SENDGRID_SENDER=MDLunch@example.com
user@cloudshell:~@ export SENDGRID_TO=yourmail@example.com
user@cloudshell:~@ npm start
```

## Deploy
```
user@cloudshell:~@ gcloud app deploy
user@cloudshell:~@ gcloud app deploy cron.yaml
```
