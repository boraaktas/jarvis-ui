// Quick WebSocket test
const WebSocket = require('ws');

const ws = new WebSocket('ws://127.0.0.1:18789');

ws.on('open', () => {
  console.log('✅ Connected!');
  ws.send(JSON.stringify({
    method: 'connect',
    params: {
      auth: {
        token: 'e8567391485f6a532c333d0e774dd37971569f13acbdb093'
      }
    }
  }));
  
  setTimeout(() => {
    ws.send(JSON.stringify({
      method: 'chat.send',
      params: {
        message: 'test',
        sessionKey: 'jarvis-ui-test'
      }
    }));
  }, 100);
});

ws.on('message', (data) => {
  console.log('📨 Received:', data.toString());
});

ws.on('error', (error) => {
  console.error('❌ Error:', error.message);
});

ws.on('close', () => {
  console.log('👋 Closed');
  process.exit(0);
});

setTimeout(() => {
  ws.close();
}, 2000);
