const fastify = require('fastify')()

fastify.register(require('..'), {
  connectionString: 'postgres://postgres:postgres@localhost:5432/postgres',
  bigIntMode: 'string'
})

fastify.get('/', async (req, reply) => {
  const result = await fastify.pg.db.query(fastify.pg.sql`SELECT NOW()`)
  return reply.send(result)
})

fastify.listen({ port: 3000 }, err => {
  if (err) throw err
})
