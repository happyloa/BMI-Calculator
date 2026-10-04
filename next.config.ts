import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  experimental: {
    // ESLint 的型別解析器仍需 TypeScript 6 的 JavaScript API。
    useTypeScriptCli: false,
  },
};

export default nextConfig;
