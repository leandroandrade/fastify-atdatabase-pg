const fastify = require('fastify')()

fastify.register(require('..'), {
  namespace: 'primary',
  connectionString: 'postgres://postgres:postgres@localhost:5432/postgres',
  bigIntMode: 'string'
})

fastify.register(require('..'), {
  namespace: 'secondary',
  connectionString: 'postgres://postgres:postgres@localhost:5432/postgres',
  bigIntMode: 'string'
})

fastify.get('/primary', async (req, reply) => {
  const result = await fastify.pg.primary.db.query(fastify.pg.primary.sql`SELECT NOW()`)
  return reply.send(result)
})

fastify.get('/secondary', async (req, reply) => {
  const result = await fastify.pg.secondary.db.query(fastify.pg.secondary.sql`SELECT NOW()`)
  return reply.send(result)
})

fastify.listen({ port: 3000 }, err => {
  if (err) throw err
})
