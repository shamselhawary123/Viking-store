export const IMAGE_WEBP_TYPE = "image/webp";
export const IMAGE_WEBP_QUALITY = 0.9;

type DecodedImageSource = {
  width: number;
  height: number;
  close?: () => void;
};

type OptimizerCanvas = {
  drawImage: (image: DecodedImageSource) => void;
  toBlob: (type: string, quality: number) => Promise<Blob>;
};

export type ImageOptimizerEnvironment = {
  createImageBitmap?: (file: File) => Promise<DecodedImageSource>;
  createCanvas?: (width: number, height: number) => OptimizerCanvas;
  fileConstructor?: typeof File;
};

const convertibleImageTypes = new Set(["image/png", "image/jpeg", "image/jpg"]);

const normalizeImageType = (type: string) => type.toLowerCase().split(";")[0].trim();

export const shouldOptimizeImage = (file: File) =>
  convertibleImageTypes.has(normalizeImageType(file.type));

export const getOptimizedImageName = (fileName: string) => {
  const trimmed = fileName.trim();
  const withoutExtension = trimmed.replace(/\.[^./\\]+$/, "") || "image";
  return `${withoutExtension}.webp`;
};

const isWebP = (file: File) => normalizeImageType(file.type) === IMAGE_WEBP_TYPE;

const createBrowserCanvas = (width: number, height: number): OptimizerCanvas => {
  if (typeof OffscreenCanvas !== "undefined") {
    const canvas = new OffscreenCanvas(width, height);
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Image optimization is not supported in this browser.");

    return {
      drawImage: (image) => context.drawImage(image as CanvasImageSource, 0, 0),
      toBlob: (type, quality) => canvas.convertToBlob({ type, quality }),
    };
  }

  if (typeof document === "undefined") {
    throw new Error("Image optimization is not available outside the browser.");
  }

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Image optimization is not supported in this browser.");

  return {
    drawImage: (image) => context.drawImage(image as CanvasImageSource, 0, 0),
    toBlob: (type, quality) =>
      new Promise((resolve, reject) => {
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
              return;
            }
            reject(new Error("Image optimization failed."));
          },
          type,
          quality,
        );
      }),
  };
};

const decodeWithImageElement = (file: File): Promise<DecodedImageSource> => {
  if (typeof document === "undefined" || typeof Image === "undefined" || typeof URL === "undefined") {
    throw new Error("Image optimization is not supported in this browser.");
  }

  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Image optimization failed."));
    };
    image.src = objectUrl;
  });
};

const decodeImage = async (
  file: File,
  environment: ImageOptimizerEnvironment,
): Promise<DecodedImageSource> => {
  const createBitmap = environment.createImageBitmap || globalThis.createImageBitmap;
  if (createBitmap) {
    return createBitmap(file);
  }

  return decodeWithImageElement(file);
};

export const optimizeImage = async (
  file: File,
  environment: ImageOptimizerEnvironment = {},
): Promise<File> => {
  if (isWebP(file)) return file;

  if (!shouldOptimizeImage(file)) {
    throw new Error("Unsupported image type.");
  }

  const image = await decodeImage(file, environment);
  try {
    const canvas = environment.createCanvas
      ? environment.createCanvas(image.width, image.height)
      : createBrowserCanvas(image.width, image.height);
    canvas.drawImage(image);
    const blob = await canvas.toBlob(IMAGE_WEBP_TYPE, IMAGE_WEBP_QUALITY);
    const FileConstructor = environment.fileConstructor || File;

    return new FileConstructor([blob], getOptimizedImageName(file.name), {
      type: IMAGE_WEBP_TYPE,
      lastModified: Date.now(),
    });
  } finally {
    image.close?.();
  }
};
