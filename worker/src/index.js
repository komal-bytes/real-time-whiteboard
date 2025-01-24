import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { Whiteboard } from './whiteboard';

const app = new Hono();

app.use('*', cors());

app.options('*', (c) => {
  return c.json({}, 200);
});

app.post('/createBoard', async (c) => {
  try {
    const { name: boardName } = await c.req.json();
    // Default board data
    const boardData = {
      boardId: crypto.randomUUID(),
      boardName,
      backgroundColor: "#FFFFFF",
      elements: []
    };
    // Store the new board in KV
    await c.env.WHITEBOARD_KV.put(boardData.boardId, JSON.stringify(boardData));
    // Return the board ID
    return c.json({ boardId: boardData.boardId }, 201);
  } catch (error) {
    console.error("Error creating board:", error);
    return c.json({ message: "Internal Server Error" }, 500);
  }
});

app.get('/listOfBoards', async (c) => {
  try {
    const keys = await c.env.WHITEBOARD_KV.list();
    const boardList = [];
    for (const key of keys.keys) {
      const boardData = await c.env.WHITEBOARD_KV.get(key.name);
      boardList.push(JSON.parse(boardData));
    }
    return c.json({ boardList }, 200);
  } catch (error) {
    console.error("Error fetching boards:", error);
    return c.json({ message: "Internal Server Error" }, 500);
  }
});

app.get('/board/:id', async (c) => {
  try {
    const boardId = c.req.param('id');
    const boardData = await c.env.WHITEBOARD_KV.get(boardId);
    if (!boardData) {
      return c.json({ message: `Board with ID ${boardId} not found` }, 404);
    }

    return c.json({ boardData: JSON.parse(boardData) }, 200);
  } catch (error) {
    console.error("Error fetching board details:", error);
    return c.json({ message: "Internal Server Error" }, 500);
  }
});

app.all('*', async (c) => {
  return c.text('Not Found', 404);
});

export default {
  fetch(request, env, whatever) {
    console.log(request.headers.get('upgrade') , "upgrade")
    if (request.headers.get('upgrade') === 'websocket') {
      // console.log("request.", request.url.)
      const boardId = new URL(request.url).pathname.slice("/board".length);
      console.log("id", boardId)
      const id = env.WHITEBOARD.idFromName(boardId);
      const obj = env.WHITEBOARD.get(id);
      return obj.fetch(request);
    }
    return app.fetch(request, env, whatever)
  }
};

export { Whiteboard };
