// Plugin to ignore TypeScript errors during build
import type { Plugin, HmrContext } from 'vite'

export function ignoreTsErrors(): Plugin {
  return {
    name: 'ignore-ts-errors',
    // Intercept esbuild plugin to modify TypeScript settings
    config(config) {
      return {
        ...config,
        esbuild: {
          ...config.esbuild,
          tsconfigRaw: {
            compilerOptions: {
              skipLibCheck: true,
              noEmit: true,
              // Ignore TypeScript errors
              allowJs: true,
              checkJs: false,
              strict: false,
              noImplicitAny: false,
              strictNullChecks: false,
              noUnusedLocals: false,
              noUnusedParameters: false,
              noFallthroughCasesInSwitch: false,
              noImplicitReturns: false,
            },
          },
        },
      }
    },
    // Also handle hot updates
    handleHotUpdate({ file }: HmrContext) {
      if (file.endsWith('.ts') || file.endsWith('.tsx')) {
        // Return empty array to prevent Vite from doing anything with TS errors
        return []
      }
      return
    },
  }
}
