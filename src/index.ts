import {serve} from '@hono/node-server';
import {Movie} from './movie-type.js';
import{Hono} from 'hono';
import movieRouter from './routes.js';

const app = new Hono();

app.route("/", movieRouter);

serve({
  fetch: app.fetch,
  port: 5000,
});

console.log("Server running at http://localhost:5000");
