# Discount Debug Checklist

## Step 1: Verify Function Deployment
Check that your function is deployed:
```bash
npm run deploy
```

Look for: `✅ discount-function deployed successfully`

## Step 2: Verify Automatic Discount is Active
1. Go to Shopify Admin → Discounts
2. You should see your automatic discount listed
3. Status should be **Active** (not Scheduled or Expired)

## Step 3: Verify Configuration
In your app's admin page (`/app`):
- **Products**: Make sure you've selected at least one product
- **Minimum Quantity**: Note the value (default: 2)
- **Discount Percentage**: Note the value (e.g., 20%)
- Click "Save Configuration"

## Step 4: Test in Cart
1. Go to your storefront
2. Add **ONE of the configured products** to cart
3. Change quantity to meet or exceed the minimum (e.g., 2 or more)
4. Go to cart page
5. **Expected**: You should see the discount applied

## Common Issues & Fixes

### Issue 1: "Function not found" error
**Fix**: Run `npm run deploy` to deploy the extension

### Issue 2: Discount shows in admin but not applying
**Fix**: 
- Make sure the automatic discount status is "Active"
- Check that you're adding the EXACT products configured in the app
- Check that quantity meets minimum requirement

### Issue 3: Wrong products in configuration
**Symptoms**: You selected products but discount isn't applying
**Fix**: 
1. In the app admin, re-select your products
2. Click "Save Configuration"
3. Clear your cart and try again

### Issue 4: Function not linked to discount
**Fix**:
1. Delete the automatic discount (use the "Delete Discount" button in app)
2. Create a new one (use the "Create Automatic Discount" button)

## Debug Console Logs

The function logs are available in:
- Shopify Admin → Settings → Functions → Your function → Recent runs

Check the logs to see:
- What configuration was loaded
- Which products/quantities were in the cart
- Why the discount did or didn't apply
