export const loadModule = async () => {
  if (process.env["IS_BUILD"]) {
    return await import("../dist/src/index.js");
  }
  return await import("../src/index.ts");
};
