import { createRequire } from "node:module";
import { spawnSync } from "node:child_process";

const require = createRequire(import.meta.url);
const result = spawnSync(process.execPath, [require.resolve("next/dist/bin/next"), "build"], {
  env: { ...process.env, BMI_BUILD_TARGET: "pages" },
  stdio: "inherit",
});

if (result.error) throw result.error;
process.exit(result.status ?? 1);
