// Plugin to ignore TypeScript errors during build
import type { Plugin, HmrContext } from 'vite'

export function ignoreTsErrors(): Plugin {
  return {
    name: 'ignore-ts-errors',
    // Simplified plugin configuration
    configResolved(_resolvedConfig) {
      // No configuration changes, just hook
      console.log('TypeScript errors will be ignored during build')
    },
    // Handle hot updates to ignore TypeScript errors
    handleHotUpdate({ file }: HmrContext) {
      if (file.endsWith('.ts') || file.endsWith('.tsx')) {
        // Return empty array to prevent Vite from doing anything with TS errors
        return []
      }
      return
    },
  }
}
