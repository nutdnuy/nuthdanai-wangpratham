// Static export for GitHub Pages; the page is embedded on www.quant-corner.com.
const basePath = "/nuthdanai-wangpratham";

export default {
  output: "export",
  basePath,
  trailingSlash: true,
  images: { unoptimized: true },
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
};
