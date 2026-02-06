# Quick Start Guide - Volume Discount App

## 🚀 You're Almost Ready!

All the code has been implemented. Follow these steps to deploy and test:

## Step 1: Start Development Server

```bash
npm run dev
```

This will:
- Start the local dev server
- Create a tunnel
- Prompt you to select your app
- Open installation URL

**Important**: The app has updated scopes. You may need to **reinstall** the app on your dev store to grant new permissions.

## Step 2: Install/Reinstall App

1. Press `P` in terminal to open installation URL
2. Click **Install** (or **Update** if already installed)
3. Authorize the new permissions:
   - ✅ write_discounts
   - ✅ read_products
   - ✅ write_metafields
   - ✅ read_metafields

## Step 3: Deploy Extensions

```bash
npm run deploy
```

This deploys:
- ✅ volume-discount-function (discount logic)
- ✅ volume-discount-widget (PDP & cart widgets)

Wait for deployment to complete (~1-2 minutes).

## Step 4: Create Automatic Discount (CRITICAL!)

⚠️ **The discount won't work without this step!**

1. Go to dev store Admin
2. Navigate to **Discounts**
3. Click **Create discount**
4. Select **Automatic discount**
5. Choose function: **volume-discount-function**
6. Set title: "Buy 2 Get X% Off"
7. Click **Save**

## Step 5: Configure Products

1. In Shopify Admin, open **Apps** → **discount**
2. Click **Select Products**
3. Choose 1+ products for volume discount
4. Set **Discount %** (try 10%)
5. Click **Save Configuration**
6. Verify green success toast appears

## Step 6: Add Widget to Theme

1. Go to **Online Store** → **Themes** → **Customize**
2. Navigate to a **Product page**
3. Click **Add block** (in Product Information section)
4. Find **Apps** → **Volume Discount Banner**
5. Position it where you want
6. Click **Save**

## Step 7: Test It!

### Test PDP Widget:
1. Open storefront (click 👁️ icon in theme customizer)
2. Go to configured product page
3. ✅ Should see: "🎉 Buy 2, get 10% off!"

### Test Cart Discount:
1. Add 1 unit → ❌ No discount
2. Change to 2 units → ✅ 10% discount applied!
3. Change to 3 units → ✅ Discount still there
4. Change to 1 unit → ❌ Discount removed

### Verify in Checkout:
1. Keep 2+ units in cart
2. Click **Checkout**
3. ✅ Discount shows in order summary

## 🎥 Create Screen Recording

Record a 5-minute demo showing:

1. **Code walkthrough** (~1 min)
   - Show project structure
   - Explain architecture decisions

2. **Admin configuration** (~1 min)
   - Open app
   - Select product
   - Set percentage
   - Save config

3. **PDP widget** (~30 sec)
   - Show configured product page
   - Point out banner
   - Show non-configured product (no banner)

4. **Cart discount** (~1.5 min)
   - Add 1 unit (no discount)
   - Change to 2 (discount appears)
   - Change to 3 (discount persists)
   - Show cart total with discount

5. **Technical explanation** (~1 min)
   - Why metafields vs database?
   - Why this function target?
   - Why Liquid widgets?

**Tips**:
- ✅ Use clear audio and explain as you go
- ✅ Show your face (camera on) if possible
- ✅ Keep it under 5 minutes
- ✅ Practice once before recording

## 🐛 Troubleshooting

### Discount not applying?
1. Did you create the automatic discount in Admin?
2. Is the function deployed? (`npm run deploy`)
3. Is configuration saved? (Check GraphiQL)

### Widget not showing?
1. Did you add the block in Theme Editor?
2. Is the product in your configured list?
3. Does your theme support app blocks? (Online Store 2.0 required)

### Can't save config?
1. Did you reinstall the app after updating scopes?
2. Check browser console for errors
3. Try selecting just one product first

## 📚 More Info

- Full documentation: `README.md`
- Implementation details: `IMPLEMENTATION_NOTES.md`
- Assignment requirements: `Shopify Discount Assignment.md`

## ✅ Completion Checklist

Before submitting:
- [ ] App deployed and running
- [ ] Extensions deployed (`npm run deploy`)
- [ ] Automatic discount created in Admin
- [ ] Theme widget added and visible
- [ ] Tested all scenarios (1 unit, 2 units, 3 units)
- [ ] Screen recording completed (≤5 min, with voice)
- [ ] README is up to date

## 🎯 Assignment Milestones

| Milestone | Status | Evidence |
|-----------|--------|----------|
| A: Dev env ready | ✅ | Screenshots of Partner Dashboard + dev store |
| B: Discount works | ✅ | Screen recording showing cart discount |
| C: UI + widget | ✅ | Screen recording showing admin UI + PDP widget |

## 🚢 You're Ready to Ship!

Everything is implemented and documented. Just follow the steps above, create your recording, and submit!

Good luck! 🎉
