import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { describe, it } from "node:test";

import {
  PRODUCT_DRAG_DISABLED_MESSAGE,
  getProductDragReorder,
  getAdjacentProductForMove,
  getOptimisticShopPositions,
  getProductMoveState,
  isProductReorderMode,
  isProductDragOrderingDisabled,
} from "../utils/admin.ts";
import { sortShopProducts } from "../utils/shopProducts.ts";

const storeSource = readFileSync("stores/products.ts", "utf8");
const productGridSource = readFileSync("components/shop/ProductGrid.vue", "utf8");
const adminProductsSource = readFileSync("pages/admin/products.vue", "utf8");
const featuredProductsSource = readFileSync("components/home/FeaturedProductsSection.vue", "utf8");
const migrationPath =
  "supabase/migrations/20260824120000_add_product_shop_ordering.sql";
const dragMigrationPath =
  "supabase/migrations/20260824130000_create_product_drag_reorder_rpc.sql";

describe("manual shop product ordering", () => {
  it("loads /shop products by manual shop_position before id fallback", () => {
    assert.match(storeSource, /\.order\("shop_position",\s*\{\s*ascending:\s*true,\s*nullsFirst:\s*false\s*\}\)/s);
    assert.match(storeSource, /\.order\("id",\s*\{\s*ascending:\s*true\s*\}\)/s);
  });

  it("keeps explicit customer price sorts overriding default order", () => {
    const products = [
      { id: 1, price: 300 },
      { id: 2, price: 100 },
      { id: 3, price: 200 },
    ];

    assert.deepEqual(sortShopProducts(products, "default").map((item) => item.id), [1, 2, 3]);
    assert.deepEqual(sortShopProducts(products, "low").map((item) => item.id), [2, 3, 1]);
    assert.deepEqual(sortShopProducts(products, "high").map((item) => item.id), [1, 3, 2]);
    assert.match(productGridSource, /sortShopProducts\(result,\s*shopStore\.sortBy\)/);
  });

  it("identifies adjacent products for admin up/down moves", () => {
    const products = [
      { id: 10, shop_position: 1000 },
      { id: 20, shop_position: 2000 },
      { id: 30, shop_position: 3000 },
    ];

    assert.deepEqual(getProductMoveState(products, 10), {
      canMoveUp: false,
      canMoveDown: true,
    });
    assert.deepEqual(getProductMoveState(products, 30), {
      canMoveUp: true,
      canMoveDown: false,
    });
    assert.equal(getAdjacentProductForMove(products, 20, "up")?.id, 10);
    assert.equal(getAdjacentProductForMove(products, 20, "down")?.id, 30);
  });

  it("adds compact admin arrow controls that call the reorder RPC", () => {
    assert.match(adminProductsSource, /moveProduct\(product,\s*['"]up['"]\)/);
    assert.match(adminProductsSource, /moveProduct\(product,\s*['"]down['"]\)/);
    assert.match(adminProductsSource, /\.rpc\("move_product_shop_position"/);
    assert.match(adminProductsSource, /movingProductId/);
  });

  it("defines a concurrency-safe migration, trigger, and admin-only RPC", () => {
    assert.equal(existsSync(migrationPath), true);
    const sql = readFileSync(migrationPath, "utf8");

    assert.match(sql, /alter table public\.products\s+add column if not exists shop_position bigint/i);
    assert.match(sql, /row_number\(\) over \(order by id desc\)/i);
    assert.match(sql, /add constraint products_shop_position_unique\s+unique \(shop_position\)\s+deferrable/i);
    assert.match(sql, /create or replace function public\.set_new_product_shop_position\(\)/i);
    assert.doesNotMatch(sql, /if\s+new\.shop_position\s+is\s+not\s+null\s+then/i);
    assert.match(sql, /pg_advisory_xact_lock\(hashtext\('products_shop_position'\)\)/i);
    assert.match(sql, /create or replace function public\.move_product_shop_position\(\s*p_product_id bigint,\s*p_direction text\s*\)/i);
    assert.match(sql, /v_product_id bigint;/i);
    assert.match(sql, /v_adjacent_id bigint;/i);
    assert.match(sql, /public\.is_admin\(\)/);
    assert.match(sql, /for update/i);
    assert.match(sql, /set constraints products_shop_position_unique deferred/i);
    assert.match(sql, /grant execute on function public\.move_product_shop_position\(bigint, text\)/i);
  });

  it("keeps admin movement globally database-driven instead of filtered-row driven", () => {
    assert.match(adminProductsSource, /orderedProducts = computed\(\(\) => sortProductsByShopPosition\(products\.value\)\)/);
    assert.match(adminProductsSource, /getProductMoveState\(activeOrderedProducts,\s*product\.id\)/);
    assert.match(adminProductsSource, /\.rpc\("move_product_shop_position",\s*\{[\s\S]*p_product_id: product\.id[\s\S]*p_direction: direction/s);
    assert.doesNotMatch(adminProductsSource, /getAdjacentProductForMove\(visibleProducts/);
    assert.doesNotMatch(adminProductsSource, /getAdjacentProductForMove\(filteredProducts/);
  });

  it("builds a single drag reorder payload from the global product order", () => {
    const products = [
      { id: 10, shop_position: 1000 },
      { id: 20, shop_position: 2000 },
      { id: 30, shop_position: 3000 },
      { id: 40, shop_position: 4000 },
    ];

    const topMove = getProductDragReorder(products, 40, 0);
    assert.deepEqual(topMove.reorderedProducts.map((product) => product.id), [40, 10, 20, 30]);
    assert.equal(topMove.previousProductId, null);
    assert.equal(topMove.nextProductId, 10);

    const middleMove = getProductDragReorder(products, 10, 2);
    assert.deepEqual(middleMove.reorderedProducts.map((product) => product.id), [20, 30, 10, 40]);
    assert.equal(middleMove.previousProductId, 30);
    assert.equal(middleMove.nextProductId, 40);

    const bottomMove = getProductDragReorder(products, 10, 3);
    assert.deepEqual(bottomMove.reorderedProducts.map((product) => product.id), [20, 30, 40, 10]);
    assert.equal(bottomMove.previousProductId, 40);
    assert.equal(bottomMove.nextProductId, null);
  });

  it("enables drag ordering from a full reorder list without requiring paginated admin rows", () => {
    const baseState = {
      search: "",
      categoryFilter: 0,
      stockFilter: "all",
      sortBy: "manual",
      reorderListLoaded: true,
      reorderListFailed: false,
    };

    assert.equal(isProductReorderMode(baseState), true);
    assert.equal(isProductDragOrderingDisabled(baseState), false);
    assert.equal(isProductDragOrderingDisabled({ ...baseState, search: "glove" }), true);
    assert.equal(isProductDragOrderingDisabled({ ...baseState, categoryFilter: 3 }), true);
    assert.equal(isProductDragOrderingDisabled({ ...baseState, stockFilter: "in" }), true);
    assert.equal(isProductDragOrderingDisabled({ ...baseState, sortBy: "price-asc" }), true);
    assert.equal(isProductDragOrderingDisabled({ ...baseState, reorderListLoaded: false }), true);
    assert.equal(isProductDragOrderingDisabled({ ...baseState, reorderListFailed: true }), true);
    assert.equal(PRODUCT_DRAG_DISABLED_MESSAGE, "Clear filters and load all products to reorder the full shop catalog.");
  });

  it("loads a separate lightweight full reorder catalog for admin drag mode", () => {
    assert.match(adminProductsSource, /const loadReorderProducts = async/);
    assert.match(adminProductsSource, /\.select\("id, title, slug, cover_image, shop_position"\)/);
    assert.match(adminProductsSource, /admin\.loadingFullOrder/);
    assert.match(adminProductsSource, /isReorderMode/);
    assert.match(adminProductsSource, /reorderProductsLoaded/);
  });

  it("assigns deterministic optimistic positions without touching created_at", () => {
    const products = [
      { id: 20, shop_position: 2000, created_at: "2026-01-02" },
      { id: 10, shop_position: 1000, created_at: "2026-01-01" },
    ];

    assert.deepEqual(getOptimisticShopPositions(products), [
      { id: 20, shop_position: 1000, created_at: "2026-01-02" },
      { id: 10, shop_position: 2000, created_at: "2026-01-01" },
    ]);
  });

  it("adds drag-and-drop without wrapping table rows in invalid markup", () => {
    assert.match(adminProductsSource, /from "vue-draggable-plus"/);
    assert.match(adminProductsSource, /useDraggable/);
    assert.match(adminProductsSource, /ref="productTableBody"/);
    assert.match(adminProductsSource, /product-drag-handle/);
    assert.match(adminProductsSource, /\.rpc\("move_product_shop_position_to"/);
    assert.doesNotMatch(adminProductsSource, /<VueDraggable/);
  });

  it("defines a stale-safe admin drag reorder RPC", () => {
    assert.equal(existsSync(dragMigrationPath), true);
    const sql = readFileSync(dragMigrationPath, "utf8");

    assert.match(sql, /create or replace function public\.move_product_shop_position_to\(\s*p_product_id bigint,\s*p_previous_product_id bigint,\s*p_next_product_id bigint\s*\)/i);
    assert.match(sql, /if public\.is_admin\(\) is not true then/i);
    assert.match(sql, /pg_advisory_xact_lock\(hashtext\('products_shop_position'\)\)/i);
    assert.match(sql, /set constraints products_shop_position_unique deferred/i);
    assert.match(sql, /for update/i);
    assert.match(sql, /Destination is stale or invalid/i);
    assert.match(sql, /floor\(\s*v_previous_position::numeric \+ \(\(v_next_position::numeric - v_previous_position::numeric\) \/ 2\)\s*\)::bigint/i);
    assert.match(sql, /v_next_position - 1000/i);
    assert.match(sql, /v_previous_position \+ 1000/i);
    assert.match(sql, /row_number\(\) over \(order by ordinality\)/i);
    assert.match(sql, /grant execute on function public\.move_product_shop_position_to\(bigint, bigint, bigint\)/i);
    assert.doesNotMatch(sql, /created_at\s*=/i);
  });

  it("does not change homepage best-seller ordering flow", () => {
    assert.doesNotMatch(featuredProductsSource, /shop_position/);
  });
});
