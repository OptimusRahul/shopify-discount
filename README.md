# Volume Discount Shopify App

Automatic "Buy 2, Get X% Off" discount application with admin configuration UI and storefront widgets.

## Overview

This Shopify app enables merchants to create volume discounts that automatically apply when customers add 2 or more units of configured products to their cart. The app includes:

- **Admin Configuration UI**: Select products and set discount percentage (1-80%)
- **Discount Function**: Automatic cart-level discounts via Shopify Functions
- **Theme Widgets**: Display promotional messages on product pages and cart
- **Metafield Storage**: Configuration stored in Shopify metafields (no external database required)

## Architecture

```
┌─────────────────┐
│   Admin UI      │ ──┐
│ (React Router)  │   │
└─────────────────┘   │
                      ▼
              ┌───────────────┐
              │   Metafields  │
              │  (Shop Data)  │
              └───────────────┘
                      ▲
         ┌────────────┴────────────┐
         │                         │
    ┌────┴─────┐          ┌───────┴────────┐
    │ Discount │          │ Theme Widget   │
    │ Function │          │    (Liquid)    │
    └──────────┘          └────────────────┘
         │                         │
         ▼                         ▼
    ┌─────────┐          ┌────────────────┐
    │  Cart   │          │ Product Pages  │
    └─────────┘          └────────────────┘
```

### Technology Stack

- **Frontend**: React Router 7 + Polaris Web Components
- **Backend**: Node.js + Shopify Admin API (GraphQL)
- **Storage**: Shopify Metafields (namespace: `volume_discount`, key: `rules`)
- **Session Storage**: Prisma + SQLite
- **Discount Logic**: Shopify Functions (JavaScript)
- **Widgets**: Theme App Extensions (Liquid)

## Prerequisites

Before you begin, ensure you have:

1. **Shopify Partner Account**: [Create one here](https://www.shopify.com/partners)
2. **Development Store**: Set up from your Partner Dashboard
3. **Shopify CLI**: [Installation guide](https://shopify.dev/docs/apps/tools/cli/getting-started)
4. **Node.js**: Version 20.19+ or 22.12+
5. **npm**: Comes with Node.js

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Database

Generate Prisma client and run migrations:

```bash
npm run setup
```

### 3. Start Development Server

```bash
npm run dev
```

This will:
- Start the app server
- Create a tunnel to your local environment
- Prompt you to select a Partner organization and app
- Open the app in your browser for installation

### 4. Install App on Development Store

- Press `P` in the terminal to open the app installation URL
- Click "Install" to authorize the app
- The app requires these scopes:
  - `write_discounts`: Create automatic discounts
  - `read_products`: Product picker functionality
  - `write_metafields`: Store configuration
  - `read_metafields`: Read configuration

### 5. Deploy Extensions

Deploy the Discount Function and Theme App Extensions:

```bash
npm run deploy
```

This deploys:
- **volume-discount-function**: Discount calculation logic
- **volume-discount-widget**: PDP and cart widgets

### 6. Create Automatic Discount

**Important**: The discount function won't work until you create an automatic discount in Shopify Admin.

1. Go to your dev store Admin → **Discounts**
2. Click **Create discount** → **Automatic discount**
3. Select your function: **volume-discount-function**
4. Set title: "Buy 2 Get X% Off" (or any title)
5. Click **Save**

### 7. Add Theme Widget

Add the widget to your product pages:

1. Go to **Online Store** → **Themes** → **Customize**
2. Navigate to a product page
3. Click **Add section** or **Add block**
4. Find **Apps** → **Volume Discount Banner**
5. Position it in the Product Information section
6. Click **Save**

Optional: Add the cart widget (`Cart Volume Discount Banner`) to your cart page.

## Usage

### Configuring Discounts (Admin)

1. Open the app from your Shopify Admin → **Apps** → **discount**
2. Click **Select Products** to open the product picker
3. Choose one or more products that should have the volume discount
4. Set **Discount %** (1-80%)
5. Click **Save Configuration**

The configuration is immediately saved to shop metafields and will be used by:
- The Discount Function (for cart discounts)
- The Theme Widgets (for promotional messages)

### Customer Experience

**Product Page:**
- Customers see a promotional banner: "🎉 Buy 2, get X% off!"
- Banner only appears on configured products

**Cart:**
- Adding 1 unit: No discount applied
- Adding 2+ units: X% discount automatically applied to those items
- Optional cart banner confirms: "✅ Volume discount applied!"

**Checkout:**
- Discount appears in order summary
- Works with other compatible discounts (following Shopify's discount stacking rules)

## Configuration Storage

**Metafield Details:**
- **Namespace**: `volume_discount`
- **Key**: `rules`
- **Type**: `json`
- **Owner**: Shop resource

**Data Format:**
```json
{
  "products": [
    "gid://shopify/Product/123456789",
    "gid://shopify/Product/987654321"
  ],
  "minQty": 2,
  "percentOff": 10
}
```

**Accessing via GraphiQL:**
```graphql
{
  shop {
    metafield(namespace: "volume_discount", key: "rules") {
      value
    }
  }
}
```

## Project Structure

```
discount/
├── app/
│   ├── routes/
│   │   └── app._index.tsx          # Admin configuration UI
│   ├── shopify.server.ts            # Shopify API configuration
│   └── db.server.ts                 # Prisma client
├── extensions/
│   ├── volume-discount-function/    # Discount Function
│   │   ├── src/
│   │   │   ├── run.js              # Discount logic
│   │   │   └── run.graphql         # Input query
│   │   └── shopify.extension.toml
│   └── volume-discount-widget/      # Theme App Extension
│       ├── blocks/
│       │   ├── product-discount-banner.liquid  # PDP widget
│       │   └── cart-discount-banner.liquid     # Cart widget
│       └── shopify.extension.toml
├── prisma/
│   └── schema.prisma                # Database schema (sessions only)
├── shopify.app.toml                 # App configuration & scopes
└── package.json
```

## Testing Checklist

### Admin Configuration
- [ ] Open app in Shopify Admin
- [ ] Product picker opens and allows selection
- [ ] Can select multiple products
- [ ] Can remove products from selection
- [ ] Discount percentage accepts values 1-80
- [ ] Save button shows loading state
- [ ] Success toast appears after save
- [ ] Configuration persists after page refresh

### Metafield Verification
```graphql
# Run in GraphiQL (Admin → Settings → Apps and sales channels → Develop apps → Your app → API credentials → Admin API)
{
  shop {
    metafield(namespace: "volume_discount", key: "rules") {
      value
    }
  }
}
```
- [ ] Metafield exists after configuration save
- [ ] JSON format is valid
- [ ] Product GIDs are correct format

### Product Page Widget
- [ ] Navigate to configured product page
- [ ] Widget displays: "🎉 Buy 2, get X% off!"
- [ ] Widget does NOT display on non-configured products
- [ ] Styling looks good and readable

### Cart Discount
- [ ] Add 1 unit of configured product → No discount
- [ ] Change quantity to 2 → Discount appears (X% off)
- [ ] Change quantity to 3 → Discount still applied
- [ ] Change back to 1 → Discount removed
- [ ] Mixed cart (configured + non-configured products) → Only configured items discounted

### Checkout
- [ ] Discount shows in order summary
- [ ] Discount amount calculation is correct
- [ ] Order can be placed successfully

## Limitations & Known Issues

1. **Fixed Minimum Quantity**: Currently hardcoded to 2 units. To change, update:
   - Discount function logic (`extensions/volume-discount-function/src/run.js`)
   - Widget message (`extensions/volume-discount-widget/blocks/*.liquid`)
   - Admin UI display

2. **Single Discount Rule**: All configured products share the same discount percentage. For per-product percentages, you'd need to restructure the config schema.

3. **Manual Discount Creation**: The automatic discount must be created manually in Shopify Admin. This is a Shopify platform requirement - functions don't auto-create discounts.

4. **Product Details in Admin**: When loading existing config, product titles aren't shown (only GIDs stored). Enhancement would query products by ID to display full details.

5. **No Discount Stacking Control**: Follows Shopify's default discount combination rules. To customize, add `combinesWith` settings in the discount function configuration.

## Deployment

### Application Storage

This template uses [Prisma](https://www.prisma.io/) to store session data, by default using an [SQLite](https://www.sqlite.org/index.html) database.
The database is defined as a Prisma schema in `prisma/schema.prisma`.

This use of SQLite works in production if your app runs as a single instance.
The database that works best for you depends on the data your app needs and how it is queried.
Here’s a short list of databases providers that provide a free tier to get started:

| Database   | Type             | Hosters                                                                                                                                                                                                                                    |
| ---------- | ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| MySQL      | SQL              | [Digital Ocean](https://www.digitalocean.com/products/managed-databases-mysql), [Planet Scale](https://planetscale.com/), [Amazon Aurora](https://aws.amazon.com/rds/aurora/), [Google Cloud SQL](https://cloud.google.com/sql/docs/mysql) |
| PostgreSQL | SQL              | [Digital Ocean](https://www.digitalocean.com/products/managed-databases-postgresql), [Amazon Aurora](https://aws.amazon.com/rds/aurora/), [Google Cloud SQL](https://cloud.google.com/sql/docs/postgres)                                   |
| Redis      | Key-value        | [Digital Ocean](https://www.digitalocean.com/products/managed-databases-redis), [Amazon MemoryDB](https://aws.amazon.com/memorydb/)                                                                                                        |
| MongoDB    | NoSQL / Document | [Digital Ocean](https://www.digitalocean.com/products/managed-databases-mongodb), [MongoDB Atlas](https://www.mongodb.com/atlas/database)                                                                                                  |

To use one of these, you can use a different [datasource provider](https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference#datasource) in your `schema.prisma` file, or a different [SessionStorage adapter package](https://github.com/Shopify/shopify-api-js/blob/main/packages/shopify-api/docs/guides/session-storage.md).

### Build

Build the app by running the command below with the package manager of your choice:

Using yarn:

```shell
yarn build
```

Using npm:

```shell
npm run build
```

Using pnpm:

```shell
pnpm run build
```

## Hosting

When you're ready to set up your app in production, you can follow [our deployment documentation](https://shopify.dev/docs/apps/launch/deployment) to host it externally. From there, you have a few options:

- [Google Cloud Run](https://shopify.dev/docs/apps/launch/deployment/deploy-to-google-cloud-run): This tutorial is written specifically for this example repo, and is compatible with the extended steps included in the subsequent [**Build your app**](tutorial) in the **Getting started** docs. It is the most detailed tutorial for taking a React Router-based Shopify app and deploying it to production. It includes configuring permissions and secrets, setting up a production database, and even hosting your apps behind a load balancer across multiple regions.
- [Fly.io](https://fly.io/docs/js/shopify/): Leverages the Fly.io CLI to quickly launch Shopify apps to a single machine.
- [Render](https://render.com/docs/deploy-shopify-app): This tutorial guides you through using Docker to deploy and install apps on a Dev store.
- [Manual deployment guide](https://shopify.dev/docs/apps/launch/deployment/deploy-to-hosting-service): This resource provides general guidance on the requirements of deployment including environment variables, secrets, and persistent data.

When you reach the step for [setting up environment variables](https://shopify.dev/docs/apps/deployment/web#set-env-vars), you also need to set the variable `NODE_ENV=production`.

## Troubleshooting

### Discount Not Applying

**Problem**: Discount doesn't appear in cart even with 2+ units

**Solutions**:
1. Verify automatic discount was created in Shopify Admin → Discounts
2. Check that the function is deployed: `npm run deploy`
3. Verify configuration is saved (check metafield in GraphiQL)
4. Ensure product GIDs in config match cart items
5. Check browser console for function errors

### Widget Not Displaying

**Problem**: Banner doesn't show on product page

**Solutions**:
1. Verify widget is added in Theme Editor (Online Store → Themes → Customize)
2. Check that theme supports app blocks (Online Store 2.0 required)
3. Verify product ID is in the configured products list
4. Check that metafield has data (use GraphiQL query above)
5. Try different product to confirm it's not a specific product issue

### Product Picker Not Opening

**Problem**: Clicking "Select Products" does nothing

**Solutions**:
1. Check browser console for errors
2. Verify `read_products` scope is granted (reinstall app if scope was just added)
3. Ensure you're using a compatible browser (Chrome, Firefox, Safari)
4. Try clearing browser cache and cookies

### Configuration Not Saving

**Problem**: Save button completes but config not stored

**Solutions**:
1. Check that `write_metafields` scope is granted
2. Look for GraphQL errors in network tab
3. Verify shop ID is correct (check loader data)
4. Ensure JSON serialization is working (valid product IDs)

### Database tables don't exist

If you get an error like:

```
The table `main.Session` does not exist in the current database.
```

Create the database for Prisma. Run the `setup` script in `package.json` using `npm`, `yarn` or `pnpm`.

### Navigating/redirecting breaks an embedded app

Embedded apps must maintain the user session, which can be tricky inside an iFrame. To avoid issues:

1. Use `Link` from `react-router` or `@shopify/polaris`. Do not use `<a>`.
2. Use `redirect` returned from `authenticate.admin`. Do not use `redirect` from `react-router`
3. Use `useSubmit` from `react-router`.

This only applies if your app is embedded, which it will be by default.

### Webhooks: shop-specific webhook subscriptions aren't updated

If you are registering webhooks in the `afterAuth` hook, using `shopify.registerWebhooks`, you may find that your subscriptions aren't being updated.

Instead of using the `afterAuth` hook declare app-specific webhooks in the `shopify.app.toml` file. This approach is easier since Shopify will automatically sync changes every time you run `deploy` (e.g: `npm run deploy`). Please read these guides to understand more:

1. [app-specific vs shop-specific webhooks](https://shopify.dev/docs/apps/build/webhooks/subscribe#app-specific-subscriptions)
2. [Create a subscription tutorial](https://shopify.dev/docs/apps/build/webhooks/subscribe/get-started?deliveryMethod=https)

If you do need shop-specific webhooks, keep in mind that the package calls `afterAuth` in 2 scenarios:

- After installing the app
- When an access token expires

During normal development, the app won't need to re-authenticate most of the time, so shop-specific subscriptions aren't updated. To force your app to update the subscriptions, uninstall and reinstall the app. Revisiting the app will call the `afterAuth` hook.

### Webhooks: Admin created webhook failing HMAC validation

Webhooks subscriptions created in the [Shopify admin](https://help.shopify.com/en/manual/orders/notifications/webhooks) will fail HMAC validation. This is because the webhook payload is not signed with your app's secret key.

The recommended solution is to use [app-specific webhooks](https://shopify.dev/docs/apps/build/webhooks/subscribe#app-specific-subscriptions) defined in your toml file instead. Test your webhooks by triggering events manually in the Shopify admin(e.g. Updating the product title to trigger a `PRODUCTS_UPDATE`).

### Webhooks: Admin object undefined on webhook events triggered by the CLI

When you trigger a webhook event using the Shopify CLI, the `admin` object will be `undefined`. This is because the CLI triggers an event with a valid, but non-existent, shop. The `admin` object is only available when the webhook is triggered by a shop that has installed the app. This is expected.

Webhooks triggered by the CLI are intended for initial experimentation testing of your webhook configuration. For more information on how to test your webhooks, see the [Shopify CLI documentation](https://shopify.dev/docs/apps/tools/cli/commands#webhook-trigger).

### Incorrect GraphQL Hints

By default the [graphql.vscode-graphql](https://marketplace.visualstudio.com/items?itemName=GraphQL.vscode-graphql) extension for will assume that GraphQL queries or mutations are for the [Shopify Admin API](https://shopify.dev/docs/api/admin). This is a sensible default, but it may not be true if:

1. You use another Shopify API such as the storefront API.
2. You use a third party GraphQL API.

If so, please update [.graphqlrc.ts](https://github.com/Shopify/shopify-app-template-react-router/blob/main/.graphqlrc.ts).

### Using Defer & await for streaming responses

By default the CLI uses a cloudflare tunnel. Unfortunately cloudflare tunnels wait for the Response stream to finish, then sends one chunk. This will not affect production.

To test [streaming using await](https://reactrouter.com/api/components/Await#await) during local development we recommend [localhost based development](https://shopify.dev/docs/apps/build/cli-for-apps/networking-options#localhost-based-development).

### "nbf" claim timestamp check failed

This is because a JWT token is expired. If you are consistently getting this error, it could be that the clock on your machine is not in sync with the server. To fix this ensure you have enabled "Set time and date automatically" in the "Date and Time" settings on your computer.

### Using MongoDB and Prisma

If you choose to use MongoDB with Prisma, there are some gotchas in Prisma's MongoDB support to be aware of. Please see the [Prisma SessionStorage README](https://www.npmjs.com/package/@shopify/shopify-app-session-storage-prisma#mongodb).

### Unable to require(`C:\...\query_engine-windows.dll.node`).

Unable to require(`C:\...\query_engine-windows.dll.node`).
The Prisma engines do not seem to be compatible with your system.

query_engine-windows.dll.node is not a valid Win32 application.

**Fix:** Set the environment variable:

```shell
PRISMA_CLIENT_ENGINE_TYPE=binary
```

This forces Prisma to use the binary engine mode, which runs the query engine as a separate process and can work via emulation on Windows ARM64.

## Demo & Screen Recording Guide

For assignment submission, create a screen recording (≤5 minutes) covering:

### What to Show
1. **App Setup**: Brief tour of the codebase structure
2. **Architecture Decisions**:
   - Why metafields instead of external database
   - Discount Function target choice (`purchase.discount-run`)
   - Theme extension approach (Liquid vs App Proxy)
3. **Admin Configuration**:
   - Open app in Shopify Admin
   - Select products using picker
   - Set discount percentage
   - Click Save and show success message
4. **PDP Widget**:
   - Navigate to configured product page
   - Show banner displaying "Buy 2, get X% off"
   - Show non-configured product (no banner)
5. **Cart Discount Application**:
   - Add 1 unit → No discount
   - Change to 2 units → Discount appears
   - Change to 3 units → Discount still applied
   - Show discount in cart total

### Recording Tips
- Use clear audio (explain what you're doing and why)
- Show your face (camera on) if possible - builds trust
- Keep it concise - practice beforehand
- Show the metafield data in GraphiQL to prove it's working
- Demonstrate edge cases (1 unit, 2 units, mixed cart)

### Key Points to Mention
- **No external database needed**: All config in Shopify metafields
- **Automatic discounts**: No discount codes required
- **Theme Editor flexibility**: Merchant can position widget anywhere
- **Scalable approach**: Metafields are fast, cached by Shopify CDN
- **Future enhancements**: Per-product percentages, tiered discounts, date ranges

## Key Architecture Decisions

### 1. Metafields Over External Database
**Decision**: Store configuration in Shopify metafields instead of MongoDB or external DB

**Rationale**:
- Native to Shopify ecosystem (no additional infrastructure)
- Accessible in Functions and Liquid without API calls
- Backed up with Shopify's data
- Fast (cached by Shopify's CDN)
- Simple config (single JSON object)

**Trade-offs**:
- Limited to 64KB per metafield (sufficient for this use case)
- No complex querying capabilities (not needed here)

### 2. Discount Function Target
**Target**: `purchase.discount-run` (unified Discount Function API)

**Rationale**:
- Recommended by Shopify (replaces deprecated product/order discount targets)
- Automatic application (no discount codes)
- Full cart context available
- Runs on every cart update (real-time)

### 3. Theme App Extension (Liquid)
**Approach**: Liquid-based widgets instead of App Proxy + React

**Rationale**:
- Direct access to shop metafields in Liquid
- No additional HTTP requests (faster page load)
- Works with Online Store 2.0 themes
- Merchant control via Theme Editor (no code changes)
- Better SEO (server-side rendered)

**Trade-offs**:
- Requires Online Store 2.0 theme
- Limited interactivity compared to React components
- Must be manually added by merchant in Theme Editor

### 4. Single Discount Rule
**Design**: All configured products share same percentage

**Rationale**:
- Simpler function logic (faster execution)
- Easier merchant experience
- Meets assignment requirements
- Can be extended later for per-product rules

## Resources

React Router:

- [React Router docs](https://reactrouter.com/home)

Shopify:

- [Intro to Shopify apps](https://shopify.dev/docs/apps/getting-started)
- [Shopify App React Router docs](https://shopify.dev/docs/api/shopify-app-react-router)
- [Shopify CLI](https://shopify.dev/docs/apps/tools/cli)
- [Shopify App Bridge](https://shopify.dev/docs/api/app-bridge-library).
- [Polaris Web Components](https://shopify.dev/docs/api/app-home/polaris-web-components).
- [App extensions](https://shopify.dev/docs/apps/app-extensions/list)
- [Shopify Functions](https://shopify.dev/docs/api/functions)

Internationalization:

- [Internationalizing your app](https://shopify.dev/docs/apps/best-practices/internationalization/getting-started)
