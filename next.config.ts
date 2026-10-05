import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: process.env.BMI_BUILD_TARGET === "pages" ? "export" : undefined,
  reactStrictMode: true,
  poweredByHeader: false,
  experimental: {
    // ESLint 的型別解析器仍需 TypeScript 6 的 JavaScript API。
    useTypeScriptCli: false,
  },
};

export default nextConfig;
