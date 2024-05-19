# fastify-atdatabase-pg

This module provides a way to connect to PostgreSQL database using [@databases/pg](https://www.atdatabases.org/docs/pg)

## Install
```
npm i fastify-atdatabase-pg
```

## Usage
Add it to you project with `register` and you are done!

```js
const fastify = require('fastify')()

fastify.register(require('fastify-atdatabase-pg'), {
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
```

You can also connect with different databases using namespaces to differentiate each other:
```js
const fastify = require('fastify')()

fastify.register(require('fastify-atdatabase-pg'), {
  namespace: 'primary',
  connectionString: 'postgres://postgres:postgres@primary:5432/primary',
  bigIntMode: 'string'
})

fastify.register(require('fastify-atdatabase-pg'), {
  namespace: 'secondary',
  connectionString: 'postgres://postgres:postgres@secondary:5432/secondary',
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
```

Bulk insert is also available:
```js
const fastify = require('fastify')()

fastify.register(require('fastify-atdatabase-pg'), {
    connectionString: 'postgres://postgres:postgres@localhost:5432/postgres',
    bigIntMode: 'string'
})

fastify.get('/:text', async (req, reply) => {
  const {text} = req.params

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
    { sample_data: text },
  ]

  await fastify.pg.bulkInsert(options, columnsToInsert, records)
  const results = await fastify.pg.db.query(fastify.pg.sql`SELECT * FROM samples`)
  return reply.send(results)
})

fastify.listen({ port: 3000 }, err => {
  if (err) throw err
})
```

## Documentation

More details about `@databases/pg` documentation, see [@databases/pg](https://www.atdatabases.org/docs/pg)

## License

[MIT License](https://github.com/leandroandrade/fastify-atdatabase-pg/blob/main/LICENSE/)
