import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

import {
  IMAGE_WEBP_QUALITY,
  getOptimizedImageName,
  optimizeImage,
  shouldOptimizeImage,
} from "../utils/imageOptimizer.ts";

const productAdmin = readFileSync("pages/admin/products.vue", "utf8");
const categoryAdmin = readFileSync("pages/admin/categories.vue", "utf8");
const blogPostForm = readFileSync("components/shared/BlogPostForm.vue", "utf8");

const createMockEnvironment = () => {
  const calls = {
    bitmapClosed: false,
    drawCount: 0,
    fileName: "",
    inputFileName: "",
    quality: 0,
    type: "",
    width: 0,
    height: 0,
  };

  return {
    calls,
    environment: {
      createImageBitmap: async (file) => {
        calls.inputFileName = file.name;
        return {
          width: 3000,
          height: 2000,
          close: () => {
            calls.bitmapClosed = true;
          },
        };
      },
      createCanvas: (width, height) => {
        calls.width = width;
        calls.height = height;
        return {
          drawImage: () => {
            calls.drawCount += 1;
          },
          toBlob: async (type, quality) => {
            calls.type = type;
            calls.quality = quality;
            return new Blob(["webp"], { type });
          },
        };
      },
      fileConstructor: class extends File {
        constructor(parts, name, options) {
          calls.fileName = name;
          super(parts, name, options);
        }
      },
    },
  };
};

describe("product image optimizer", () => {
  it("converts PNG/JPEG product images to high-quality WebP without resizing", async () => {
    const { calls, environment } = createMockEnvironment();
    const file = new File(["png"], "Fairtex-BGV1.png", { type: "image/png" });

    const optimized = await optimizeImage(file, environment);

    assert.equal(shouldOptimizeImage(file), true);
    assert.equal(optimized.type, "image/webp");
    assert.equal(optimized.name, "Fairtex-BGV1.webp");
    assert.equal(calls.fileName, "Fairtex-BGV1.webp");
    assert.equal(calls.inputFileName, "Fairtex-BGV1.png");
    assert.equal(calls.type, "image/webp");
    assert.equal(calls.quality, IMAGE_WEBP_QUALITY);
    assert.equal(calls.width, 3000);
    assert.equal(calls.height, 2000);
    assert.equal(calls.drawCount, 1);
    assert.equal(calls.bitmapClosed, true);
  });

  it("keeps already-WebP files unchanged and avoids recompression", async () => {
    const file = new File(["webp"], "gloves.webp", { type: "image/webp" });

    const optimized = await optimizeImage(file, {
      createImageBitmap: async () => {
        throw new Error("should not decode WebP again");
      },
    });

    assert.equal(optimized, file);
    assert.equal(shouldOptimizeImage(file), false);
  });

  it("normalizes output filenames without appending duplicate extensions", () => {
    assert.equal(getOptimizedImageName("Fairtex-BGV1.jpeg"), "Fairtex-BGV1.webp");
    assert.equal(getOptimizedImageName("RDX.wrap.PNG"), "RDX.wrap.webp");
    assert.equal(getOptimizedImageName("image"), "image.webp");
  });

  it("rejects unsupported image formats instead of uploading corrupt output", async () => {
    const file = new File(["gif"], "animated.gif", { type: "image/gif" });

    await assert.rejects(() => optimizeImage(file), /Unsupported image type/);
  });

  it("keeps product uploads on the shared selection-time optimizer", () => {
    assert.match(productAdmin, /import\s+{[\s\S]*optimizeImage[\s\S]*}\s+from\s+"..\/..\/utils\/imageOptimizer"/);
    assert.match(productAdmin, /const selectImages = async \(colorIndex: number, event: Event\)/);
    assert.match(productAdmin, /const optimizedFile = await optimizeImage\(file\)/);
    assert.match(productAdmin, /file:\s*optimizedFile/);
    assert.match(productAdmin, /preview:\s*URL\.createObjectURL\(optimizedFile\)/);
    assert.match(productAdmin, /const imageOptimizing = ref\(false\)/);
    assert.match(productAdmin, /:disabled="saving \|\| imageOptimizing"/);
    assert.match(productAdmin, /:disabled="imageOptimizing \|\| saving"/);

    const uploadVariantImages = productAdmin.match(/const uploadVariantImages = async \(\) => \{[\s\S]*?^};/m)?.[0] || "";
    const saveColorsAndImages = productAdmin.match(/const saveColorsAndImages = async \(productId: number\) => \{[\s\S]*?^};/m)?.[0] || "";
    assert.doesNotMatch(uploadVariantImages, /optimizeImage/);
    assert.doesNotMatch(saveColorsAndImages, /optimizeImage/);
  });

  it("keeps existing remote images as URL-only records without local files", () => {
    assert.match(productAdmin, /image_url:\s*image\.image_url,\s*\r?\n\s*preview:\s*image\.image_url,/);
    assert.doesNotMatch(productAdmin, /image_url:\s*image\.image_url,\s*\r?\n\s*file:/);
  });

  it("optimizes new category images once before category save uploads", () => {
    assert.match(categoryAdmin, /import\s+{[\s\S]*optimizeImage[\s\S]*}\s+from\s+"..\/..\/utils\/imageOptimizer"/);
    assert.match(categoryAdmin, /const selectCategoryImage = async \(event: Event\)/);
    assert.match(categoryAdmin, /const optimizedFile = await optimizeImage\(file\)/);
    assert.match(categoryAdmin, /categoryImageFile\.value = optimizedFile/);
    assert.match(categoryAdmin, /categoryImagePreview\.value = URL\.createObjectURL\(optimizedFile\)/);
    assert.match(categoryAdmin, /const uploadCategoryImage = async \(\)/);

    const uploadCategoryImage = categoryAdmin.match(/const uploadCategoryImage = async \(\) => \{[\s\S]*?^};/m)?.[0] || "";
    assert.doesNotMatch(uploadCategoryImage, /optimizeImage/);
  });

  it("optimizes new blog cover and OG images once before post save uploads", () => {
    assert.match(blogPostForm, /import\s+{[\s\S]*optimizeImage[\s\S]*}\s+from\s+"..\/..\/utils\/imageOptimizer"/);
    assert.match(blogPostForm, /const selectImage = async \(event: Event, target: BlogImageTarget\)/);
    assert.match(blogPostForm, /const optimizedFile = await optimizeImage\(file\)/);
    assert.match(blogPostForm, /pendingImageFiles\.value\[target\] = optimizedFile/);
    assert.match(blogPostForm, /localImagePreviews\.value\[target\] = URL\.createObjectURL\(optimizedFile\)/);
    assert.match(blogPostForm, /const uploadPendingImage = async \(target: BlogImageTarget, uploadedPaths: string\[\]\)/);

    const uploadPendingImage = blogPostForm.match(/const uploadPendingImage = async \(target: BlogImageTarget, uploadedPaths: string\[\]\) => \{[\s\S]*?^};/m)?.[0] || "";
    assert.doesNotMatch(uploadPendingImage, /optimizeImage/);
  });

  it("keeps existing category and blog remote images as URL-only values", () => {
    assert.match(categoryAdmin, /form\.value = \{\s*\r?\n\s*name: category\.name,\s*\r?\n\s*slug: category\.slug,\s*\r?\n\s*image: category\.image \|\| "",/);
    assert.doesNotMatch(categoryAdmin, /openEdit[\s\S]{0,260}categoryImageFile\.value =/);
    assert.match(blogPostForm, /cover_image: props\.post\?\.cover_image \|\| "",/);
    assert.match(blogPostForm, /og_image: props\.post\?\.og_image \|\| "",/);
    assert.doesNotMatch(blogPostForm, /props\.post\?\.cover_image[\s\S]{0,220}pendingImageFiles/);
  });
});
