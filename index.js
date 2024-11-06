const fp = require('fastify-plugin')
const createConnectionPool = require('@databases/pg')
const bulk = require('@databases/pg-bulk')

async function fastifyAtdatabasePg (fastify, options) {
  const { namespace, ...opts } = options

  const { sql } = createConnectionPool
  const db = createConnectionPool(opts)

  fastify.addHook('onClose', (_, done) => {
    db.dispose().then(done)
  })

  const bulkInsert = async (options, columnsToInsert, records) => {
    await bulk.bulkInsert({
      database: db,
      ...options,
      columnsToInsert,
      records
    })
  }

  const decoratorObject = {
    sql,
    db,
    bulkInsert
  }

  if (namespace) {
    if (!fastify.pg) {
      fastify.decorate('pg', {})
    }

    if (fastify.pg[namespace]) {
      throw new Error(`fastify-atdatabase-pg has already been registered with namespace "${namespace}"`)
    }

    fastify.pg[namespace] = decoratorObject
  } else {
    if (fastify.pg) {
      throw new Error('fastify-atdatabase-pg has default namespace "pg" is already registered')
    }

    fastify.decorate('pg', decoratorObject)
  }
}

module.exports = fp(fastifyAtdatabasePg, {
  fastify: '>=4.x',
  name: 'fastify-atdatabase-pg'
})

module.exports.default = fastifyAtdatabasePg
module.exports.fastifyAtdatabasePg = fastifyAtdatabasePg
