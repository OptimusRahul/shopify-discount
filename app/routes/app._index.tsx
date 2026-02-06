import { useEffect, useState, useCallback } from "react";
import type {
  ActionFunctionArgs,
  HeadersFunction,
  LoaderFunctionArgs,
} from "react-router";
import { useFetcher, useLoaderData } from "react-router";
import { useAppBridge } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";
import { boundary } from "@shopify/shopify-app-react-router/server";

interface Product {
  id: string;
  title: string;
  handle: string;
}

interface ConfigData {
  products: string[];
  minQty: number;
  percentOff: number;
}

interface LoaderData {
  shopId: string;
  config: ConfigData | null;
  hasDiscount: boolean;
  discountId?: string;
  discountTitle?: string;
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { admin } = await authenticate.admin(request);

  console.log("🔄 [LOADER] Loading configuration...");

  // Load existing configuration and check for automatic discount
  const response = await admin.graphql(
    `#graphql
      query LoadConfig {
        shop {
          id
          metafield(namespace: "volume_discount", key: "rules") {
            value
          }
        }
        discountNodes(first: 50, query: "status:active OR status:expired") {
          nodes {
            id
            discount {
              __typename
              ... on DiscountAutomaticApp {
                title
                discountId
                status
              }
            }
          }
        }
      }
    `
  );

  const responseJson = await response.json();
  
  console.log("🔍 [LOADER] Full GraphQL response:", JSON.stringify(responseJson, null, 2));
  
  const shop = responseJson.data?.shop;
  const configValue = shop?.metafield?.value;

  console.log("📦 [LOADER] Config from metafield:", configValue);

  let config: ConfigData | null = null;
  if (configValue) {
    try {
      config = JSON.parse(configValue);
      console.log("✅ [LOADER] Parsed config:", config);
    } catch (error) {
      console.error("❌ [LOADER] Failed to parse config:", error);
    }
  }

  // Check if automatic discount exists (find any app discount)
  const discountNodes = responseJson.data?.discountNodes?.nodes || [];
  
  console.log("🔍 [LOADER] All discount nodes:", JSON.stringify(discountNodes, null, 2));
  
  // Filter for DiscountAutomaticApp type
  const appDiscounts = discountNodes.filter((node: any) => 
    node.discount?.__typename === "DiscountAutomaticApp"
  );
  
  console.log("🎯 [LOADER] App discounts found:", appDiscounts.length);
  
  // Use the first app discount found
  const volumeDiscount = appDiscounts[0];
  
  if (volumeDiscount) {
    console.log("✅ [LOADER] Discount detected:", volumeDiscount.discount?.title);
  } else {
    console.log("⚠️ [LOADER] No discount found");
  }

  return {
    shopId: shop?.id || "",
    config,
    hasDiscount: !!volumeDiscount,
    discountId: volumeDiscount?.id,
    discountTitle: volumeDiscount?.discount?.title,
  };
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { admin } = await authenticate.admin(request);
  const formData = await request.formData();

  const actionType = formData.get("actionType") as string;

  /**
   * =========================================================
   * 1️⃣ CREATE AUTOMATIC DISCOUNT (FIXED VERSION)
   * =========================================================
   */
  if (actionType === "createDiscount") {
    const discountTitle = formData.get("discountTitle") as string;
    
    if (!discountTitle || !discountTitle.trim()) {
      return Response.json(
        { success: false, error: "Discount title is required" },
        { status: 400 }
      );
    }

    console.log("🎯 [ACTION] Creating automatic discount:", discountTitle);
    try {
      // First, check if discount already exists
      const checkResponse = await admin.graphql(`
        #graphql
        query {
          discountNodes(first: 50, query: "status:active OR status:expired") {
            nodes {
              id
              discount {
                ... on DiscountAutomaticApp {
                  title
                }
              }
            }
          }
        }
      `);
      
      const checkJson = await checkResponse.json();
      const existingAppDiscounts = checkJson.data?.discountNodes?.nodes?.filter(
        (node: any) => node.discount?.__typename === "DiscountAutomaticApp"
      );
      
      if (existingAppDiscounts && existingAppDiscounts.length > 0) {
        console.log("⚠️ [ACTION] Discount already exists:", existingAppDiscounts[0].discount.title);
        return Response.json(
          {
            success: false,
            error: "A discount already exists. Please delete it first.",
          },
          { status: 400 }
        );
      }

      // 🔥 Fetch deployed Shopify Function ID dynamically
      const functionResponse = await admin.graphql(`
        #graphql
        query {
          shopifyFunctions(first: 25) {
            nodes {
              id
              title
              apiType
            }
          }
        }
      `);

      const functionJson = await functionResponse.json();

      console.log("📋 [ACTION] Available functions:", functionJson.data?.shopifyFunctions?.nodes);

      const functionNode =
        functionJson.data.shopifyFunctions.nodes.find(
          (f: any) =>
            f.title === "Volume Discount Function" || 
            f.title === "discount-function" ||
            f.apiType === "discount"
        );

      if (!functionNode?.id) {
        console.error("❌ [ACTION] Function not found! Available functions:", functionJson.data?.shopifyFunctions?.nodes);
        return Response.json(
          {
            success: false,
            error: "Function not found. Deploy extension first.",
          },
          { status: 400 }
        );
      }

      console.log("✅ [ACTION] Found function:", functionNode.title, functionNode.id);

      const response = await admin.graphql(
        `#graphql
          mutation CreateAutomaticDiscount($discount: DiscountAutomaticAppInput!) {
            discountAutomaticAppCreate(automaticAppDiscount: $discount) {
              automaticAppDiscount {
                discountId
                title
              }
              userErrors {
                field
                message
              }
            }
          }
        `,
        {
          variables: {
            discount: {
              title: discountTitle.trim(),
              functionId: functionNode.id,
              startsAt: new Date().toISOString(),
              discountClasses: ["PRODUCT"],
              combinesWith: {
                orderDiscounts: false,
                productDiscounts: false,
                shippingDiscounts: false,
              },
            },
          },
        }
      );

      const responseJson = await response.json();

      const userErrors =
        responseJson.data?.discountAutomaticAppCreate?.userErrors;

      if (userErrors && userErrors.length > 0) {
        console.error("❌ [ACTION] Discount creation failed:", userErrors);
        return Response.json(
          {
            success: false,
            error: userErrors[0].message,
          },
          { status: 400 }
        );
      }

      const discount = responseJson.data?.discountAutomaticAppCreate?.automaticAppDiscount;
      console.log("✅ [ACTION] Discount created successfully:", discount?.title, discount?.discountId);

      return { success: true, discountCreated: true };
    } catch (err) {
      console.error(err);
      return Response.json(
        { success: false, error: "Failed to create discount" },
        { status: 500 }
      );
    }
  }

  /**
   * =========================================================
   * 1.5️⃣ DELETE AUTOMATIC DISCOUNT
   * =========================================================
   */
  if (actionType === "deleteDiscount") {
    console.log("🗑️ [ACTION] Deleting automatic discount...");
    const discountId = formData.get("discountId") as string;

    if (!discountId) {
      return Response.json(
        { success: false, error: "Discount ID not found" },
        { status: 400 }
      );
    }

    try {
      const response = await admin.graphql(
        `#graphql
          mutation DeleteAutomaticDiscount($id: ID!) {
            discountAutomaticDelete(id: $id) {
              deletedAutomaticDiscountId
              userErrors {
                field
                message
              }
            }
          }
        `,
        {
          variables: {
            id: discountId,
          },
        }
      );

      const responseJson = await response.json();
      const userErrors = responseJson.data?.discountAutomaticDelete?.userErrors;

      if (userErrors && userErrors.length > 0) {
        console.error("❌ [ACTION] Delete failed:", userErrors);
        return Response.json(
          { success: false, error: userErrors[0].message },
          { status: 400 }
        );
      }

      console.log("✅ [ACTION] Discount deleted successfully");
      return { success: true, discountDeleted: true };
    } catch (err) {
      console.error(err);
      return Response.json(
        { success: false, error: "Failed to delete discount" },
        { status: 500 }
      );
    }
  }

  /**
   * =========================================================
   * 2️⃣ SAVE CONFIG TO METAFIELD
   * =========================================================
   */

  console.log("💾 [ACTION] Saving configuration to metafield...");

  const shopId = formData.get("shopId") as string;
  const productIds = formData.get("productIds") as string;
  const percentOff = formData.get("percentOff") as string;

  console.log("📝 [ACTION] Received data:", { shopId, productIds, percentOff });

  if (!shopId || !productIds || !percentOff) {
    console.error("❌ [ACTION] Missing required fields");
    return Response.json(
      { success: false, error: "Missing required fields" },
      { status: 400 }
    );
  }

  const productIdsArray = JSON.parse(productIds);
  const percentOffNumber = parseInt(percentOff, 10);

  if (percentOffNumber < 1 || percentOffNumber > 80) {
    return Response.json(
      {
        success: false,
        error: "Discount percentage must be between 1 and 80",
      },
      { status: 400 }
    );
  }

  const config: ConfigData = {
    products: productIdsArray,
    minQty: 2,
    percentOff: percentOffNumber,
  };

  const configValue = JSON.stringify(config);
  
  console.log("📤 [ACTION] Saving to metafield:", configValue);

  const response = await admin.graphql(
    `#graphql
      mutation SaveDiscountConfig($metafields: [MetafieldsSetInput!]!) {
        metafieldsSet(metafields: $metafields) {
          metafields {
            id
          }
          userErrors {
            field
            message
          }
        }
      }
    `,
    {
      variables: {
        metafields: [
          {
            ownerId: shopId,
            namespace: "volume_discount",
            key: "rules",
            type: "json",
            value: configValue,
          },
        ],
      },
    }
  );

  const responseJson = await response.json();
  const userErrors = responseJson.data?.metafieldsSet?.userErrors;

  if (userErrors && userErrors.length > 0) {
    console.error("❌ [ACTION] Metafield save failed:", userErrors);
    return Response.json(
      { success: false, error: userErrors[0].message },
      { status: 400 }
    );
  }

  console.log("✅ [ACTION] Config saved successfully:", config);

  return { success: true, config };
};


export default function Index() {
  const loaderData = useLoaderData<LoaderData>();
  const fetcher = useFetcher<typeof action>();
  const shopify = useAppBridge();

  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  const [percentOff, setPercentOff] = useState<string>("10");
  const [discountTitle, setDiscountTitle] = useState<string>("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);

  const isLoading = fetcher.state === "submitting";
  const isSaved = fetcher.data?.success === true;

  // Show feedback for discount creation/deletion
  useEffect(() => {
    if (fetcher.data) {
      if (fetcher.data.discountCreated) {
        shopify.toast.show("✅ Automatic discount created successfully!");
        setTimeout(() => window.location.reload(), 1000);
      } else if (fetcher.data.discountDeleted) {
        shopify.toast.show("✅ Discount deleted successfully!");
        setTimeout(() => window.location.reload(), 1000);
      } else if (fetcher.data.error) {
        shopify.toast.show(`❌ ${fetcher.data.error}`, { isError: true });
        if (fetcher.data.error.includes("already exists")) {
          setTimeout(() => window.location.reload(), 2000);
        }
      } else if (fetcher.data.success && !fetcher.data.discountCreated && !fetcher.data.discountDeleted) {
        shopify.toast.show("Configuration saved successfully");
      }
    }
  }, [fetcher.data, shopify]);

  // Load existing configuration
  useEffect(() => {
    if (loaderData.config && loaderData.config.products.length > 0) {
      setPercentOff(loaderData.config.percentOff.toString());
      // Note: We can't restore product details (title, handle) from GIDs alone
      // In production, you'd query products by ID to get full details
    }
  }, [loaderData.config]);

  // Show success toast
  useEffect(() => {
    if (isSaved) {
      shopify.toast.show("Configuration saved successfully!");
    }
  }, [isSaved, shopify]);

  // Show error toast
  useEffect(() => {
    if (fetcher.data?.success === false && fetcher.data.error) {
      shopify.toast.show(fetcher.data.error, { isError: true });
    }
  }, [fetcher.data, shopify]);

  const openProductPicker = useCallback(async () => {
    const selected = await shopify.resourcePicker({
      type: "product",
      multiple: true,
      action: "select",
    });

    if (selected && selected.length > 0) {
      const products: Product[] = selected.map((item: any) => ({
        id: item.id,
        title: item.title,
        handle: item.handle,
      }));
      setSelectedProducts(products);
    }
  }, [shopify]);

  const handleSubmit = () => {
    if (selectedProducts.length === 0) {
      shopify.toast.show("Please select at least one product", { isError: true });
      return;
    }

    const productIds = selectedProducts.map((p) => p.id);

    const formData = new FormData();
    formData.append("shopId", loaderData.shopId);
    formData.append("productIds", JSON.stringify(productIds));
    formData.append("percentOff", percentOff);
    // actionType not set = save config (default action) 

    fetcher.submit(formData, { method: "POST", action: ".?index", });
  };

  const removeProduct = (productId: string) => {
    setSelectedProducts((prev) => prev.filter((p) => p.id !== productId));
  };

  return (
    <s-page heading="Volume Discount Configuration">
      <s-section heading="Configure Discount Rules">
        <s-paragraph>
          Set up automatic "Buy 2, get X% off" discounts for selected products. 
          When customers add 2 or more units of a configured product to their cart, 
          the discount will be automatically applied.
        </s-paragraph>

        <s-stack direction="block" gap="large">
          {/* Product Selection */}
          <s-stack direction="block" gap="base">
            <s-heading>Select Products</s-heading>
            <s-paragraph>
              Choose which products should have the volume discount applied.
            </s-paragraph>
            
            <s-button onClick={openProductPicker}>
              {selectedProducts.length > 0 ? "Change Products" : "Select Products"}
            </s-button>

            {selectedProducts.length > 0 && (
              <s-stack direction="block" gap="base">
                <s-text variant="strong">
                  Selected products ({selectedProducts.length}):
                </s-text>
                {selectedProducts.map((product) => (
                  <s-box
                    key={product.id}
                    padding="base"
                    borderWidth="base"
                    borderRadius="base"
                  >
                    <s-stack direction="inline" gap="base" alignment="space-between">
                      <s-text>{product.title}</s-text>
                      <s-button
                        variant="tertiary"
                        onClick={() => removeProduct(product.id)}
                      >
                        Remove
                      </s-button>
                    </s-stack>
                  </s-box>
                ))}
              </s-stack>
            )}
          </s-stack>

          {/* Discount Percentage */}
          <s-stack direction="block" gap="base">
            <s-heading>Discount Percentage</s-heading>
            <s-paragraph>
              Enter the discount percentage (1-80%) to apply when customers buy 2 or more units.
            </s-paragraph>
            
            <s-text-field
              label="Discount %"
              type="number"
              value={percentOff}
              onChange={(e: any) => setPercentOff(e.target.value)}
              min="1"
              max="80"
              helpText="Minimum quantity is fixed at 2 units"
            />
          </s-stack>

          {/* Save Button */}
          <s-button
            variant="primary"
            onClick={handleSubmit}
            {...(isLoading ? { loading: true } : {})}
          >
            Save Configuration
          </s-button>
        </s-stack>
      </s-section>

      {/* Current Configuration Display */}
      {loaderData.config && (
        <s-section heading="Current Configuration">
          <s-box
            padding="base"
            borderWidth="base"
            borderRadius="base"
            background="subdued"
          >
            <s-stack direction="block" gap="base">
              <s-text>
                <s-text variant="strong">Minimum Quantity:</s-text> {loaderData.config.minQty}
              </s-text>
              <s-text>
                <s-text variant="strong">Discount:</s-text> {loaderData.config.percentOff}%
              </s-text>
              <s-text>
                <s-text variant="strong">Configured Products:</s-text> {loaderData.config.products.length}
              </s-text>
            </s-stack>
          </s-box>
        </s-section>
      )}

      {/* Instructions */}
      <s-section slot="aside" heading="Deployment Steps">
        <s-stack direction="block" gap="base">
          <s-box
            padding="small"
            borderRadius="base"
            background={loaderData.hasDiscount ? "success-subdued" : "subdued"}
          >
            {loaderData.hasDiscount ? (
              <s-stack direction="block" gap="small">
                <s-stack direction="block" gap="xsmall">
                  <s-text variant="strong">✅ Discount Active</s-text>
                  {loaderData.discountTitle && (
                    <s-text variant="subdued">"{loaderData.discountTitle}"</s-text>
                  )}
                </s-stack>
                <s-button
                  onClick={() => {
                    if (confirm("Are you sure you want to delete this discount?")) {
                      const formData = new FormData();
                      formData.append("actionType", "deleteDiscount");
                      formData.append("discountId", loaderData.discountId || "");
                      fetcher.submit(formData, { method: "POST" });
                    }
                  }}
                  variant="critical"
                  size="small"
                  disabled={isLoading}
                >
                  {isLoading ? "Deleting..." : "Delete Discount"}
                </s-button>
              </s-stack>
            ) : (
              <s-stack direction="block" gap="small">
                <s-text variant="strong">⚠️ Discount Not Active</s-text>
                <s-text-field
                  label="Discount Title"
                  value={discountTitle}
                  onChange={(e) => setDiscountTitle(e.target.value)}
                  placeholder="e.g., Volume Discount 15% Off"
                />
                <s-button
                  onClick={() => {
                    if (!discountTitle.trim()) {
                      shopify.toast.show("Please enter a discount title", { isError: true });
                      return;
                    }
                    const formData = new FormData();
                    formData.append("actionType", "createDiscount");
                    formData.append("discountTitle", discountTitle);
                    fetcher.submit(formData, { method: "POST" });
                  }}
                  variant="primary"
                  size="small"
                  disabled={isLoading || !discountTitle.trim()}
                >
                  {isLoading ? "Creating..." : "Create Automatic Discount"}
                </s-button>
              </s-stack>
            )}
          </s-box>
          
          <s-unordered-list>
            <s-list-item>
              <s-text variant="strong">1. Deploy extensions:</s-text><br />
              <code>npm run deploy</code>
            </s-list-item>
            <s-list-item>
              <s-text variant="strong">2. Create automatic discount:</s-text><br />
              Click "Create Automatic Discount" button above
            </s-list-item>
            <s-list-item>
              <s-text variant="strong">3. Add theme widgets:</s-text><br />
              Online Store → Themes → Customize<br />
              <s-text variant="subdued">Add blocks: "Volume Discount Badge" (product page) and "Cart Discount Message" (cart page)</s-text>
            </s-list-item>
            <s-list-item>
              <s-text variant="strong">4. Test:</s-text><br />
              Visit product page → See badge → Add {loaderData.config?.minQty || 2}+ to cart → See discount!
            </s-list-item>
          </s-unordered-list>
          
          <s-box padding="small" background="info-subdued" borderRadius="base">
            <s-stack direction="block" gap="xsmall">
              <s-text variant="strong">📘 Widget Setup Guide</s-text>
              <s-text variant="subdued">See THEME_WIDGET_SETUP.md for detailed instructions</s-text>
            </s-stack>
          </s-box>
        </s-stack>
      </s-section>

      <s-section slot="aside" heading="How to Test Discount">
        <s-stack direction="block" gap="base">
          <s-box padding="small" background="info-subdued" borderRadius="base">
            <s-stack direction="block" gap="xsmall">
              <s-text variant="strong">Testing Steps:</s-text>
              <s-text>1. Make sure you've saved your configuration</s-text>
              <s-text>2. Create an automatic discount (above)</s-text>
              <s-text>3. Visit your storefront</s-text>
              <s-text>4. Add a <s-text variant="strong">configured product</s-text> to cart</s-text>
              <s-text>5. Set quantity to <s-text variant="strong">{loaderData.config?.minQty || 2}+</s-text></s-text>
              <s-text>6. View cart - discount should appear!</s-text>
            </s-stack>
          </s-box>
          
          {loaderData.hasDiscount && (
            <s-box padding="small" background="warning-subdued" borderRadius="base">
              <s-stack direction="block" gap="xsmall">
                <s-text variant="strong">⚠️ Not working?</s-text>
                <s-text>• Verify you're using a configured product</s-text>
                <s-text>• Check quantity meets minimum: {loaderData.config?.minQty || 2}+</s-text>
                <s-text>• Try deleting & recreating the discount</s-text>
                <s-text>• Check Shopify Admin → Discounts (status: Active)</s-text>
              </s-stack>
            </s-box>
          )}
        </s-stack>
      </s-section>

      <s-section slot="aside" heading="Documentation">
        <s-paragraph>
          <s-link
            href="https://shopify.dev/docs/api/functions/latest/discount"
            target="_blank"
          >
            Discount Function API
          </s-link>
        </s-paragraph>
        <s-paragraph>
          <s-link
            href="https://shopify.dev/docs/apps/build/custom-data"
            target="_blank"
          >
            Metafields Documentation
          </s-link>
        </s-paragraph>
      </s-section>
    </s-page>
  );
}

export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs);
};
