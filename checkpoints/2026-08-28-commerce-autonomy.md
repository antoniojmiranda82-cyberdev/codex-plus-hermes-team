# Asset Dream Commerce Autonomy Checkpoint

## Scope completed

- Asset Ave Shopify connection verified read-only from ChatGPT connector.
- Dream Blvd WordPress/WooCommerce admin connection verified through the connected Hostinger site.
- Product autonomy policy added.
- Restricted product categories are blocked from autonomous intake.
- Product research, scoring, draft creation, and draft edits are allowed without owner approval.
- Publishing, live price changes, archiving, and deletion remain owner-approval gated.
- Platform-neutral commerce adapter contracts added.
- Commerce context enforces project namespace `asset-dream` and rejects unscoped agents.
- Commerce workflow task builder routes Asset Ave work to `asset-dream:asset-commerce` and Dream Blvd work to `asset-dream:dream-commerce`.
- Approval requirements are derived from the product policy rather than left to individual agent judgment.

## Source-of-truth rules

- Asset Ave: Shopify remains authoritative for product IDs, variants, prices, inventory, collections, checkout, orders, and fulfillment state.
- Dream Blvd: WordPress/WooCommerce remains authoritative for products, prices, stock, pages, orders, and publication state.
- The operator stores workflow/task state only. It must not become a second inventory or pricing database.

## Current external-write posture

- No live product publishing was performed during this slice.
- No live product price was changed.
- No products were deleted or archived.
- Draft-level autonomy is the default target.

## Next

1. Surface product autonomy mode in dashboard health/status.
2. Add Slack report routing for research/draft/approval summaries.
3. Add product scoring schema and duplicate/margin/shipping checks.
4. Add connector-backed adapters behind the platform-neutral contracts.
5. Add periodic product-intake workflow definitions after scoring rules are green.
