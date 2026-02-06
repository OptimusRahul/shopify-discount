# Theme Widget Setup Guide

## Overview
I've created two theme app blocks for you:
1. **Product Discount Badge** - Shows on product pages
2. **Cart Discount Message** - Shows in cart when eligible

## Files Created
```
extensions/volume-discount-widget/
├── shopify.extension.toml
├── blocks/
│   ├── product-discount-badge.liquid
│   └── cart-discount-message.liquid
└── locales/
    └── en.default.json
```

## How to Add Widgets to Your Theme

### Step 1: Deploy Extensions
```bash
npm run deploy
```
Or with dev mode:
```bash
npm run dev
```

### Step 2: Go to Theme Editor
1. In Shopify Admin, go to: **Online Store → Themes**
2. Click **Customize** on your active theme
3. The app blocks will now be available!

### Step 3: Add Product Page Widget

1. In the theme editor, navigate to a **Product page**
2. In the left sidebar, find the **Product Information** section
3. Click **"Add block"**
4. Look for **"Apps"** section at the bottom
5. Find and select **"Volume Discount Badge"**
6. Position it where you want (e.g., below product title or price)
7. **Customize settings:**
   - Message template: `Buy {minQty}+, get {percentOff}% off!`
   - Icon: 🎉 (or any emoji)
   - Background color: Light green (`#E8F5E9`)
   - Text color: Dark green (`#1B5E20`)
   - Border color: Green (`#4CAF50`)
   - Font size, alignment, etc.

### Step 4: Add Cart Page Widget (Optional)

1. In the theme editor, navigate to the **Cart** page
2. Find the cart section (usually "Cart items" or similar)
3. Click **"Add block"** or **"Add section"**
4. Look for **"Apps"** section
5. Find and select **"Cart Discount Message"**
6. **Customize settings:**
   - Heading: `Volume Discount Applied! 🎉`
   - Message template: `You're getting {percentOff}% off on items with {minQty}+ quantity`
   - Colors and styling as desired

### Step 5: Save and Test

1. Click **"Save"** in the theme editor
2. Visit your storefront
3. Go to a product page for a **configured product**
4. You should see the discount badge!
5. Add items to cart and check if the cart message appears

## How the Widgets Work

### Product Badge Logic:
- Reads configuration from `shop.metafields.volume_discount.rules`
- Checks if current product ID is in the configured products list
- Only displays if product is eligible
- Shows dynamic message with your configured min quantity and discount percentage

### Cart Message Logic:
- Reads configuration from metafield
- Checks all cart items
- Only displays if at least one item:
  - Is in the configured products list
  - Has quantity ≥ minimum quantity
- Shows confirmation that discount is applied

## Customization Options

Both widgets support extensive customization:
- **Colors**: Background, text, border, accent
- **Typography**: Font size, font weight
- **Spacing**: Border radius, padding (via inline styles)
- **Content**: Message templates, icons, headings
- **Layout**: Text alignment

## Troubleshooting

### Widget not appearing in theme editor?
- Make sure you ran `npm run dev` or `npm run deploy`
- Check that your dev store has the app installed
- Try refreshing the theme editor

### Widget shows but no message appears?
- Verify you've saved configuration in the app admin (`/app`)
- Make sure you're viewing a product that's in your configured products list
- Check browser console for any JavaScript errors

### Widget styling looks off?
- Customize the settings in the theme editor
- You can also add custom CSS in your theme's `theme.liquid` file:
  ```css
  .volume-discount-badge {
    /* Custom styles */
  }
  ```

## Testing Checklist

- [ ] Deploy extensions with `npm run deploy`
- [ ] Add Product Discount Badge to product page
- [ ] Add Cart Discount Message to cart page
- [ ] Save theme changes
- [ ] Configure products in app admin (`/app`)
- [ ] Visit a configured product page → See badge
- [ ] Add 2+ items to cart → See discount applied
- [ ] View cart → See confirmation message

## Next Steps

Once widgets are working:
1. Test with different products
2. Adjust styling to match your brand
3. Test the full purchase flow
4. Consider adding the badge to collection pages (optional)
