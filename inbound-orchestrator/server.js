require('dotenv').config();
const express = require('express');
const WebSocket = require('ws');

const app = express();
app.use(express.json());

const AGENTICFLOW_API_KEY = process.env.AGENTICFLOW_API_KEY;
const AGENTICFLOW_TEAMSPACE_ID = process.env.AGENTICFLOW_TEAMSPACE_ID;

// Try a different WebSocket endpoint pattern
const WEBSOCKET_URL = `wss://api.agenticflow.ai/ws/agent/run?api_key=${AGENTICFLOW_API_KEY}`;

app.post('/api/inbound/start-analysis', (req, res) => {
  const { keywords, agentId } = req.body;

  if (!keywords || !agentId) {
    return res.status(400).json({ error: 'Keywords and agentId are required.' });
  }

  console.log('Initiating WebSocket connection with API key authentication...');
  console.log('WebSocket URL:', WEBSOCKET_URL);
  console.log('API Key length:', AGENTICFLOW_API_KEY ? AGENTICFLOW_API_KEY.length : 0);

  // The 'ws' library does not reliably pass custom headers through all infrastructure.
  // Authentication is now handled via the query parameter in the URL.
  const ws = new WebSocket(WEBSOCKET_URL);

  ws.on('open', () => {
    console.log('WebSocket connection established. Sending RUN event...');

    const payload = {
      event: 'RUN',
      data: {
        input: keywords.join('\n'),
        agentId: agentId,
        workspaceId: AGENTICFLOW_TEAMSPACE_ID,
        threadId: null
      }
    };

    console.log('Sending payload:', JSON.stringify(payload, null, 2));
    ws.send(JSON.stringify(payload));

    res.status(202).json({ 
      message: 'Audience analysis run initiated successfully via WebSocket.'
    });
  });

  ws.on('message', (data) => {
    console.log('Received message from AgenticFlow:', data.toString());
  });

  ws.on('close', (code, reason) => {
    console.log('WebSocket connection closed. Code:', code, 'Reason:', reason);
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error.message);
  });
});

const PORT = process.env.PORT || 8083;
app.listen(PORT, () => {
  console.log(`Inbound Orchestrator (WebSocket) listening on port ${PORT}`);
}); 