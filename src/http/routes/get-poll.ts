import { FastifyInstance } from "fastify"
import z from "zod"
import prisma from "../../lib/prisma"
import { redis } from "../../lib/redis"

export async function getPoll(app: FastifyInstance) {
  app.get('/polls/:pollId', async (request, reply) => {
    const getPollParams = z.object({
      pollId: z.string().uuid()
    })
  
    const { pollId } = getPollParams.parse(request.params)
  
    const poll = await prisma.poll.findUnique({
      where: {
        id: pollId
      },
      include: {
        options: {
          select: {
            id: true,
            title: true
          }
        }
      }
    })

    if(!poll) {
      return reply.status(404).send({
        message: 'Poll not found'
      })
    }

    const INITIAL_OPTION = 0
    const ALL_OPTIONS = -1
    const result = await redis.zrange(pollId, INITIAL_OPTION, ALL_OPTIONS, 'WITHSCORES')

    const votes = result.reduce((acc, item, index) => {
      if(index % 2 === 0) {
        acc[item] = Number(result[index + 1])
      }

      return acc
    }, {} as Record<string, number>)
  
    return reply.send({ 
      poll: {
        id: poll.id,
        title: poll.title,
        options: poll.options.map(option => {
          return {
            id: option.id,
            title: option.title,
            votes: votes[option.id] ?? 0
          }
        })
      }
     })
  })
}