import fastify from "fastify";
import cookie from '@fastify/cookie'

import { createPoll } from "./routes/create-poll";
import { getPoll } from "./routes/get-poll";
import { voteOnPoll } from "./routes/vote-on-poll";

const app = fastify()

app.register(cookie, {
  secret: '68cbf17441e1f4329deba802e25989f4',
  hook: 'onRequest',
})

app.register(createPoll)
app.register(getPoll)
app.register(voteOnPoll)

app.listen({ port: 3333 }).then(() => {
  console.log('HTTP server running')
})