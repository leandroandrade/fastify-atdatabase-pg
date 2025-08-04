'use strict'

const { test } = require('node:test')
const Fastify = require('fastify')
const fastifyAtdatabasePg = require('..')
const crypto = require('crypto')

const options = {
  connectionString: 'postgres://postgres:postgres@localhost:5432/postgres',
  bigIntMode: 'string'
}

test('fastify-atdatabase-pg is correctly defined', async t => {
  const fastify = Fastify()
  t.after(async () => { await fastify.close() })

  await fastify.register(fastifyAtdatabasePg, options)

  await fastify.ready()
  t.assert.ok(fastify.pg)
})

test('fastify-atdatabase-pg should connect to databse', async t => {
  const fastify = Fastify()
  t.after(async () => { await fastify.close() })

  await fastify.register(fastifyAtdatabasePg, options)

  try {
    const result = await fastify.pg.db.query(fastify.pg.sql`SELECT NOW()`)
    t.assert.ok(result.length)
  } catch (err) {
    t.assert.ifError(err)
  }
})

test('fastify-atdatabase-pg should do bulk insert', async t => {
  const fastify = Fastify()
  t.after(async () => {
    await fastify.pg.db.query(fastify.pg.sql`TRUNCATE TABLE samples`)
    await fastify.close()
  })

  await fastify.register(fastifyAtdatabasePg, options)

  try {
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
      { sample_data: crypto.randomUUID() },
      { sample_data: crypto.randomUUID() },
      { sample_data: crypto.randomUUID() },
      { sample_data: crypto.randomUUID() }
    ]

    await fastify.pg.bulkInsert(options, columnsToInsert, records)
    const results = await fastify.pg.db.query(fastify.pg.sql`SELECT * FROM samples`)
    t.assert.ok(results.length)
    t.assert.equal(results.length, 4)
  } catch (err) {
    t.assert.ifError(err)
  }
})

test('fastify-atdatabase-pg throw error when default namespace already registered', async t => {
  const fastify = Fastify()
  t.after(async () => { await fastify.close() })

  try {
    await fastify.register(fastifyAtdatabasePg, options)
    await fastify.register(fastifyAtdatabasePg, options)
  } catch (err) {
    t.assert.ok(err)
    t.assert.equal(err.message, 'fastify-atdatabase-pg has default namespace "pg" is already registered')
  }
})

test('fastify-atdatabase-pg throw error when same namespace already registered', async t => {
  const fastify = Fastify()
  t.after(async () => { await fastify.close() })

  try {
    await fastify.register(fastifyAtdatabasePg, { ...options, namespace: 'conn1' })
    await fastify.register(fastifyAtdatabasePg, { ...options, namespace: 'conn1' })
  } catch (err) {
    t.assert.ok(err)
    t.assert.equal(err.message, 'fastify-atdatabase-pg has already been registered with namespace "conn1"')
  }
})

test('fastify-atdatabase-pg should connect to databse with different namespaces', async t => {
  const fastify = Fastify()
  t.after(async () => { await fastify.close() })

  await fastify.register(fastifyAtdatabasePg, { ...options, namespace: 'conn1' })
  await fastify.register(fastifyAtdatabasePg, { ...options, namespace: 'conn2' })

  try {
    const resultConn1 = await fastify.pg.conn1.db.query(fastify.pg.conn1.sql`SELECT NOW()`)
    t.assert.ok(resultConn1.length)

    const resultConn2 = await fastify.pg.conn2.db.query(fastify.pg.conn2.sql`SELECT NOW()`)
    t.assert.ok(resultConn2.length)
  } catch (err) {
    t.assert.ifError(err)
  }
})

test('fastify-atdatabase-pg should do bulk insert using custom namespace', async t => {
  const fastify = Fastify()
  t.after(async () => {
    await fastify.pg.my_conn.db.query(fastify.pg.my_conn.sql`TRUNCATE TABLE samples`)
    await fastify.close()
  })

  await fastify.register(fastifyAtdatabasePg, { ...options, namespace: 'my_conn' })

  try {
    const options = {
      tableName: 'samples',
      columnTypes: {
        sample_data: fastify.pg.my_conn.sql`TEXT`
      }
    }
    const columnsToInsert = [
      'sample_data'
    ]
    const records = [
      { sample_data: crypto.randomUUID() },
      { sample_data: crypto.randomUUID() },
      { sample_data: crypto.randomUUID() },
      { sample_data: crypto.randomUUID() },
      { sample_data: crypto.randomUUID() }
    ]

    await fastify.pg.my_conn.bulkInsert(options, columnsToInsert, records)
    const results = await fastify.pg.my_conn.db.query(fastify.pg.my_conn.sql`SELECT * FROM samples`)
    t.assert.ok(results.length)
    t.assert.equal(results.length, 5)
  } catch (err) {
    t.assert.ifError(err)
  }
})
