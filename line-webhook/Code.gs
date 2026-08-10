// 婚禮 LINE 官方帳號 — Webhook（獨立專案，不依賴 wedding-rsvp）
// 貼入 Apps Script 編輯器後部署為「網頁應用程式」
//
// 部署前必做一次：
//   左側齒輪圖示「專案設定」→「指令碼屬性」→「新增指令碼屬性」
//   屬性名稱：LINE_CHANNEL_ACCESS_TOKEN
//   值：你的 LINE Channel access token（長期）
//   這樣 token 不會出現在程式碼裡，也不會被推到 GitHub 上。

function doPost(e) {
  const body = JSON.parse(e.postData.contents);
  const events = body.events || [];

  events.forEach(function (event) {
    if (event.type !== 'message' || event.message.type !== 'text') return;

    const text = event.message.text.trim();
    let messages = null;

    if (text === '婚禮資訊') {
      messages = [
        { type: 'image', originalContentUrl: LINE_IMAGES.invitation, previewImageUrl: LINE_IMAGES.invitation }
      ];
    } else if (text === '交通指南') {
      messages = [
        { type: 'image', originalContentUrl: LINE_IMAGES.directionsMap, previewImageUrl: LINE_IMAGES.directionsMap },
        { type: 'text', text: DIRECTIONS_TEXT }
      ];
    }
    // 之後座位查詢功能會在這裡加一個 else if，比對姓名查表回覆桌次

    if (messages) {
      replyToLine(event.replyToken, messages);
    }
  });

  return ContentService
    .createTextOutput(JSON.stringify({ result: 'ok' }))
    .setMimeType(ContentService.MimeType.JSON);
}

const LINE_IMAGES = {
  invitation: 'https://r-ru.github.io/cong-ru/invitation-card-1.jpg',
  directionsMap: 'https://r-ru.github.io/cong-ru/directions-map.jpg'
};

const DIRECTIONS_TEXT =
  '芳庭路壹號莊園｜台中市北屯區民政里芳庭路1號\n\n' +
  '𝑮𝒐𝒐𝒈𝒍𝒆 𝑴𝒂𝒑｜https://reurl.cc/6XNymV\n\n' +
  '場地設有停車空間 (˶ ᵔ ᵕ ᵔ ˶)\n' +
  '採先到先停，抵達後請依現場指引停車';

function replyToLine(replyToken, messages) {
  const token = PropertiesService.getScriptProperties().getProperty('LINE_CHANNEL_ACCESS_TOKEN');
  UrlFetchApp.fetch('https://api.line.me/v2/bot/message/reply', {
    method: 'post',
    contentType: 'application/json',
    headers: { Authorization: 'Bearer ' + token },
    payload: JSON.stringify({ replyToken: replyToken, messages: messages }),
    muteHttpExceptions: true
  });
}

// 手動測試用（可忽略）
function doGet() {
  return ContentService.createTextOutput('LINE webhook endpoint is live.');
}
