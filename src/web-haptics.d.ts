declare module 'web-haptics/svelte' {
    export interface WebHapticsInstance {
      trigger(preset?: 'success' | 'warning' | 'error' | 'light' | 'medium' | 'heavy' | 'selection'): void
      cancel(): void
      destroy(): void
      setDebug(enabled: boolean): void
    }
    export function createWebHaptics(): WebHapticsInstance
  }
  
  declare module 'web-haptics/react' {
    export interface WebHapticsInstance {
      trigger(preset?: 'success' | 'warning' | 'error' | 'light' | 'medium' | 'heavy' | 'selection'): void
      cancel(): void
      destroy(): void
      setDebug(enabled: boolean): void
    }
    export function useWebHaptics(): WebHapticsInstance
  }
  
  declare module 'web-haptics/vue' {
    export interface WebHapticsInstance {
      trigger(preset?: 'success' | 'warning' | 'error' | 'light' | 'medium' | 'heavy' | 'selection'): void
      cancel(): void
      destroy(): void
      setDebug(enabled: boolean): void
    }
    export function useWebHaptics(): WebHapticsInstance
  }
  
  declare module 'web-haptics' {
    export class WebHaptics {
      static isSupported: boolean
      trigger(preset?: 'success' | 'warning' | 'error' | 'light' | 'medium' | 'heavy' | 'selection'): void
      cancel(): void
      destroy(): void
      setDebug(enabled: boolean): void
    }
  }