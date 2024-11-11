# Workerspy

Debug HTTP requests with a simple proxy. Create a proxy endpoint and inspect all incoming requests in real-time. That's it. That's all it does.

## Getting Started

```bash
pnpm install
```

You will need to set up a Cloudflare account and be logged into Wrangler CLI.

### Create D1 Database

```
pnpm wrangler d1 create workerspy-proxy-db
```

```
pnpm db:migrate:local
```

### Web .dev.vars

Place the following in `packages/web/.dev.vars`:

```
PROXY_HOST_ROOT="proxy.spy.test"
API_HOST="localhost:8787"
ACCOUNT_ID="<your account id>"
ANALYTICS_ACCOUNT_TOKEN="<your analytics account token>"
```

See [Querying from a Worker](https://developers.cloudflare.com/analytics/analytics-engine/worker-querying/) for more information on how to get your analytics account token.

### Worker .dev.vars

Place the following in `packages/worker/.dev.vars`:

```
PROXY_HOST_ROOT="proxy.spy.test"
```

### Start the Worker and Web App

```
pnpm dev
```

### Note on .test subdomains

Because this project was going to use subdomains in production, I decided to use [`localias`](https://github.com/peterldowns/localias) in local development. It's a great way to have a real `.test` subdomain point to your local machine.

Once you've created a Proxy in the web UI, you can get its ID and update the localias configs.

```
localias set proxy.spy.test 8787
```

```
localias run
```

## Deploying

### Web

I would personally recommend using the web UI in the Cloudflare dashboard to manually create the web pages project (since I do not believe you can enable GitHub after the fact):

```
Template: Remix
Name: `workerspy-web`
Build Command: `pnpm build`
Build output directory: `build/client`
Root Directory: `packages/web`
```

Note that for me, the first time I built the project, it failed because it did not properly take into account the nodejs compatibility flags even though they were present in the wrangler.toml file. When I tried to build it again, it worked fine.

You will also need to set the following secrets so it can access the Cloudflare Analytics data:

```
wrangler secret put ANALYTICS_ACCOUNT_TOKEN
```

```
wrangler secret put ACCOUNT_ID
```

### Worker

For this, I would use the CLI command from your local machine to create the first project and then later enable the beta GitHub integration.

From `packages/worker`:

```
pnpm run deploy
```

Once the project is created, you can go into the Build settings of your Worker and enable GitHub integration:

```
Build command: None
Deploy command: `pnpm run deploy`
Root directory: `/packages/worker`
```

### Custom domains

You will want to point the Web and Worker projects to your custom domains. I would recommend having the root domain point to the Web app and then the `api.[domain]` and `proxy.[domain]` subdomains point to the Worker.

You will want to update the wrangler vars to point to your custom domains.
