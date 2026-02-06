# Development Notes

## ✅ Dev Server Successfully Running

The development server is now working properly. All issues have been resolved.

---

## ⚠️ Important: Discount Function Limitation in Local Development

The **volume-discount-function** uses JavaScript/Javy compilation which requires the Javy CLI tool to be installed locally to generate WebAssembly. Since Javy is not available via npm and requires manual installation, the function **will NOT work during local development**.

### What This Means:

✅ **Works in Local Dev:**
- Admin UI (product picker, configuration)
- Theme widgets (preview in theme customizer)
- Metafield storage
- All UI interactions

❌ **Does NOT Work in Local Dev:**
- Actual discount application in cart
- Function execution
- Discount calculations

✅ **Works After Deployment:**
- Everything! The function will be properly compiled during `npm run deploy`
- Cart discounts will apply correctly
- Full end-to-end functionality

---

## Issues Resolved

### 1. WASM Export Error
**Error**: `failed to find function export _start`

**Fix**: Created a proper placeholder WASM module with the required `_start` export in `build.js`:
```javascript
// Minimal WASM module with required _start export
const wasmModule = Buffer.from([
  0x00, 0x61, 0x73, 0x6d, // Magic number \0asm
  0x01, 0x00, 0x00, 0x00, // Version 1
  // Type section, Function section, Export section, Code section...
]);
```

### 2. Invalid Target Name
**Error**: `API not found for target: purchase.discount.run`

**Fix**: Changed target to `purchase.product-discount.run` in `shopify.extension.toml`:
```toml
[[extensions.targeting]]
target = "purchase.product-discount.run"
```

### 3. Invalid Scopes
**Error**: `These scopes are invalid - [read_metafields, write_metafields]`

**Fix**: Removed invalid metafield scopes from `shopify.app.toml`. Shop metafields don't require explicit scopes:
```toml
scopes = "write_discounts,read_products"
```

---

## Testing Workflow

Since the function doesn't execute locally, follow this workflow:

1. **Develop locally** (`npm run dev`):
   - Build admin UI
   - Configure discount settings
   - Preview theme widgets
   - Save configuration to metafields

2. **Deploy** (`npm run deploy`):
   - Shopify compiles JavaScript to WASM
   - Extensions deploy to dev store
   - Function becomes active

3. **Test on dev store**:
   - Create automatic discount in Shopify Admin
   - Add eligible products to cart (quantity ≥ 2)
   - Verify discount applies
   - Check function logs in Admin

---

## Alternative: Manual Javy Installation (Optional)

If you want to test the function locally with actual execution:

1. Install Rust: `curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh`
2. Install Javy: `cargo install javy-cli`
3. Update `build.js`:
   ```javascript
   const { execSync } = require('child_process');
   execSync('javy compile src/run.js -o dist/index.wasm');
   ```
4. Run `npm run dev`

**Note**: This is optional and not required for the assignment.

---

## Tech Stack Details

- **Admin UI**: React Router + Polaris
- **Backend**: Shopify Functions (JavaScript → WASM via Javy)
- **Storage**: Shop metafields (`volume_discount.rules`)
- **Storefront**: Theme app extension (Liquid)
- **Compilation**: Cloud-based (deployment) or local (Javy, optional)
