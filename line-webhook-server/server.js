const http = require('http');

const LINE_IMAGES = {
  invitation: 'https://r-ru.github.io/cong-ru/invitation-card-1.jpg',
  dressCode: 'https://r-ru.github.io/cong-ru/dress-code.jpg',
  directionsMap: 'https://r-ru.github.io/cong-ru/directions-map.jpg'
};

const DIRECTIONS_TEXT =
  '-婚禮場地：芳庭路壹號莊園-B廳\n' +
  '-婚禮地址：台中市北屯區民政里芳庭路1號\n' +
  '-Google Map：https://maps.app.goo.gl/juqoY9BHzJi2z3C27\n\n' +
  '場地設有停車空間 (˶ ᵔ ᵕ ᵔ ˶)\n' +
  '採先到先停，抵達後請依現場指引停車~';

async function replyToLine(replyToken, messages) {
  const token = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  const res = await fetch('https://api.line.me/v2/bot/message/reply', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    },
    body: JSON.stringify({ replyToken, messages })
  });
  if (!res.ok) {
    console.error('LINE reply failed', res.status, await res.text());
  }
}

function buildReply(text) {
  if (text === '婚禮資訊') {
    return [
      { type: 'image', originalContentUrl: LINE_IMAGES.invitation, previewImageUrl: LINE_IMAGES.invitation },
      { type: 'image', originalContentUrl: LINE_IMAGES.dressCode, previewImageUrl: LINE_IMAGES.dressCode }
    ];
  }
  if (text === '交通指南') {
    return [
      { type: 'image', originalContentUrl: LINE_IMAGES.directionsMap, previewImageUrl: LINE_IMAGES.directionsMap },
      { type: 'text', text: DIRECTIONS_TEXT }
    ];
  }
  // 之後座位查詢功能會在這裡加一個分支，比對姓名查表回覆桌次
  return null;
}

const server = http.createServer((req, res) => {
  if (req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('LINE webhook endpoint is live.');
    return;
  }

  if (req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ result: 'ok' }));

      try {
        const data = JSON.parse(body || '{}');
        const events = data.events || [];
        events.forEach(event => {
          if (event.type !== 'message' || event.message.type !== 'text') return;
          const messages = buildReply((event.message.text || '').trim());
          if (messages) replyToLine(event.replyToken, messages);
        });
      } catch (err) {
        console.error('Webhook processing error', err);
      }
    });
    return;
  }

  res.writeHead(404);
  res.end();
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log('Listening on port ' + PORT));
