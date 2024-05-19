const fastify = require('fastify')()

fastify.register(require('..'), {
  connectionString: 'postgres://postgres:postgres@localhost:5432/postgres',
  bigIntMode: 'string'
})

fastify.get('/:text', async (req, reply) => {
  const { text } = req.params

  const options = {
    tableName: 'samples',
    columnTypes: {
      sample_data: fastify.pg.sql`TEXT`
    }
  }
  const columnsToInsert = [
    'sample_data'
  ]
  const records = [
    { sample_data: text }
  ]

  await fastify.pg.bulkInsert(options, columnsToInsert, records)
  const results = await fastify.pg.db.query(fastify.pg.sql`SELECT * FROM samples`)
  return reply.send(results)
})

fastify.listen({ port: 3000 }, err => {
  if (err) throw err
})
