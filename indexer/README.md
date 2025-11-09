# Starboard - Indexer


## Getting started

Review `.env` file.

### Prerequisites

* Node.js (version 20.x and above)
* Docker

### Run indexer

```bash
# Install dependencies
pnpm install

# Compile the project
pnpm build

# Launch Postgres database to store the data
docker compose up -d

# Apply database migrations to create the target schema
pnpm apply:migration

# Run indexer
node -r dotenv/config lib/main.js
# or (this does not require the project to be build)
pnpm start

# Run API, update db connection params
pnpm exec postgraphile -c "postgres://postgres:postgres@localhost:23751/postgres" --enhance-graphiql

# Erase the indexer data
docker compose down -v

# Checkout the indexer
docker exec "indexer-db-1" psql -U postgres \
  -c "select * from migrations"

# Checkout out recent prices
docker exec "indexer-db-1" psql -U postgres \
  -c "select * from price order by timestamp desc limit 12"

# Checkout out recent positions
docker exec "indexer-db-1" psql -U postgres \
  -c "select * from position order by timestamp desc limit 12;"
```

## E2E Tests

End to end tests are executed with the bash script `e22/run.sh`.
It depends on the `contracts` package: to run the fuel test node and deploy contracts.
The script runs the fuel node, deploys contracts and mocks, executes a test script,
starts up the database, starts up the indexer, waits for the indexer to process the events
and shuts everything down.

Run an example test
```shell
./e2e/run.sh e2e/populate-events-price.ts
```

The interactive mode simply waits for Ctrl-C to initialize the shutdown 
in order to enable the infrastructure for other test purposes
```shell
./e2e/run.sh e2e/populate-events-price.ts i
```

The script `e2e/populate-events-price.ts` is the referencial.
To provide more tests, copy the script and replace the section with testing code.
Each test scripts requires a separate execution of `run.sh`.

## Migrations

**NOTICE.** Important when changing the schema and generating migrations scripts.

Some functionalities are enable through db views.
Views are not generated from the schema, they are provided with custom migrations scripts.
See `db/migrations/1762648930785-Data.js` for instance.
Such scripts are marked with the comment `// NON GENERATED MIGRATION`.
In case the schema is changed, views may need to be updated as well - it must be done manually.
