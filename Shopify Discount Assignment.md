# **Deadline:** 

* # Max 2 days from getting this document (zero negotiation on deadline)

* Please do not attempt if the time is already passed.

**Tip:**

1. **Timeframe:** This task typically takes 3–6 hours if done properly. All required details are provided, and there are no restrictions on how you execute it. You may complete it in less time if you choose. Ensure you fully understand what you build, as you will be asked questions about it during the interview.

2. # **Shopify** provides pre-built, ready-to-use **app templates**, so you don’t need to make an app from scratch; find, set up and make the core things mentioned in the doc. This is more research and architecture-oriented rather than sole development.

# **Please only complete this if you match the following points:-**

1. You believe in shipping fast...  
2. You have shipped to production FAST in a previous/current organization.  
3. You work on small PR chunks.  
4. You are **well-versed in MongoDB, React, and Node.**  
5. Only allowed tech stack is MERN

# **Shopify Discount Function \+ Product Page(PDP) Cart Widget Objective (what you’ll ship)**

Build a tiny Shopify app (Shopify provides app templates dummy, you just need to make 1 page, check tip \#2) that:

1. Creates a **“Buy 2, get X% off”** discount using **Shopify Functions** (automatic discount).  
2. Let's an admin choose **which product(s)** and **what %** from the app’s UI.  
3. Stores admin choices in **metafields**.  
4. Shows a small **theme app extension widget** on the **Product page** (and optionally Cart) that says e.g. “Buy 2, get 10% off”.

---

## **Milestones** 

* **Milestone A (Dev env ready):** Partner account, dev store, app skeleton ( screenshots) (Shopify premade app template setup, you need to make 1 page)  
* **Milestone B (Discount works):** Function applies “Buy 2, get X% off” correctly (core discount logic you need to make, provide screen recording)  
* **Milestone C (UI \+ widget):** App UI saves config → metafields; widget displays correct message ( screen recording)

---

## **Prerequisites & Official Docs (read first)**

* Create a **Shopify Partner** account and **Dev Store**: overview & steps. [Shopify Help Center+3Shopify+3Shopify Help Center+3](https://www.shopify.com/partners?utm_source=chatgpt.com)  
* **Discount Function API** (unified product/order/shipping discounts): read this first so you pick the right Function target. [Shopify+1](https://shopify.dev/docs/api/functions/latest/discount?utm_source=chatgpt.com)  
* **Metafields (custom data)**: what they are and where to store them. [Shopify+1](https://shopify.dev/docs/apps/build/custom-data?utm_source=chatgpt.com)  
* **Theme App Extensions & App Blocks** (how to render the widget in themes). [Shopify+2Shopify+2](https://shopify.dev/docs/apps/build/online-store/theme-app-extensions?utm_source=chatgpt.com)

Notes for devs:

* Shopify merged product/order/shipping discount functions under the **Discount Function API**. You’ll implement the **cart.lines.discounts.generate.run** target and output discount **operations** when conditions match. [Shopify](https://shopify.dev/docs/api/functions/latest/discount?utm_source=chatgpt.com)

---

## **Scope of Work (detailed)**

### **1\) Set up environment (Milestone A)**

* **Partner account** → Create a **free Development Store**. Provide screenshots of the Partner Dashboard “Stores” page and the dev store Admin. [Shopify Help Center+1](https://help.shopify.com/en/partners/manage-clients-stores/development-stores/create-development-stores?utm_source=chatgpt.com)  
* Scaffold a new **public app** (Node/Remix or your choice, use router 7 template). Must include:

  * **Function extension** (Discount)  
  * **Theme app extension** (widget)  
  * **Admin UI** (simple page to configure product(s) \+ discount %)

* Only MERN Stack; prioritize the official app templates/CLI.

### **2\) Discount logic via Shopify Functions (Milestone B)**

* **Use case**: If a cart contains **≥ 2 units** of any **configured product**, apply **X%** off to those qualifying lines.  
* **Implementation**:

  * Discount Function runs on **`cart.lines.discounts.generate.run`**.  
  * Read the cart lines; match by **product IDs** configured by the merchant; check **quantity ≥ 2**; output discount **operations** with the configured **percentage**.  
  * Must be an **automatic discount** (no code entry).

* **Docs you’ll need**: Discount Function API (targets, input, outputs, operations). [Shopify](https://shopify.dev/docs/api/functions/latest/discount?utm_source=chatgpt.com)

### **3\) Config storage (Metafields) \+ Admin UI (Milestone C)**

* **Where to store config**:

  * Create **App-owned metafields** on the **shop** resource:  
    * `namespace: "volume_discount"`

`key: "rules"` → JSON string with shape:

 `{`  
  `"products": ["gid://shopify/Product/123", "gid://shopify/Product/456"],`  
  `"minQty": 2,`  
  `"percentOff": 10`  
`}`

* **Admin UI**:

  * Simple page: select products (picker), set **percentOff** (1–80), **minQty** fixed at 2 for this task.  
  * **Save** writes to the metafield. The Function reads this config at runtime.

* **Docs**: About metafields & custom data. [Shopify+1](https://shopify.dev/docs/apps/build/custom-data?utm_source=chatgpt.com)

### **4\) Theme App Extension widget (Milestone C)**

* Add a **theme app block** that a merchant can place on the **Product Information** section in Online Store 2.0 themes.  
* Widget text (dynamic): **“Buy 2, get {percentOff}% off”**. If the current product isn’t in the configured list, render nothing.  
* Optional: a minimal **Cart** widget with the same message.  
* **Docs**: Theme app extensions & app blocks configuration. [Shopify+1](https://shopify.dev/docs/apps/build/online-store/theme-app-extensions?utm_source=chatgpt.com)

---

## **Acceptance Criteria (must pass)**

### **Functional**

1. **App installs** on a dev store without errors.  
2. Admin can **select ≥1 product** and set **percentOff**; clicking **Save** persists to the **shop metafield**.  
3. On PDP of a configured product, the **widget shows**: “Buy 2, get X% off”.  
4. In cart/checkout, adding **2+ units** of a configured product **applies X% discount** to those lines via the Function (verify in order summary).  
5. Removing items or dropping below 2 units removes the discount.  
6. No discount when product is not in the configured list.

### **Quality & Code**

* Clear **README** with setup/run steps.  
* Function code is small, readable, and guarded for **empty config**.  
* No private API keys are hard-coded.  
* Uses **metafields** as specified; **no theme hard-coding**.  
* Theme block packaged as a **proper app block** (merchant must be able to add it from the Theme Editor). [Shopify](https://shopify.dev/docs/apps/build/online-store/theme-app-extensions/configuration?utm_source=chatgpt.com)

### **Deliverables**

* Short **screen recording with your voice, good if the camera is on, explaining below** (≤5 min):

  * App setup  
  * Architecture decision  
  * Admin config page → save  
  * PDP widget appearing  
  * Cart with 2 units → discount applied; with 1 unit → no discount

* One **test product** pre-configured for demo.  
* A **one-page README** covering:

  * Install & dev commands  
  * Where config is stored (metafield namespace/key)  
  * How to add the theme block in the Theme Editor  
  * Any limitations / next steps

---

## **Suggested Tech Notes (to make this smooth)**

* Discount Function: implement using the **unified Discount Function API** (avoid deprecated product/order function targets). Focus on **`operations`** output with a **percentage** adjustment when **minQty** met. [Shopify](https://shopify.dev/docs/api/functions/latest/discount?utm_source=chatgpt.com)  
* Theme App Extension: create an **app block** with a small Liquid/JS snippet that fetches your app’s config (via an app proxy or inject it as block settings if you pre-read metafields in your extension). Keep it minimal. [Shopify+1](https://shopify.dev/docs/apps/build/online-store/theme-app-extensions?utm_source=chatgpt.com)  
* Metafields: store JSON on the **shop**; your Function can read the config (via input query if modeled as a **discount node setting** or fetched server-side and embedded during function build/fetch). Use Shopify’s guidance on custom data. [Shopify](https://shopify.dev/docs/apps/build/custom-data?utm_source=chatgpt.com)

---

## **How to Get Started (links you can follow)**

* **Become a Shopify Partner / create account** (official): start here. [Shopify+1](https://www.shopify.com/partners?utm_source=chatgpt.com)  
* **Create a Development Store** (official steps). [Shopify Help Center+1](https://help.shopify.com/en/partners/manage-clients-stores/development-stores/create-development-stores?utm_source=chatgpt.com)  
* **Build a Discount Function** (official tutorial, updated for unified API). [Shopify](https://shopify.dev/docs/apps/build/discounts/build-discount-function?utm_source=chatgpt.com)  
* **Discount Function API (reference)** (targets, input, operations). [Shopify](https://shopify.dev/docs/api/functions/latest/discount?utm_source=chatgpt.com)  
* **Metafields** (manual & dev docs). [Shopify Help Center+1](https://help.shopify.com/en/manual/custom-data/metafields?utm_source=chatgpt.com)  
* **Theme App Extensions** (about & configuration). [Shopify+1](https://shopify.dev/docs/apps/build/online-store/theme-app-extensions?utm_source=chatgpt.com)

---

## **Review Checklist (we’ll use this to accept/reject)**

*  Partner \+ Dev store screenshots included  
*  App installs; no OAuth errors  
*  UI saves config to `shop` metafield (`volume_discount.rules`)  
*  PDP widget text matches config and hides on non-configured products  
*  Cart applies X% off when qty ≥ 2 (and removes when \< 2\)  
* Screen recording with your voice, good if the camera is on, explaining.  
*  Clean repo \+ README \+ screen recording

# **Submission**

[https://docs.google.com/forms/d/1Y44gdTQMDGVSdao2E07qCm3of5ixczVez2wVEgpN0-4/edit](https://docs.google.com/forms/d/1Y44gdTQMDGVSdao2E07qCm3of5ixczVez2wVEgpN0-4/edit)