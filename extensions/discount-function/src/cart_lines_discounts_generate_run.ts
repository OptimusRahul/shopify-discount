import {
  ProductDiscountSelectionStrategy,
  CartInput,
  CartLinesDiscountsGenerateRunResult,
} from '../generated/api';

interface VolumeDiscountConfig {
  products: string[];
  minQty: number;
  percentOff: number;
}

const NO_DISCOUNT: CartLinesDiscountsGenerateRunResult = {
  operations: [],
};

export function cartLinesDiscountsGenerateRun(
  input: CartInput,
): CartLinesDiscountsGenerateRunResult {
  // Get configuration from shop metafield
  const configValue = input.shop?.metafield?.value;
  
  if (!configValue) {
    console.error('No configuration found in metafield');
    return NO_DISCOUNT;
  }

  let config: VolumeDiscountConfig;
  try {
    config = JSON.parse(configValue);
  } catch (error) {
    console.error('Failed to parse configuration:', error);
    return NO_DISCOUNT;
  }

  // Validate configuration
  if (!config.products || !Array.isArray(config.products) || config.products.length === 0) {
    console.error('Invalid configuration: products array is missing or empty');
    return NO_DISCOUNT;
  }

  const minQty = config.minQty || 2;
  const percentOff = config.percentOff;

  if (!percentOff || percentOff < 1 || percentOff > 80) {
    console.error('Invalid percentOff value:', percentOff);
    return NO_DISCOUNT;
  }

  const targets = [];

  // Check each cart line and collect all eligible targets
  for (const line of input.cart.lines) {
    // Skip if not a ProductVariant
    if (line.merchandise.__typename !== 'ProductVariant') {
      continue;
    }

    const productId = line.merchandise.product?.id;
    
    if (!productId) {
      continue;
    }

    // Check if this product is in the configured list
    const isConfiguredProduct = config.products.includes(productId);
    
    // Check if quantity meets minimum requirement
    if (isConfiguredProduct && line.quantity >= minQty) {
      targets.push({
        cartLine: {
          id: line.id,
        },
      });
    }
  }

  if (targets.length === 0) {
    return NO_DISCOUNT;
  }

  // Return a single operation that applies to all eligible cart lines
  return {
    operations: [
      {
        productDiscountsAdd: {
          candidates: [
            {
              targets: targets,
              value: {
                percentage: {
                  value: percentOff,
                },
              },
              message: `Buy ${minQty}+, get ${percentOff}% off`,
            },
          ],
          selectionStrategy: ProductDiscountSelectionStrategy.First,
        },
      },
    ],
  };
}