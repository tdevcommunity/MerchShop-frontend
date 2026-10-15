/**
 * Preparation des images avant envoi.
 *
 * Le back-office envoie des photos produit telles quelles a l'API, qui plafonne
 * a 20 Mo (`image` / `max:20480`). Une photo prise au telephone pese souvent
 * plus, et une image refusee par le serveur ne se decouvre qu'apres l'attente de
 * l'upload — au guichet, un aller-retour de plusieurs minutes pour un refus.
 *
 * La validation et la reduction se font donc ici, dans le navigateur : on
 * refuse tot ce que l'API refuserait (format, poids), et on retrecit le reste
 * pour que l'envoi tienne dans le budget reseau. Le serveur garde ses propres
 * regles — la validation cote client est un confort, pas une frontiere de
 * securite.
 */

/** Formats que l'API accepte (`image`) et que le navigateur sait decoder. */
export const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
] as const;

/** La liste des formats declares que l'on presente au refus. */
export const ACCEPTED_IMAGE_FORMATS_LABEL = "JPEG, PNG ou WebP";

/** Valeur de l'attribut `accept` d'un champ fichier image. */
export const ACCEPTED_IMAGE_ACCEPT =
  "image/jpeg,image/png,image/webp,image/heic,image/heif";

/**
 * Poids au-dela duquel on refuse sans meme essayer de decoder.
 *
 * Au-dessus, `createImageBitmap` peut saturer la memoire d'un telephone
 * d'entree de gamme avant d'avoir rendu une seule miniature ; mieux vaut un
 * message clair qu'un onglet qui se fige.
 */
export const MAX_SOURCE_IMAGE_BYTES = 25 * 1024 * 1024;

/**
 * Poids vise apres reduction.
 *
 * Choisi pour rester sous le plafond de l'API avec une marge, tout en gardant
 * une qualite suffisante pour une photo produit. Cloudinary conserve de toute
 * facon l'original envoye ; viser plus gros ne gagnerait rien a l'affichage.
 */
export const TARGET_IMAGE_BYTES = 2.5 * 1024 * 1024;

/** Cote maximal, en pixels. Au-dela, la photo ne sert plus a rien a l'ecran. */
export const MAX_IMAGE_DIMENSION = 2000;

const START_QUALITY = 0.82;
const MIN_QUALITY = 0.5;

/** Erreur de validation d'image, porteuse d'un message affichable tel quel. */
export class ImageValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ImageValidationError";
  }
}

export function isAcceptedImageType(type: string): boolean {
  return (ACCEPTED_IMAGE_TYPES as readonly string[]).includes(
    type.toLowerCase(),
  );
}

/**
 * Formats qu'on peut transmettre tels quels sans re-encodage.
 *
 * HEIC/HEIF en sont exclus : l'API ne les accepte pas, donc meme une photo
 * legere doit etre convertie avant de partir. Les autres sont deja des formats
 * que le serveur stocke et sert.
 */
function canPassThrough(type: string): boolean {
  return ["image/jpeg", "image/jpg", "image/png", "image/webp"].includes(
    type.toLowerCase(),
  );
}

/**
 * Refuse tot une image que l'API refuserait.
 *
 * Le type est lu sur `file.type` et non sur l'extension : une photo renommee ne
 * doit pas passer, et une extension absente ne doit pas bloquer une image
 * valide. Le poids est verifie ensuite, parce qu'un fichier enorme se lit avant
 * de se decoder.
 */
export function validateImageFile(file: File): void {
  if (!isAcceptedImageType(file.type)) {
    throw new ImageValidationError(
      `Ce format n'est pas accepté. Choisis une image ${ACCEPTED_IMAGE_FORMATS_LABEL}.`,
    );
  }
  if (file.size === 0) {
    throw new ImageValidationError("Cette image est vide.");
  }
  if (file.size > MAX_SOURCE_IMAGE_BYTES) {
    throw new ImageValidationError(
      "Cette image est trop lourde (25 Mo maximum). Choisis une photo plus légère.",
    );
  }
}

type DecodedImage = {
  source: CanvasImageSource;
  width: number;
  height: number;
  release: () => void;
};

/**
 * Decode une image, orientation EXIF comprise.
 *
 * `createImageBitmap` applique l'orientation « from-image » la ou le navigateur
 * le sait : une photo prise en portrait ne ressort donc pas couchee apres
 * passage au canvas. Il n'existe pas partout, d'ou le repli sur `Image`.
 */
async function decodeImage(file: File): Promise<DecodedImage> {
  if (typeof createImageBitmap === "function") {
    try {
      const bitmap = await createImageBitmap(file, {
        imageOrientation: "from-image",
      });
      return {
        source: bitmap,
        width: bitmap.width,
        height: bitmap.height,
        release: () => bitmap.close(),
      };
    } catch {
      // Options non supportees ou format non decodable : on tente le repli.
    }
  }

  return decodeWithImageElement(file);
}

function decodeWithImageElement(file: File): Promise<DecodedImage> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () =>
      resolve({
        source: image,
        width: image.naturalWidth,
        height: image.naturalHeight,
        release: () => URL.revokeObjectURL(url),
      });
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(
        new ImageValidationError(
          `Cette image n'a pas pu être lue. Essaie un fichier ${ACCEPTED_IMAGE_FORMATS_LABEL}.`,
        ),
      );
    };
    image.src = url;
  });
}

function fitWithin(
  width: number,
  height: number,
  max: number,
): { width: number; height: number } {
  const longest = Math.max(width, height);
  if (longest <= max) {
    return { width, height };
  }
  const ratio = max / longest;
  return {
    width: Math.max(1, Math.round(width * ratio)),
    height: Math.max(1, Math.round(height * ratio)),
  };
}

let webpSupport: boolean | null = null;

function supportsWebp(): boolean {
  if (webpSupport !== null) {
    return webpSupport;
  }
  try {
    const canvas = document.createElement("canvas");
    canvas.width = 1;
    canvas.height = 1;
    webpSupport = canvas.toDataURL("image/webp").startsWith("data:image/webp");
  } catch {
    webpSupport = false;
  }
  return webpSupport;
}

function drawToCanvas(
  source: CanvasImageSource,
  width: number,
  height: number,
): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) {
    throw new ImageValidationError(
      "Ce navigateur ne peut pas préparer cette image.",
    );
  }
  context.drawImage(source, 0, 0, width, height);
  return canvas;
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality: number,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(
            new ImageValidationError("Cette image n'a pas pu être préparée."),
          );
        }
      },
      type,
      quality,
    );
  });
}

function withImageExtension(name: string, type: string): string {
  const base = name.replace(/\.[^./\\]+$/, "") || "image";
  const extension = type === "image/webp" ? "webp" : "jpg";
  return `${base}.${extension}`;
}

/**
 * Valide puis retrecit une image pour l'envoi.
 *
 * Une image deja legere, assez petite, et dans un format que l'API sert tel
 * quel, est rendue inchangee : la re-encoder ne ferait que perdre en qualite
 * sans rien gagner. Les autres sont redimensionnees sous `MAX_IMAGE_DIMENSION`,
 * puis compressees par paliers jusqu'a tomber sous `TARGET_IMAGE_BYTES` —
 * d'abord en baissant la qualite, ensuite en reduisant encore les dimensions si
 * cela ne suffit pas.
 */
export async function prepareImageForUpload(file: File): Promise<File> {
  validateImageFile(file);

  const decoded = await decodeImage(file);
  try {
    const fitted = fitWithin(
      decoded.width,
      decoded.height,
      MAX_IMAGE_DIMENSION,
    );

    if (
      canPassThrough(file.type) &&
      fitted.width === decoded.width &&
      fitted.height === decoded.height &&
      file.size <= TARGET_IMAGE_BYTES
    ) {
      return file;
    }

    const outputType = supportsWebp() ? "image/webp" : "image/jpeg";

    let width = fitted.width;
    let height = fitted.height;
    let quality = START_QUALITY;
    let blob: Blob | null = null;

    for (let attempt = 0; attempt < 6; attempt += 1) {
      const canvas = drawToCanvas(decoded.source, width, height);
      blob = await canvasToBlob(canvas, outputType, quality);

      if (blob.size <= TARGET_IMAGE_BYTES) {
        break;
      }
      if (quality > MIN_QUALITY) {
        quality = Math.max(MIN_QUALITY, quality - 0.12);
      } else {
        width = Math.max(1, Math.round(width * 0.8));
        height = Math.max(1, Math.round(height * 0.8));
      }
    }

    if (!blob) {
      throw new ImageValidationError("Cette image n'a pas pu être préparée.");
    }

    return new File([blob], withImageExtension(file.name, outputType), {
      type: outputType,
      lastModified: Date.now(),
    });
  } finally {
    decoded.release();
  }
}

/** Lit un fichier en data URL, pour la previsualisation avant envoi. */
export function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
      } else {
        reject(new ImageValidationError("Lecture de l'image impossible."));
      }
    };
    reader.onerror = () =>
      reject(new ImageValidationError("Lecture de l'image impossible."));
    reader.readAsDataURL(file);
  });
}
