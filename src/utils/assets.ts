import { withBase } from "./paths";

export function resolveAssetUrl(assetUrl: string) {
  return /^https?:\/\//i.test(assetUrl) ? assetUrl : withBase(assetUrl);
}

