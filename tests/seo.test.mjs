import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

import {
  DEFAULT_SITE_URL,
  buildAbsoluteImageUrl,
  buildCategorySeo,
  buildCanonicalUrl,
  buildOrganizationStructuredData,
  buildProductImageAlt,
  buildProductSeoMeta,
  buildProductStructuredData,
  buildRobotsTxt,
  buildSeoTitle,
  buildShopCategoryCanonicalUrl,
  buildShopCategoryUrl,
  buildSitemapXml,
  buildWebsiteStructuredData,
  getCategorySeoIntent,
  isPrivateSeoPath,
  publicSitemapEntries,
  SEO_DEFAULT_IMAGE,
} from "../utils/seo.ts";
import {
  buildBlogSeoMeta,
  buildBlogStructuredData,
} from "../utils/blog.ts";

const enLocaleSource = readFileSync(
  new URL("../locales/en.json", import.meta.url),
  "utf8",
);
const arLocaleSource = readFileSync(
  new URL("../locales/ar.json", import.meta.url),
  "utf8",
);
const enLocale = JSON.parse(enLocaleSource);
const arLocale = JSON.parse(arLocaleSource);
const seoSource = readFileSync(new URL("../utils/seo.ts", import.meta.url), "utf8");
const homeHeroSource = readFileSync(
  new URL("../components/home/HeroSection.vue", import.meta.url),
  "utf8",
);
const homeCategoriesSource = readFileSync(
  new URL("../components/home/CategoriesSection.vue", import.meta.url),
  "utf8",
);
const productPageSource = readFileSync(
  new URL("../pages/shop/[slug].vue", import.meta.url),
  "utf8",
);
const termsPageSource = readFileSync(
  new URL("../pages/terms.vue", import.meta.url),
  "utf8",
);
const shopPageSource = readFileSync(
  new URL("../pages/shop/index.vue", import.meta.url),
  "utf8",
);
const blogDetailSource = readFileSync(
  new URL("../pages/blog/[slug].vue", import.meta.url),
  "utf8",
);
const sitemapSource = readFileSync(
  new URL("../server/routes/sitemap.xml.ts", import.meta.url),
  "utf8",
);
const robotsSource = readFileSync(
  new URL("../server/routes/robots.txt.ts", import.meta.url),
  "utf8",
);
const nuxtConfigSource = readFileSync(
  new URL("../nuxt.config.ts", import.meta.url),
  "utf8",
);
const appSource = readFileSync(new URL("../app.vue", import.meta.url), "utf8");

describe("SEO helpers", () => {
  it("keeps Arabic customer-facing copy free of obvious typo and spacing artifacts", () => {
    const customerFacingArabicCopy = [arLocaleSource, seoSource].join("\n");

    assert.doesNotMatch(customerFacingArabicCopy, /وادوات/);
    assert.doesNotMatch(customerFacingArabicCopy, /التمرينه/);
    assert.doesNotMatch(customerFacingArabicCopy, /منهاادوات/);
    assert.doesNotMatch(customerFacingArabicCopy, /الادوات  /);
    assert.doesNotMatch(customerFacingArabicCopy, /تمرينهصعبة/);
    assert.doesNotMatch(arLocaleSource, /"shopLead":\s*"\s+/);
    assert.match(arLocaleSource, /وأدوات فنون قتالية/);
    assert.match(arLocaleSource, /جهّز نفسك للتمرين الجاي/);
    assert.match(arLocaleSource, /منها أدوات التمرين/);
    assert.match(arLocaleSource, /"shopLead": "أدوات عالية الجودة، معمولة مخصوص للتمرين كل يوم\."/);
  });

  it("builds clean canonical URLs without query strings or duplicate slashes", () => {
    assert.equal(
      buildCanonicalUrl("https://viking.example/", "/shop?category=boxing"),
      "https://viking.example/shop",
    );
    assert.equal(
      buildCanonicalUrl("https://viking.example", "shop/gloves#reviews"),
      "https://viking.example/shop/gloves",
    );
    assert.equal(
      buildCanonicalUrl("https://viking.example", "/"),
      "https://viking.example/",
    );
  });

  it("keeps product structured data EGP-only and uses real review aggregates only", () => {
    const product = {
      title: "Elite Boxing Gloves",
      slug: "elite-boxing-gloves",
      description: "Premium gloves for daily rounds.",
      price: 1500,
      cover_image: "https://images.example/gloves.jpg",
      product_sizes: [{ in_stock: true }],
      categories: { name: "Boxing" },
    };

    const withoutReviews = buildProductStructuredData(
      product,
      "https://viking.example/shop/elite-boxing-gloves",
      {
        total: 0,
        average: 0,
      },
    );
    const withReviews = buildProductStructuredData(
      product,
      "https://viking.example/shop/elite-boxing-gloves",
      {
        total: 3,
        average: 4.666,
      },
    );

    assert.equal(withoutReviews.offers.priceCurrency, "EGP");
    assert.equal(withoutReviews.offers.price, 1500);
    assert.equal(withoutReviews.aggregateRating, undefined);
    assert.equal(withReviews.aggregateRating.ratingValue, "4.7");
    assert.equal(withReviews.aggregateRating.reviewCount, 3);
  });

  it("builds product structured data from real SKU, joined brand, canonical URL, and safe description", () => {
    const canonicalUrl = "https://viking.example/shop/elite-boxing-gloves";
    const structuredData = buildProductStructuredData(
      {
        title: "Elite Boxing Gloves",
        slug: "elite-boxing-gloves",
        sku: "  VEN-001  ",
        description:
          " <p>Boxing <strong>gloves</strong></p>\n\nBuilt   for daily rounds. ",
        price: 1500,
        cover_image: "/images/gloves-cover.jpg",
        product_colors: [
          {
            product_images: [
              { image_url: "/images/gloves-red.jpg" },
              { image_url: "/images/gloves-red.jpg" },
            ],
          },
        ],
        product_sizes: [{ in_stock: true }],
        categories: { slug: "boxing", name: "Boxing" },
        brands: { name: "Venum" },
      },
      canonicalUrl,
      {
        total: 0,
        average: 0,
      },
    );

    assert.equal(structuredData.sku, "VEN-001");
    assert.equal(structuredData.brand.name, "Venum");
    assert.equal(
      structuredData.description,
      "Boxing gloves Built for daily rounds.",
    );
    assert.equal(structuredData.url, canonicalUrl);
    assert.equal(structuredData.offers.url, canonicalUrl);
    assert.equal(structuredData.offers.price, 1500);
    assert.equal(structuredData.offers.priceCurrency, "EGP");
    assert.deepEqual(structuredData.offers.seller, {
      "@id": "https://viking.example/#organization",
    });
    assert.equal(structuredData.offers.availability, "https://schema.org/InStock");
    assert.deepEqual(structuredData.image, [
      "https://viking.example/images/gloves-cover.jpg",
      "https://viking.example/images/gloves-red.jpg",
    ]);
    assert.equal(structuredData.aggregateRating, undefined);
  });

  it("omits product structured SKU and brand instead of inventing storefront data", () => {
    const slugOnlyProduct = buildProductStructuredData(
      {
        title: "Training Wraps",
        slug: "training-wraps",
        sku: "",
        description: "",
        price: 350,
        brand_name: "   ",
      },
      "https://viking.example/shop/training-wraps",
      {
        total: 0,
        average: 0,
      },
    );
    const whitespaceSkuProduct = buildProductStructuredData(
      {
        title: "Training Wraps",
        slug: "training-wraps",
        sku: "   ",
        description: "",
        price: 350,
      },
      "https://viking.example/shop/training-wraps",
      {
        total: 0,
        average: 0,
      },
    );

    assert.equal("sku" in slugOnlyProduct, false);
    assert.equal("sku" in whitespaceSkuProduct, false);
    assert.equal("brand" in slugOnlyProduct, false);
    assert.deepEqual(slugOnlyProduct.offers.seller, {
      "@id": "https://viking.example/#organization",
    });
  });

  it("builds ProductGroup structured data for variant-managed products using public variant deep links", () => {
    const structuredData = buildProductStructuredData(
      {
        title: "Variant Gloves",
        slug: "variant-gloves",
        product_group_key: "group-uuid-1",
        inventory_model: "variants",
        description: "<p>Variant <strong>gloves</strong></p>",
        price: 800,
        cover_image: "/cover.png",
        categories: { slug: "boxing", name: "Boxing" },
        brand_name: "Venum",
        product_colors: [
          {
            id: 1,
            name: "Red",
            product_images: [{ image_url: "/red.png" }],
          },
          {
            id: 2,
            name: "Black",
            product_images: [{ image_url: "/black.png" }],
          },
          {
            id: 3,
            name: "Blue",
            product_images: [{ image_url: "/blue.png" }],
          },
        ],
        product_sizes: [
          { id: 11, size: "M" },
          { id: 12, size: "L" },
          { id: 13, size: "XL" },
        ],
        product_variants: [
          { id: 101, public_key: "red-l-key", color_id: 1, size_id: 12, price: 850, old_price: 1000, stock_quantity: 4, is_active: true },
          { id: 102, public_key: "black-xl-key", color_id: 2, size_id: 13, price: 920, old_price: 1100, stock_quantity: 0, is_active: true },
          { id: 103, public_key: "blue-m-key", color_id: 3, size_id: 11, price: 780, stock_quantity: 3, is_active: false },
        ],
      },
      "https://viking.example/shop/variant-gloves",
      {
        total: 5,
        average: 4.2,
      },
    );

    assert.equal(structuredData["@type"], "ProductGroup");
    assert.equal(structuredData["@id"], "https://viking.example/shop/variant-gloves#product-group");
    assert.equal(structuredData.productGroupID, "group-uuid-1");
    assert.equal(structuredData.url, "https://viking.example/shop/variant-gloves");
    assert.equal(structuredData.description, "Variant gloves");
    assert.equal(structuredData.brand.name, "Venum");
    assert.deepEqual(structuredData.variesBy, [
      "https://schema.org/color",
      "https://schema.org/size",
    ]);
    assert.equal(structuredData.aggregateRating.ratingValue, "4.2");
    assert.equal(structuredData.hasVariant.length, 2);

    const redVariant = structuredData.hasVariant[0];
    const blackVariant = structuredData.hasVariant[1];

    assert.equal(redVariant["@type"], "Product");
    assert.equal(redVariant["@id"], "https://viking.example/shop/variant-gloves?variant=red-l-key#product");
    assert.equal(redVariant.url, "https://viking.example/shop/variant-gloves?variant=red-l-key");
    assert.equal(redVariant.name, "Variant Gloves - Red - L");
    assert.equal(redVariant.color, "Red");
    assert.equal(redVariant.size, "L");
    assert.equal("sku" in redVariant, false);
    assert.equal("aggregateRating" in redVariant, false);
    assert.equal(redVariant.offers.price, 850);
    assert.notEqual(redVariant.offers.price, 1000);
    assert.equal(redVariant.offers.priceCurrency, "EGP");
    assert.equal(redVariant.offers.availability, "https://schema.org/InStock");
    assert.equal(redVariant.offers.url, redVariant.url);
    assert.deepEqual(redVariant.offers.seller, {
      "@id": "https://viking.example/#organization",
    });
    assert.deepEqual(redVariant.image, ["https://viking.example/red.png"]);

    assert.equal(blackVariant.name, "Variant Gloves - Black - XL");
    assert.equal(blackVariant.offers.price, 920);
    assert.notEqual(blackVariant.offers.price, 1100);
    assert.equal(blackVariant.offers.availability, "https://schema.org/OutOfStock");
    assert.deepEqual(blackVariant.offers.seller, redVariant.offers.seller);
    assert.doesNotMatch(JSON.stringify(structuredData), /cost_price|product_costs|product_variant_costs|payment|token|customer/i);
    assert.doesNotMatch(JSON.stringify(structuredData), /blue-m-key/);
  });

  it("links product offers to the global Viking Store Organization without changing brand", () => {
    const organization = buildOrganizationStructuredData("");
    const product = buildProductStructuredData(
      {
        title: "Venum Gloves",
        slug: "venum-gloves",
        brand_name: "Venum",
        description: "Training gloves.",
        price: 1500,
      },
      "https://vikingclubstore.com/shop/venum-gloves",
      {
        total: 0,
        average: 0,
      },
    );
    const variantGroup = buildProductStructuredData(
      {
        title: "Venum Variant Gloves",
        slug: "venum-variant-gloves",
        brand_name: "Venum",
        product_group_key: "group-uuid-seller",
        inventory_model: "variants",
        description: "Variant training gloves.",
        product_variants: [
          { public_key: "variant-seller-key", price: 1700, stock_quantity: 2, is_active: true },
        ],
      },
      "https://vikingclubstore.com/shop/venum-variant-gloves",
      {
        total: 0,
        average: 0,
      },
    );

    assert.equal(organization["@id"], "https://vikingclubstore.com/#organization");
    assert.equal(organization.name, "Viking Store");
    assert.equal(organization.url, "https://vikingclubstore.com/");
    assert.equal(product.brand.name, "Venum");
    assert.deepEqual(product.offers.seller, {
      "@id": organization["@id"],
    });
    assert.deepEqual(variantGroup.hasVariant[0].offers.seller, {
      "@id": organization["@id"],
    });
    assert.equal(JSON.stringify(product).includes("viking-store.vercel.app"), false);
    assert.equal(JSON.stringify(variantGroup).includes("viking-store.vercel.app"), false);
    assert.equal((appSource.match(/buildOrganizationStructuredData/g) || []).length, 2);
    assert.doesNotMatch(productPageSource, /buildOrganizationStructuredData/);
  });

  it("adds the approved return policy to Organization and only overrides excluded product offers", () => {
    const organization = buildOrganizationStructuredData("");
    const policy = organization.hasMerchantReturnPolicy;
    const standardProduct = buildProductStructuredData(
      {
        title: "Training Gloves",
        slug: "training-gloves",
        price: 1500,
        product_sizes: [{ in_stock: true }],
        categories: { slug: "boxing", name: "Boxing" },
      },
      "https://vikingclubstore.com/shop/training-gloves",
      { total: 0, average: 0 },
    );
    const misleadingTitleProduct = buildProductStructuredData(
      {
        title: "Mouth Guard Storage Bag",
        slug: "mouth-guard-storage-bag",
        price: 250,
        categories: { slug: "boxing", name: "Boxing" },
      },
      "https://vikingclubstore.com/shop/mouth-guard-storage-bag",
      { total: 0, average: 0 },
    );
    const mouthGuardProduct = buildProductStructuredData(
      {
        title: "Training Oral Protection",
        slug: "training-oral-protection",
        price: 300,
        product_sizes: [{ in_stock: true }],
        categories: { slug: "mouth-guards", name: "Mouth Guards" },
      },
      "https://vikingclubstore.com/shop/training-oral-protection",
      { total: 0, average: 0 },
    );
    const mouthGuardVariantGroup = buildProductStructuredData(
      {
        title: "Variant Oral Protection",
        slug: "variant-oral-protection",
        inventory_model: "variants",
        product_group_key: "mouth-guard-group",
        categories: { slug: "mouth-guards", name: "Mouth Guards" },
        product_variants: [
          { public_key: "adult-clear", price: 350, stock_quantity: 3, is_active: true },
          { public_key: "junior-red", price: 320, stock_quantity: 0, is_active: true },
        ],
      },
      "https://vikingclubstore.com/shop/variant-oral-protection",
      { total: 0, average: 0 },
    );

    assert.equal(organization["@id"], "https://vikingclubstore.com/#organization");
    assert.deepEqual(policy, {
      "@type": "MerchantReturnPolicy",
      applicableCountry: "EG",
      returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
      merchantReturnDays: 3,
      returnMethod: "https://schema.org/ReturnByMail",
      returnFees: "https://schema.org/ReturnFeesCustomerResponsibility",
      refundType: "https://schema.org/FullRefund",
      itemCondition: "https://schema.org/NewCondition",
      merchantReturnLink: "https://vikingclubstore.com/terms",
    });
    assert.equal("returnShippingFeesAmount" in policy, false);
    assert.equal(JSON.stringify(organization).includes("shippingDetails"), false);
    assert.equal("hasMerchantReturnPolicy" in standardProduct.offers, false);
    assert.equal("hasMerchantReturnPolicy" in misleadingTitleProduct.offers, false);
    assert.deepEqual(mouthGuardProduct.offers.hasMerchantReturnPolicy, {
      "@type": "MerchantReturnPolicy",
      applicableCountry: "EG",
      returnPolicyCategory: "https://schema.org/MerchantReturnNotPermitted",
    });
    assert.equal(mouthGuardProduct.offers.seller["@id"], organization["@id"]);
    assert.equal(mouthGuardProduct.offers.price, 300);
    assert.equal(mouthGuardProduct.offers.priceCurrency, "EGP");
    assert.equal(mouthGuardProduct.offers.availability, "https://schema.org/InStock");
    assert.equal(
      mouthGuardProduct.offers.url,
      "https://vikingclubstore.com/shop/training-oral-protection",
    );
    assert.equal(mouthGuardVariantGroup["@type"], "ProductGroup");
    assert.equal(mouthGuardVariantGroup.productGroupID, "mouth-guard-group");
    assert.equal(mouthGuardVariantGroup.hasVariant.length, 2);
    for (const variant of mouthGuardVariantGroup.hasVariant) {
      assert.deepEqual(variant.offers.hasMerchantReturnPolicy, {
        "@type": "MerchantReturnPolicy",
        applicableCountry: "EG",
        returnPolicyCategory: "https://schema.org/MerchantReturnNotPermitted",
      });
      assert.equal(variant.offers.priceCurrency, "EGP");
      assert.equal(variant.offers.seller["@id"], organization["@id"]);
    }
  });

  it("keeps visible return policy copy consistent with the approved policy", () => {
    const englishPolicyCopy = [
      enLocale.shop.returnsText,
      enLocale.pages.faqReturnA,
      ...enLocale.legal.terms.sections.find((section) => section.id === "coupons-returns").body,
    ].join(" ");
    const arabicPolicyCopy = [
      arLocale.shop.returnsText,
      arLocale.pages.faqReturnA,
      ...arLocale.legal.terms.sections.find((section) => section.id === "coupons-returns").body,
    ].join(" ");

    assert.match(englishPolicyCopy, /within 3 days/i);
    assert.match(englishPolicyCopy, /unused/i);
    assert.match(englishPolicyCopy, /clean/i);
    assert.match(englishPolicyCopy, /original condition/i);
    assert.match(englishPolicyCopy, /original packaging/i);
    assert.match(englishPolicyCopy, /customer.*return shipping/i);
    assert.match(englishPolicyCopy, /courier|Egypt Post/i);
    assert.match(englishPolicyCopy, /full refund/i);
    assert.match(englishPolicyCopy, /personal-use|hygiene-sensitive/i);
    assert.match(englishPolicyCopy, /mouth guards/i);
    assert.match(englishPolicyCopy, /groin|under-belt/i);
    assert.doesNotMatch(englishPolicyCopy, /within 14 days/i);
    assert.doesNotMatch(englishPolicyCopy, /free returns/i);

    assert.match(arabicPolicyCopy, /3 أيام/);
    assert.match(arabicPolicyCopy, /غير مستخدم/);
    assert.match(arabicPolicyCopy, /نظيف/);
    assert.match(arabicPolicyCopy, /حالته الأصلية/);
    assert.match(arabicPolicyCopy, /تغليفه الأصلي/);
    assert.match(arabicPolicyCopy, /العميل يتحمل تكلفة شحن المرتجع/);
    assert.match(arabicPolicyCopy, /شركة شحن|البريد المصري/);
    assert.match(arabicPolicyCopy, /استرداد كامل/);
    assert.match(arabicPolicyCopy, /الاستخدام الشخصي/);
    assert.match(arabicPolicyCopy, /ماوث جارد/);
    assert.match(arabicPolicyCopy, /واقي تحت الحزام/);
    assert.doesNotMatch(arabicPolicyCopy, /5 ايام|5 أيام/);
  });

  it("builds Organization shipping service from live shipping settings without product-level duplication", () => {
    const shippingSource = {
      settings: {
        shipping_enabled: true,
        free_shipping_all_orders: false,
        free_shipping_threshold_enabled: true,
        free_shipping_threshold: 1000,
        default_shipping_fee: 80,
      },
      governorates: [
        { code: "cairo", is_enabled: true, shipping_fee: 60 },
        { code: "giza", is_enabled: true, shipping_fee: 95 },
        { code: "alexandria", is_enabled: true, shipping_fee: null },
        { code: "disabled-zone", is_enabled: false, shipping_fee: 500 },
      ],
    };
    const organization = buildOrganizationStructuredData("https://viking.example", {
      shippingSource,
    });
    const shippingService = organization.hasShippingService;
    const paidCondition = shippingService.shippingConditions[0];
    const freeCondition = shippingService.shippingConditions[1];
    const product = buildProductStructuredData(
      {
        title: "Training Gloves",
        slug: "training-gloves",
        price: 1500,
        categories: { slug: "boxing", name: "Boxing" },
      },
      "https://viking.example/shop/training-gloves",
      { total: 0, average: 0 },
    );
    const variantGroup = buildProductStructuredData(
      {
        title: "Variant Gloves",
        slug: "variant-gloves",
        inventory_model: "variants",
        product_group_key: "shipping-group",
        categories: { slug: "boxing", name: "Boxing" },
        product_variants: [
          { public_key: "red-l", price: 850, stock_quantity: 4, is_active: true },
        ],
      },
      "https://viking.example/shop/variant-gloves",
      { total: 0, average: 0 },
    );

    assert.equal(organization["@id"], "https://viking.example/#organization");
    assert.equal(shippingService["@type"], "ShippingService");
    assert.equal(shippingService["@id"], "https://viking.example/#standard-shipping");
    assert.equal(shippingService.name, "Viking Store Standard Shipping");
    assert.equal(
      shippingService.fulfillmentType,
      "https://schema.org/FulfillmentTypeDelivery",
    );
    assert.equal(paidCondition["@type"], "ShippingConditions");
    assert.deepEqual(paidCondition.shippingDestination, {
      "@type": "DefinedRegion",
      addressCountry: "EG",
    });
    assert.deepEqual(paidCondition.shippingRate, {
      "@type": "MonetaryAmount",
      maxValue: 95,
      currency: "EGP",
    });
    assert.deepEqual(paidCondition.orderValue, {
      "@type": "MonetaryAmount",
      minValue: 0,
      maxValue: 1000,
      currency: "EGP",
    });
    assert.deepEqual(freeCondition.shippingRate, {
      "@type": "MonetaryAmount",
      value: 0,
      currency: "EGP",
    });
    assert.deepEqual(freeCondition.orderValue, {
      "@type": "MonetaryAmount",
      minValue: 1000,
      currency: "EGP",
    });
    assert.equal(JSON.stringify(shippingService).includes("addressRegion"), false);
    assert.equal(JSON.stringify(shippingService).includes("transitTime"), false);
    assert.equal(JSON.stringify(shippingService).includes("handlingTime"), false);
    assert.equal(
      organization.hasMerchantReturnPolicy.returnPolicyCategory,
      "https://schema.org/MerchantReturnFiniteReturnWindow",
    );
    assert.equal(organization.hasMerchantReturnPolicy.merchantReturnDays, 3);
    assert.equal(product.offers.price, 1500);
    assert.equal(product.offers.priceCurrency, "EGP");
    assert.equal(product.offers.seller["@id"], "https://viking.example/#organization");
    assert.equal("shippingDetails" in product.offers, false);
    assert.equal(JSON.stringify(product).includes("OfferShippingDetails"), false);
    assert.equal(variantGroup["@type"], "ProductGroup");
    assert.equal(variantGroup.hasVariant[0].offers.price, 850);
    assert.equal("shippingDetails" in variantGroup.hasVariant[0].offers, false);
  });

  it("models shipping free-all, no-threshold, and disabled modes without fake conditions", () => {
    const enabledGovernorates = [
      { code: "cairo", is_enabled: true, shipping_fee: 40 },
      { code: "giza", is_enabled: true, shipping_fee: 65 },
      { code: "alexandria", is_enabled: true, shipping_fee: null },
    ];
    const freeAllOrganization = buildOrganizationStructuredData("https://viking.example", {
      shippingSource: {
        settings: {
          shipping_enabled: true,
          free_shipping_all_orders: true,
          free_shipping_threshold_enabled: false,
          free_shipping_threshold: null,
          default_shipping_fee: null,
        },
        governorates: enabledGovernorates,
      },
    });
    const noThresholdOrganization = buildOrganizationStructuredData("https://viking.example", {
      shippingSource: {
        settings: {
          shipping_enabled: true,
          free_shipping_all_orders: false,
          free_shipping_threshold_enabled: false,
          free_shipping_threshold: null,
          default_shipping_fee: 70,
        },
        governorates: enabledGovernorates,
      },
    });
    const disabledOrganization = buildOrganizationStructuredData("https://viking.example", {
      shippingSource: {
        settings: {
          shipping_enabled: false,
          free_shipping_all_orders: true,
          free_shipping_threshold_enabled: false,
          free_shipping_threshold: null,
          default_shipping_fee: null,
        },
        governorates: enabledGovernorates,
      },
    });

    assert.deepEqual(
      freeAllOrganization.hasShippingService.shippingConditions.shippingRate,
      {
        "@type": "MonetaryAmount",
        value: 0,
        currency: "EGP",
      },
    );
    assert.equal("orderValue" in freeAllOrganization.hasShippingService.shippingConditions, false);
    assert.deepEqual(
      noThresholdOrganization.hasShippingService.shippingConditions.shippingRate,
      {
        "@type": "MonetaryAmount",
        maxValue: 70,
        currency: "EGP",
      },
    );
    assert.equal("orderValue" in noThresholdOrganization.hasShippingService.shippingConditions, false);
    assert.equal("hasShippingService" in disabledOrganization, false);
  });

  it("keeps shipping schema dynamic on the terms page without a global app fetch", () => {
    const englishTermsShippingCopy = enLocale.legal.terms.sections
      .find((section) => section.id === "coupons-returns")
      .body.join(" ");
    const arabicTermsShippingCopy = arLocale.legal.terms.sections
      .find((section) => section.id === "coupons-returns")
      .body.join(" ");

    assert.match(termsPageSource, /buildOrganizationStructuredData/);
    assert.match(termsPageSource, /shipping_settings/);
    assert.match(termsPageSource, /shipping_governorates/);
    assert.match(termsPageSource, /shippingSource/);
    assert.doesNotMatch(appSource, /shipping_settings|shipping_governorates/);
    assert.doesNotMatch(termsPageSource, /addressRegion/);
    assert.match(englishTermsShippingCopy, /delivery within Egypt/i);
    assert.match(englishTermsShippingCopy, /destination|governorate/i);
    assert.match(englishTermsShippingCopy, /calculated at checkout/i);
    assert.match(englishTermsShippingCopy, /free shipping may apply/i);
    assert.match(arabicTermsShippingCopy, /التوصيل داخل مصر/);
    assert.match(arabicTermsShippingCopy, /المحافظة/);
    assert.match(arabicTermsShippingCopy, /إتمام الطلب/);
    assert.match(arabicTermsShippingCopy, /الشحن المجاني/);
  });

  it("keeps zero-active variant products from advertising a fake purchasable offer", () => {
    const structuredData = buildProductStructuredData(
      {
        title: "Dormant Variant Gloves",
        slug: "dormant-variant-gloves",
        product_group_key: "group-uuid-empty",
        inventory_model: "variants",
        description: "Variant product without active variants.",
        price: 800,
        product_variants: [
          { id: 201, public_key: "inactive-key", price: 800, stock_quantity: 9, is_active: false },
        ],
      },
      "https://viking.example/shop/dormant-variant-gloves",
      {
        total: 0,
        average: 0,
      },
    );

    assert.equal(structuredData["@type"], "ProductGroup");
    assert.equal(structuredData.productGroupID, "group-uuid-empty");
    assert.deepEqual(structuredData.hasVariant, []);
    assert.equal("offers" in structuredData, false);
  });

  it("deduplicates the global title brand suffix without changing normal suffixing", () => {
    assert.equal(
      buildSeoTitle("Shop Combat Sports Gear"),
      "Shop Combat Sports Gear | Viking Store",
    );
    assert.equal(
      buildSeoTitle("Viking Store Egypt | Combat Sports & Martial Arts Gear"),
      "Viking Store Egypt | Combat Sports & Martial Arts Gear",
    );
    assert.equal(
      buildSeoTitle("viking store egypt | Combat Sports & Martial Arts Gear"),
      "viking store egypt | Combat Sports & Martial Arts Gear",
    );
    assert.equal(
      buildSeoTitle("فايكنج ستور مصر | مستلزمات الألعاب القتالية"),
      "فايكنج ستور مصر | مستلزمات الألعاب القتالية",
    );
    assert.equal(buildSeoTitle(""), "Viking Store");
    assert.equal(buildSeoTitle(undefined), "Viking Store");
  });

  it("keeps private routes out of robots and sitemap output", () => {
    const robots = buildRobotsTxt("https://viking.example");
    const sitemap = buildSitemapXml([
      ...publicSitemapEntries("https://viking.example"),
      { loc: "https://viking.example/shop/gloves" },
      {
        loc: "https://viking.example/blog/wrap-guide",
        lastmod: "2026-08-17T10:00:00.000Z",
      },
    ]);

    assert.match(robots, /Disallow: \/admin/);
    assert.match(robots, /Disallow: \/checkout/);
    assert.match(robots, /Sitemap: https:\/\/viking\.example\/sitemap\.xml/);
    assert.match(sitemap, /https:\/\/viking\.example\/shop\/gloves/);
    assert.doesNotMatch(sitemap, /\/admin/);
    assert.doesNotMatch(sitemap, /\/checkout/);
  });

  it("keeps Instapay payment routes noindex without blocking crawler access", () => {
    const routeRobots = (path) =>
      isPrivateSeoPath(path) ? "noindex,nofollow" : "index,follow";
    const robots = buildRobotsTxt("https://viking.example");
    const sitemap = buildSitemapXml([
      { loc: "https://viking.example/payments/instapay/123" },
      { loc: "https://viking.example/shop/gloves" },
    ]);

    assert.equal(isPrivateSeoPath("/payments"), true);
    assert.equal(isPrivateSeoPath("/payments/instapay/123"), true);
    assert.equal(isPrivateSeoPath("/payments/instapay/123?token=REDACTED"), true);
    assert.equal(routeRobots("/payments/instapay/123"), "noindex,nofollow");
    assert.equal(routeRobots("/shop"), "index,follow");
    assert.equal(isPrivateSeoPath("/checkout"), true);
    assert.doesNotMatch(robots, /Disallow: \/payments/);
    assert.doesNotMatch(sitemap, /\/payments\/instapay\/123/);
    assert.match(sitemap, /\/shop\/gloves/);
  });

  it("uses the custom production URL as the runtime SEO fallback", () => {
    assert.match(nuxtConfigSource, /DEFAULT_SITE_URL/);
    assert.equal(DEFAULT_SITE_URL, "https://vikingclubstore.com");
    assert.equal(
      buildCanonicalUrl("", "/shop"),
      "https://vikingclubstore.com/shop",
    );
    assert.match(
      buildRobotsTxt(""),
      /Sitemap: https:\/\/vikingclubstore\.com\/sitemap\.xml/,
    );
  });

  it("does not emit the old Vercel domain from production SEO fallbacks", () => {
    const oldDomain = "viking-store.vercel.app";
    const sitemap = buildSitemapXml([
      ...publicSitemapEntries(""),
      { loc: buildCanonicalUrl("", "/shop/pro-gloves") },
      { loc: buildCanonicalUrl("", "/blog/boxing-guide") },
    ]);
    const robots = buildRobotsTxt("");
    const canonical = buildCanonicalUrl("", "/shop");
    const organization = buildOrganizationStructuredData("");
    const website = buildWebsiteStructuredData("");

    assert.doesNotMatch(DEFAULT_SITE_URL, new RegExp(oldDomain));
    assert.doesNotMatch(sitemap, new RegExp(oldDomain));
    assert.doesNotMatch(robots, new RegExp(oldDomain));
    assert.doesNotMatch(canonical, new RegExp(oldDomain));
    assert.doesNotMatch(JSON.stringify(organization), new RegExp(oldDomain));
    assert.doesNotMatch(JSON.stringify(website), new RegExp(oldDomain));
    assert.match(sitemap, /https:\/\/vikingclubstore\.com\/shop\/pro-gloves/);
    assert.match(sitemap, /https:\/\/vikingclubstore\.com\/blog\/boxing-guide/);
    assert.match(robots, /Sitemap: https:\/\/vikingclubstore\.com\/sitemap\.xml/);
    assert.equal(organization.url, "https://vikingclubstore.com/");
    assert.equal(organization["@id"], "https://vikingclubstore.com/#organization");
    assert.equal(organization.logo, "https://vikingclubstore.com/logo.png");
    assert.equal(website.url, "https://vikingclubstore.com/");
    assert.equal(
      website.potentialAction.target,
      "https://vikingclubstore.com/shop?search={search_term_string}",
    );
  });

  it("uses the canonical production origin for relative OG and Twitter images", () => {
    const blogMeta = buildBlogSeoMeta(
      {
        title: "Wrap Guide",
        slug: "wrap-guide",
        excerpt: "Guide",
        og_image: "/blog/wrap-guide.webp",
      },
      "https://vikingclubstore.com/blog/wrap-guide",
    );
    const blogStructuredData = buildBlogStructuredData(
      {
        title: "Wrap Guide",
        slug: "wrap-guide",
        excerpt: "Guide",
        cover_image: "/blog/wrap-guide-cover.webp",
      },
      "https://vikingclubstore.com/blog/wrap-guide",
      "Viking Store",
    );

    assert.equal(
      buildAbsoluteImageUrl("", "/products/glove.webp"),
      "https://vikingclubstore.com/products/glove.webp",
    );
    assert.equal(blogMeta.ogImage, "https://vikingclubstore.com/blog/wrap-guide.webp");
    assert.equal(blogMeta.twitterImage, "https://vikingclubstore.com/blog/wrap-guide.webp");
    assert.equal(
      blogStructuredData.article.image,
      "https://vikingclubstore.com/blog/wrap-guide-cover.webp",
    );
    assert.match(productPageSource, /buildAbsoluteImageUrl/);
    assert.match(productPageSource, /twitterImage/);
  });

  it("builds category SEO and links only for real filtered shop routes", () => {
    const boxing = getCategorySeoIntent(
      { slug: "boxing", name: "Boxing" },
      "ar",
    );
    const mma = buildCategorySeo({ slug: "mma", name: "MMA" }, "ar");

    assert.match(boxing.keywords, /قفازات ملاكمة/);
    assert.match(mma.title, /MMA/);
    assert.equal(buildShopCategoryUrl("boxing"), "/shop?category=boxing");
    assert.equal(buildShopCategoryUrl("all"), "/shop");
    assert.doesNotMatch(buildShopCategoryUrl("kick boxing!"), /!| /);
  });

  it("maps Egyptian product category search intent without keyword stuffing", () => {
    const gloves = getCategorySeoIntent({ slug: "gloves", name: "Gloves" }, "ar");
    const shinGuards = getCategorySeoIntent(
      { slug: "shin-guards", name: "Shin Guards" },
      "ar",
    );
    const handWraps = getCategorySeoIntent(
      { slug: "hand-wraps", name: "Hand Wraps" },
      "ar",
    );
    const headGuards = getCategorySeoIntent(
      { slug: "head-guards", name: "Head Guards" },
      "ar",
    );
    const mouthGuards = getCategorySeoIntent(
      { slug: "mouth-guards", name: "Mouth Guards" },
      "ar",
    );

    assert.equal(gloves.title, "جلافز ملاكمة في مصر");
    assert.equal(`${gloves.title} | Viking Store`, "جلافز ملاكمة في مصر | Viking Store");
    assert.doesNotMatch(gloves.title, /قلبظ|قلابظ/);
    assert.match(gloves.description, /قفازات ملاكمة/);
    assert.match(gloves.keywords, /جلافز ملاكمة/);
    assert.match(gloves.keywords, /قلبظ ملاكمة/);
    assert.match(gloves.keywords, /قلابظ ملاكمة/);
    assert.match(gloves.keywords, /قفازات ملاكمة/);
    assert.doesNotMatch(gloves.keywords, /جوانتي بوكس/);
    assert.match(shinGuards.title, /شنكار كيك بوكس ومواي تاي/);
    assert.match(shinGuards.keywords, /شنكار شراب/);
    assert.match(handWraps.title, /بنداج ملاكمة/);
    assert.match(headGuards.title, /هيد جارد/);
    assert.match(mouthGuards.title, /واقيات الفم/);

    const combinedCopy = [
      gloves.title,
      gloves.description,
      gloves.keywords,
      shinGuards.title,
      shinGuards.description,
      shinGuards.keywords,
      handWraps.title,
      handWraps.description,
      handWraps.keywords,
      headGuards.title,
      headGuards.description,
      headGuards.keywords,
      mouthGuards.title,
      mouthGuards.description,
      mouthGuards.keywords,
    ].join(" ");

    assert.doesNotMatch(combinedCopy, /جوانتي بوكس/);
    assert.ok(
      combinedCopy.length < 1400,
      "intent copy should stay concise, not become a keyword block",
    );
  });

  it("separates weak category SEO intents without speculative keyword rewrites", () => {
    const boxing = getCategorySeoIntent({ slug: "boxing", name: "Boxing" }, "ar");
    const boxingEn = getCategorySeoIntent({ slug: "boxing", name: "Boxing" }, "en");
    const gloves = getCategorySeoIntent({ slug: "gloves", name: "Gloves" }, "ar");
    const mouthGuards = getCategorySeoIntent(
      { slug: "mouth-guards", name: "Mouth Guards" },
      "ar",
    );
    const sportsEquipment = getCategorySeoIntent(
      { slug: "sports-equipment", name: "Sports Equipment" },
      "ar",
    );
    const sportsEquipmentEn = getCategorySeoIntent(
      { slug: "sports-equipment", name: "Sports Equipment" },
      "en",
    );
    const medicalProducts = getCategorySeoIntent(
      { slug: "medical-products", name: "Medical Products" },
      "ar",
    );
    const medicalProductsEn = getCategorySeoIntent(
      { slug: "medical-products", name: "Medical Products" },
      "en",
    );
    const shinGuards = getCategorySeoIntent(
      { slug: "shin-guards", name: "Shin Guards" },
      "ar",
    );
    const handWraps = getCategorySeoIntent(
      { slug: "hand-wraps", name: "Hand Wraps" },
      "ar",
    );

    assert.equal(gloves.title, "جلافز ملاكمة في مصر");
    assert.match(gloves.description, /قفازات ملاكمة/);
    assert.doesNotMatch(boxing.title, /جلافز|قفازات/);
    assert.match(boxing.title, /أدوات|معدات/);
    assert.match(boxing.description, /قفازات/);
    assert.doesNotMatch(boxingEn.title, /gloves/i);
    assert.match(boxingEn.description, /gloves/i);
    assert.match(mouthGuards.title, /ماوث جارد/);
    assert.match(mouthGuards.title, /واقيات الفم/);
    assert.match(mouthGuards.description, /ماوث جارد|واقي الفم/);
    assert.doesNotMatch(sportsEquipment.title, /جميع الأنشطة/);
    assert.doesNotMatch(sportsEquipment.description, /جميع احتياجاتك الرياضية/);
    assert.match(sportsEquipment.title, /رياضات القتال|التمرين/);
    assert.doesNotMatch(sportsEquipmentEn.title, /all activities/i);
    assert.doesNotMatch(sportsEquipmentEn.description, /all your athletic needs/i);
    assert.match(sportsEquipmentEn.title, /combat sports|training/i);
    assert.match(medicalProducts.title, /مستلزمات/);
    assert.match(medicalProducts.description, /إسعافات|تعافي|دعم/);
    assert.doesNotMatch(medicalProducts.description, /يعالج|علاج/);
    assert.match(medicalProductsEn.title, /first aid|recovery|support/i);
    assert.doesNotMatch(medicalProductsEn.description, /treats|cures|medical treatment/i);
    assert.equal(shinGuards.title, "شنكار كيك بوكس ومواي تاي في مصر");
    assert.equal(handWraps.title, "بنداج ملاكمة وبنداج بوكس");
    assert.equal(buildShopCategoryUrl("sports-equipment"), "/shop?category=sports-equipment");
    assert.equal(
      buildShopCategoryCanonicalUrl("https://viking.example", "medical-products"),
      "https://viking.example/shop?category=medical-products",
    );
  });

  it("builds product SEO from real product and category data without fake review data", () => {
    const product = {
      title: "Pro Gloves",
      slug: "pro-gloves",
      description: "",
      price: 1800,
      categories: { slug: "boxing", name: "Boxing" },
    };
    const english = buildProductSeoMeta(product, "en");
    const arabic = buildProductSeoMeta(product, "ar");
    const structuredData = buildProductStructuredData(
      product,
      "https://viking.example/shop/pro-gloves",
      {
        total: 0,
        average: 0,
      },
    );

    assert.match(english.title, /Boxing Gear & Training Equipment/);
    assert.match(arabic.title, /أدوات ومعدات الملاكمة/);
    assert.match(arabic.description, /أدوات ومعدات الملاكمة/);
    assert.match(buildProductImageAlt(product, "ar"), /Pro Gloves/);
    assert.deepEqual(structuredData.alternateName, [
      "أدوات ملاكمة",
      "معدات ملاكمة",
      "معدات بوكس",
      "أساسيات الملاكمة",
      "Boxing Gear",
      "Boxing Training Equipment",
    ]);
    assert.equal(structuredData.aggregateRating, undefined);
  });

  it("builds concise product meta descriptions without blindly appending category copy", () => {
    const describedProduct = {
      title: "Elite Boxing Gloves",
      slug: "elite-boxing-gloves",
      description:
        "  Premium gloves for daily rounds.\n\nBuilt for bag work and sparring.  ",
      categories: { slug: "boxing", name: "Boxing" },
    };
    const longProduct = {
      title: "Long Wraps",
      slug: "long-wraps",
      description: `${"Durable hand wraps for focused boxing training. ".repeat(7)}End.`,
      categories: { slug: "hand-wraps", name: "Hand Wraps" },
    };
    const missingDescription = {
      title: "Starter Head Guard",
      slug: "starter-head-guard",
      description: "",
      categories: { slug: "head-guards", name: "Head Guards" },
    };
    const missingCategory = {
      title: "Solo Training Strap",
      slug: "solo-training-strap",
      description: null,
    };
    const otherMissingDescription = {
      title: "Competition Mouth Guard",
      slug: "competition-mouth-guard",
      description: "",
      categories: { slug: "mouth-guards", name: "Mouth Guards" },
    };

    const described = buildProductSeoMeta(describedProduct, "en");
    const long = buildProductSeoMeta(longProduct, "en");
    const fallback = buildProductSeoMeta(missingDescription, "en");
    const fallbackWithoutCategory = buildProductSeoMeta(missingCategory, "en");
    const otherFallback = buildProductSeoMeta(otherMissingDescription, "en");
    const arabicFallback = buildProductSeoMeta(
      {
        title: "هيد جارد تدريب",
        slug: "training-head-guard",
        description: "",
        categories: { slug: "head-guards", name: "Head Guards" },
      },
      "ar",
    );

    assert.equal(
      described.description,
      "Premium gloves for daily rounds. Built for bag work and sparring.",
    );
    assert.doesNotMatch(described.description, /Shop boxing gear for training/);
    assert.match(fallback.description, /Starter Head Guard/);
    assert.match(fallback.description, /Head Guards|Boxing & Kickboxing Head Guards/);
    assert.notEqual(fallback.description, otherFallback.description);
    assert.match(fallbackWithoutCategory.description, /Solo Training Strap/);
    assert.match(fallbackWithoutCategory.description, /Viking Store/);
    assert.match(arabicFallback.description, /هيد جارد تدريب/);
    assert.match(arabicFallback.description, /Viking Store/);
    assert.ok(long.description.length <= 180);
    assert.doesNotMatch(long.description, /\s{2,}|<[^>]+>|\.\.\.$/);
    assert.match(described.title, /Elite Boxing Gloves \| Boxing Gear & Training Equipment/);
    assert.equal(
      buildCanonicalUrl("https://viking.example", "/shop/elite-boxing-gloves"),
      "https://viking.example/shop/elite-boxing-gloves",
    );
    assert.match(productPageSource, /description:\s*\(\) => productMetaDescription\.value/);
  });
});

describe("SEO route integration", () => {
  it("adds product SEO and keeps sitemap/robots server-driven", () => {
    assert.match(productPageSource, /buildProductStructuredData/);
    assert.match(productPageSource, /useSeoMeta/);
    assert.match(productPageSource, /setResponseStatus\(404\)/);
    assert.match(sitemapSource, /\.from\("products"\)/);
    assert.match(sitemapSource, /\.from\("categories"\)/);
    assert.match(sitemapSource, /buildShopCategoryCanonicalUrl/);
    assert.match(sitemapSource, /\.from\("blog_posts"\)/);
    assert.doesNotMatch(sitemapSource, /\/admin/);
    assert.match(robotsSource, /buildRobotsTxt/);
  });

  it("keeps Arabic and English SEO independent and strengthens real internal links", () => {
    assert.match(enLocaleSource, /Egypt/);
    assert.match(arLocaleSource, /أدوات رياضية/);
    assert.match(arLocaleSource, /قفازات ملاكمة/);
    assert.doesNotMatch(enLocaleSource, /قفازات|ادوات سندا|كونغ فو/);
    assert.match(homeHeroSource, /to="\/shop"/);
    assert.match(homeHeroSource, /to="\/categories"/);
    assert.match(homeCategoriesSource, /buildShopCategoryUrl\(category\.slug\)/);
    assert.match(shopPageSource, /buildCategorySeo/);
    assert.match(productPageSource, /buildProductSeoMeta/);
    assert.match(productPageSource, /buildShopCategoryUrl/);
    assert.match(blogDetailSource, /blogCategoryShopUrl/);
  });

  it("adds Egypt-focused social metadata without stale logo references", () => {
    const organization = buildOrganizationStructuredData("https://viking.example");
    const website = buildWebsiteStructuredData("https://viking.example");

    assert.equal(SEO_DEFAULT_IMAGE, "/logo.png");
    assert.equal(organization.logo, "https://viking.example/logo.png");
    assert.match(organization.description, /فايكنج ستور/);
    assert.match(organization.description, /boxing gloves/i);
    assert.deepEqual(organization.alternateName, [
      "فايكنج ستور",
      "فايكنج استور",
      "Viking Store Egypt",
    ]);
    assert.deepEqual(website.alternateName, [
      "فايكنج ستور",
      "فايكنج استور",
      "Viking Store Egypt",
    ]);
    assert.deepEqual(organization.sameAs, [
      "https://www.facebook.com/profile.php?id=100025354200512",
      "https://www.instagram.com/vikingclubstore/",
      "https://www.tiktok.com/@the_vikings22",
    ]);
    assert.match(appSource, /ogImage/);
    assert.match(appSource, /twitterImage/);
    assert.doesNotMatch(appSource, /old-logo|logo-old|viking-logo/i);
    assert.doesNotMatch(enLocaleSource, /old-logo|logo-old|viking-logo/i);
    assert.doesNotMatch(arLocaleSource, /old-logo|logo-old|viking-logo/i);
  });

  it("targets Arabic Egypt combat-sports search intent naturally", () => {
    assert.match(arLocaleSource, /فايكنج ستور/);
    assert.match(arLocaleSource, /فايكنج استور/);
    assert.match(arLocaleSource, /مستلزمات الألعاب القتالية/);
    assert.match(arLocaleSource, /قفازات ملاكمة/);
    assert.match(arLocaleSource, /قفازات MMA/);
    assert.match(arLocaleSource, /واقي رأس/);
    assert.match(arLocaleSource, /واقي أسنان/);
    assert.match(arLocaleSource, /بنداج/);
    assert.match(arLocaleSource, /ساندا/);
    assert.match(arLocaleSource, /كونغ فو/);
  });
});
