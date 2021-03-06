'use strict';

const line = require('@line/bot-sdk');
const express = require('express');
const fs = require('fs');
const path = require('path');
const cp = require('child_process');
const async = require('async');
const mongodb = require('mongodb');

const logic = require('./logic');

// create LINE SDK config from env variables
const config = {
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.CHANNEL_SECRET,
};

// base URL for webhook server
const baseURL = process.env.BASE_URL;

// create LINE SDK client
const client = new line.Client(config);
const MongoClient = mongodb.MongoClient;

// create Express app
// about Express itself: https://expressjs.com/
const app = express();

// serve static and downloaded files
app.use('/static', express.static('static'));
app.use('/downloaded', express.static('downloaded'));

// webhook callback
app.post('/callback', line.middleware(config), (req, res) => {
  // req.body.events should be an array of events
  if (!Array.isArray(req.body.events)) {
    return res.status(500).end();
  }

  // handle events separately
  Promise.all(req.body.events.map(handleEvent))
    .then(() => res.end())
    .catch((err) => {
      console.error(err);
      res.status(500).end();
    });
});

// simple reply function
const replyText = (token, texts) => {
  texts = Array.isArray(texts) ? texts : [texts];
  return client.replyMessage(
    token,
    texts.map((text) => ({ type: 'text', text }))
  );
};

// callback function to handle a single event
function handleEvent(event) {
  switch (event.type) {
    case 'message':
      const message = event.message;
      switch (message.type) {
        case 'text':
          return handleText(message, event.replyToken, event.source);
        case 'image':
          return handleImage(message, event.replyToken);
        case 'video':
          return handleVideo(message, event.replyToken);
        case 'audio':
          return handleAudio(message, event.replyToken);
        case 'location':
          return handleLocation(message, event.replyToken);
        case 'sticker':
          return handleSticker(message, event.replyToken);
        default:
          throw new Error(`Unknown message: ${JSON.stringify(message)}`);
      }

    case 'follow':
      return replyText(event.replyToken, 'Got followed event');

    case 'unfollow':
      return console.log(`Unfollowed this bot: ${JSON.stringify(event)}`);

    case 'join':
      return replyText(event.replyToken, `Joined ${event.source.type}`);

    case 'leave':
      return console.log(`Left: ${JSON.stringify(event)}`);

    case 'postback':
      if (event.postback.data === "buy_1") {
        return replyText(event.replyToken, `ほいさっさ を 3000万円 で購入しました`);
      } else if (event.postback.data === "buy_2") {
        return replyText(event.replyToken, `チーズとワインのお店 Den 日比谷 を 2500万円 で購入しました`);
      } else if (event.postback.data === "buy_3") {
        return replyText(event.replyToken, `バインセオサイゴン 有楽町店 を 2800万円 で購入しました`);
      }else{
        return replyText(event.replyToken, event.postback.data);
      }
    case 'beacon':
      return replyText(event.replyToken, `Got beacon: ${event.beacon.hwid}`);

    default:
      throw new Error(`Unknown event: ${JSON.stringify(event)}`);
  }
}

function handleText(message, replyToken, source) {
  const buttonsImageURL = `${baseURL}/static/buttons/1040.jpg`;

  switch (message.text) {
    case 'checkin':
      return replyText(replyToken, `目的地（東京駅）に到着しました。3000万円ゲット！`);
    case 'buy':
      return client.replyMessage(
        replyToken,
        {
          type: 'template',
          altText: 'Carousel alt text',
          template: {
            type: 'carousel',
            columns: [
              {
                thumbnailImageUrl: 'https://jp.sake-times.com/sake_system_jp/wp-content/uploads/2018/12/p_hoisassa.png',
                title: 'ほいさっさ',
                text: '購入価格 3000万円',
                actions: [
                  { label: '購入', type: 'postback', data: 'buy_1' }
                ],
              },
              {
                thumbnailImageUrl: 'https://cheese-wine-den.com/wp-content/themes/tonoka/images/location_00.jpg',
                title: 'チーズとワインのお店 Den 日比谷',
                text: '購入価格 2500万円',
                actions: [
                  { label: '購入', type: 'postback', data: 'buy_2' }
                ],
              },
              {
                thumbnailImageUrl: 'https://tblg.k-img.com/restaurant/images/Rvw/51312/51312835.jpg',
                title: 'バインセオサイゴン 有楽町店',
                text: '購入価格 2800万円',
                actions: [
                  { label: '購入', type: 'postback', data: 'buy_3' }
                ],
              },
            ],
          },
        }
      );
    case 'profile':
      if (source.userId) {
        return client.getProfile(source.userId)
          .then((profile) => replyText(
            replyToken,
            [
              `Display name: ${profile.displayName}`,
              `Status message: ${profile.statusMessage}`,
            ]
          ));
      } else {
        return replyText(replyToken, 'Bot can\'t use profile API without user ID');
      }
    case 'buttons':
      return client.replyMessage(
        replyToken,
        {
          type: 'template',
          altText: 'Buttons alt text',
          template: {
            type: 'buttons',
            thumbnailImageUrl: buttonsImageURL,
            title: 'My button sample',
            text: 'Hello, my button',
            actions: [
              { label: 'Go to line.me', type: 'uri', uri: 'https://line.me' },
              { label: 'Say hello1', type: 'postback', data: 'hello こんにちは' },
              { label: '言 hello2', type: 'postback', data: 'hello こんにちは', text: 'hello こんにちは' },
              { label: 'Say message', type: 'message', text: 'Rice=米' },
            ],
          },
        }
      );
    case 'confirm':
      return client.replyMessage(
        replyToken,
        {
          type: 'template',
          altText: 'Confirm alt text',
          template: {
            type: 'confirm',
            text: 'Do it?',
            actions: [
              { label: 'Yes', type: 'message', text: 'Yes!' },
              { label: 'No', type: 'message', text: 'No!' },
            ],
          },
        }
      )
    case 'carousel':
      return client.replyMessage(
        replyToken,
        {
          type: 'template',
          altText: 'Carousel alt text',
          template: {
            type: 'carousel',
            columns: [
              {
                thumbnailImageUrl: 'https://jp.sake-times.com/sake_system_jp/wp-content/uploads/2018/12/p_hoisassa.png',
                title: 'お店 A',
                text: '購入価格 1000万円',
                actions: [
                  { label: '購入', type: 'postback', data: 'buy' }
                ],
              },
              {
                thumbnailImageUrl: 'https://jp.sake-times.com/sake_system_jp/wp-content/uploads/2018/12/p_hoisassa.png',
                title: '観光スポット B',
                text: '購入価格 2000万円',
                actions: [
                  { label: '購入', type: 'postback', data: 'buy' }
                ],
              },
              {
                thumbnailImageUrl: 'https://jp.sake-times.com/sake_system_jp/wp-content/uploads/2018/12/p_hoisassa.png',
                title: 'ビル C',
                text: '購入価格 1億円',
                actions: [
                  { label: '購入', type: 'postback', data: 'buy' }
                ],
              },
            ],
          },
        }
      );
    case 'image carousel':
      return client.replyMessage(
        replyToken,
        {
          type: 'template',
          altText: 'Image carousel alt text',
          template: {
            type: 'image_carousel',
            columns: [
              {
                imageUrl: buttonsImageURL,
                action: { label: 'Go to LINE', type: 'uri', uri: 'https://line.me' },
              },
              {
                imageUrl: buttonsImageURL,
                action: { label: 'Say hello1', type: 'postback', data: 'hello こんにちは' },
              },
              {
                imageUrl: buttonsImageURL,
                action: { label: 'Say message', type: 'message', text: 'Rice=米' },
              },
              {
                imageUrl: buttonsImageURL,
                action: {
                  label: 'datetime',
                  type: 'datetimepicker',
                  data: 'DATETIME',
                  mode: 'datetime',
                },
              },
            ]
          },
        }
      );
    case 'datetime':
      return client.replyMessage(
        replyToken,
        {
          type: 'template',
          altText: 'Datetime pickers alt text',
          template: {
            type: 'buttons',
            text: 'Select date / time !',
            actions: [
              { type: 'datetimepicker', label: 'date', data: 'DATE', mode: 'date' },
              { type: 'datetimepicker', label: 'time', data: 'TIME', mode: 'time' },
              { type: 'datetimepicker', label: 'datetime', data: 'DATETIME', mode: 'datetime' },
            ],
          },
        }
      );
    case 'imagemap':
      return client.replyMessage(
        replyToken,
        {
          type: 'imagemap',
          baseUrl: `${baseURL}/static/rich`,
          altText: 'Imagemap alt text',
          baseSize: { width: 1040, height: 1040 },
          actions: [
            { area: { x: 0, y: 0, width: 520, height: 520 }, type: 'uri', linkUri: 'https://store.line.me/family/manga/en' },
            { area: { x: 520, y: 0, width: 520, height: 520 }, type: 'uri', linkUri: 'https://store.line.me/family/music/en' },
            { area: { x: 0, y: 520, width: 520, height: 520 }, type: 'uri', linkUri: 'https://store.line.me/family/play/en' },
            { area: { x: 520, y: 520, width: 520, height: 520 }, type: 'message', text: 'URANAI!' },
          ],
        }
      );
    case 'bye':
      switch (source.type) {
        case 'user':
          return replyText(replyToken, 'Bot can\'t leave from 1:1 chat');
        case 'group':
          return replyText(replyToken, 'Leaving group')
            .then(() => client.leaveGroup(source.groupId));
        case 'room':
          return replyText(replyToken, 'Leaving room')
            .then(() => client.leaveRoom(source.roomId));
      }
    default:
      console.log(`Echo message to ${replyToken}: ${message.text}`);
      return replyText(replyToken, message.text);
  }
}

function handleImage(message, replyToken) {
  const downloadPath = path.join(__dirname, 'downloaded', `${message.id}.jpg`);
  const previewPath = path.join(__dirname, 'downloaded', `${message.id}-preview.jpg`);

  return downloadContent(message.id, downloadPath)
    .then((downloadPath) => {
      // ImageMagick is needed here to run 'convert'
      // Please consider about security and performance by yourself
      cp.execSync(`convert -resize 240x jpeg:${downloadPath} jpeg:${previewPath}`);

      return client.replyMessage(
        replyToken,
        {
          type: 'image',
          originalContentUrl: baseURL + '/downloaded/' + path.basename(downloadPath),
          previewImageUrl: baseURL + '/downloaded/' + path.basename(previewPath),
        }
      );
    });
}

function handleVideo(message, replyToken) {
  const downloadPath = path.join(__dirname, 'downloaded', `${message.id}.mp4`);
  const previewPath = path.join(__dirname, 'downloaded', `${message.id}-preview.jpg`);

  return downloadContent(message.id, downloadPath)
    .then((downloadPath) => {
      // FFmpeg and ImageMagick is needed here to run 'convert'
      // Please consider about security and performance by yourself
      cp.execSync(`convert mp4:${downloadPath}[0] jpeg:${previewPath}`);

      return client.replyMessage(
        replyToken,
        {
          type: 'video',
          originalContentUrl: baseURL + '/downloaded/' + path.basename(downloadPath),
          previewImageUrl: baseURL + '/downloaded/' + path.basename(previewPath),
        }
      );
    });
}

function handleAudio(message, replyToken) {
  const downloadPath = path.join(__dirname, 'downloaded', `${message.id}.m4a`);

  return downloadContent(message.id, downloadPath)
    .then((downloadPath) => {
      return client.replyMessage(
        replyToken,
        {
          type: 'audio',
          originalContentUrl: baseURL + '/downloaded/' + path.basename(downloadPath),
          duration: 1000,
        }
      );
    });
}

function downloadContent(messageId, downloadPath) {
  return client.getMessageContent(messageId)
    .then((stream) => new Promise((resolve, reject) => {
      const writable = fs.createWriteStream(downloadPath);
      stream.pipe(writable);
      stream.on('end', () => resolve(downloadPath));
      stream.on('error', reject);
    }));
}

function handleLocation(message, replyToken) {
  var target = logic.getCurrnetDestination(message.userId);

  // 目的地からの距離を計算
  var dist = Math.sqrt(
    Math.pow((target.latitude - message.latitude) / 0.0111, 2) +
    Math.pow((target.longitude - message.longitude) / 0.0091, 2)
  );

  if (dist < 0.5) {
    // 距離が0.5km以内だったら目的地に居るものとして扱う
    return handleAtDestination(message, dist, replyToken);
  } else {
    // 目的地以外
    return handleAtOther(message, dist, replyToken);
  }
}

function handleAtDestination(message, dist, replyToken) {
  var money = logic.getMoneyAtLocation(message);
  return replyText(replyToken, `目的地（東京駅）に到着しました。${money}円ゲット！`);

  // async.waterfall([
  //   function (next) {
  //     MongoClient.connect('mongodb://localhost:27017/myDB', (err, db) => {
  //       var collection = db.collection(message.userId);

  //       // コレクションにドキュメントを挿入
  //       collection.insertOne({
  //         "price": money
  //       }, (error, result) => {
  //         db.close();
  //         next(null);
  //       });
  //     });
  //   },
  //   function () {
  //     replyText(replyToken, `目的地（東京駅）に到着しました。${money}円ゲット！`);
  //   }
  // ]);
}

function handleAtOther(message, dist, replyToken) {
  return replyText(replyToken, `次の目的地は東京駅です。目的地まであと${dist}km。`);
}

function handleSticker(message, replyToken) {
  return client.replyMessage(
    replyToken,
    {
      type: 'sticker',
      packageId: message.packageId,
      stickerId: message.stickerId,
    }
  );
}

// listen on port
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`listening on ${port}`);
});