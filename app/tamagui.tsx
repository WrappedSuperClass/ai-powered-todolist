import React from 'react'
import { TamaguiProvider } from 'tamagui'
import config from '../../tamagui.config'

export default function TamaguiProviderWrapper({ children }: { children: React.ReactNode }) {
  return <TamaguiProvider config={config.default as any}>{children}</TamaguiProvider>
}