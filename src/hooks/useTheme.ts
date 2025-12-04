
import { useState, useEffect } from 'react'

export type ThemeColor = 'purple' | 'pink' | 'blue' | 'green' | 'red' | 'brown' | 'terracotta' | 'gold'

export const useTheme = () => {
  const [theme, setTheme] = useState<ThemeColor>(() => {
    const saved = localStorage.getItem('glowup-theme')
    return (saved as ThemeColor) || 'brown'
  })

  useEffect(() => {
    localStorage.setItem('glowup-theme', theme)
    
    // Remove classes de tema anteriores
    document.documentElement.classList.remove(
      'theme-purple', 'theme-pink', 'theme-blue', 'theme-green', 'theme-red', 'theme-brown', 'theme-terracotta', 'theme-gold'
    )
    
    // Adiciona a nova classe de tema
    document.documentElement.classList.add(`theme-${theme}`)
  }, [theme])

  const getThemeColors = (color: ThemeColor) => {
    const themes = {
      brown: {
        primary: 'bg-[#8e413a] hover:bg-[#7a3730]',
        primaryText: 'text-[#8e413a]',
        primaryBg: 'bg-[#ffe4d8]',
        gradient: 'from-[#8e413a] via-[#aa6a62] to-[#e3bbb1]',
        secondary: 'bg-[#e3bbb1] hover:bg-[#d4aca4]',
        secondaryText: 'text-[#8e413a]'
      },
      purple: {
        primary: 'bg-[#8e413a] hover:bg-[#7a3730]',
        primaryText: 'text-[#8e413a]',
        primaryBg: 'bg-[#ffe4d8]',
        gradient: 'from-[#8e413a] via-[#aa6a62] to-[#e3bbb1]',
        secondary: 'bg-[#e3bbb1] hover:bg-[#d4aca4]',
        secondaryText: 'text-[#8e413a]'
      },
      pink: {
        primary: 'bg-[#8e413a] hover:bg-[#7a3730]',
        primaryText: 'text-[#8e413a]',
        primaryBg: 'bg-[#ffe4d8]',
        gradient: 'from-[#8e413a] via-[#aa6a62] to-[#e3bbb1]',
        secondary: 'bg-[#e3bbb1] hover:bg-[#d4aca4]',
        secondaryText: 'text-[#8e413a]'
      },
      blue: {
        primary: 'bg-[#8e413a] hover:bg-[#7a3730]',
        primaryText: 'text-[#8e413a]',
        primaryBg: 'bg-[#ffe4d8]',
        gradient: 'from-[#8e413a] via-[#aa6a62] to-[#e3bbb1]',
        secondary: 'bg-[#e3bbb1] hover:bg-[#d4aca4]',
        secondaryText: 'text-[#8e413a]'
      },
      green: {
        primary: 'bg-[#8e413a] hover:bg-[#7a3730]',
        primaryText: 'text-[#8e413a]',
        primaryBg: 'bg-[#ffe4d8]',
        gradient: 'from-[#8e413a] via-[#aa6a62] to-[#e3bbb1]',
        secondary: 'bg-[#e3bbb1] hover:bg-[#d4aca4]',
        secondaryText: 'text-[#8e413a]'
      },
      red: {
        primary: 'bg-[#8e413a] hover:bg-[#7a3730]',
        primaryText: 'text-[#8e413a]',
        primaryBg: 'bg-[#ffe4d8]',
        gradient: 'from-[#8e413a] via-[#aa6a62] to-[#e3bbb1]',
        secondary: 'bg-[#e3bbb1] hover:bg-[#d4aca4]',
        secondaryText: 'text-[#8e413a]'
      },
      terracotta: {
        primary: 'bg-[#8e413a] hover:bg-[#7a3730]',
        primaryText: 'text-[#8e413a]',
        primaryBg: 'bg-[#ffe4d8]',
        gradient: 'from-[#8e413a] via-[#aa6a62] to-[#e3bbb1]',
        secondary: 'bg-[#e3bbb1] hover:bg-[#d4aca4]',
        secondaryText: 'text-[#8e413a]'
      },
      gold: {
        primary: 'bg-[#bfa866] hover:bg-[#a89357]',
        primaryText: 'text-[#bfa866]',
        primaryBg: 'bg-[#ffffce]',
        gradient: 'from-[#bfa866] via-[#cfbe80] to-[#dfd49a]',
        secondary: 'bg-[#efe9b4] hover:bg-[#e5dfa8]',
        secondaryText: 'text-[#bfa866]'
      }
    }
    return themes[color]
  }

  return {
    theme,
    setTheme,
    colors: getThemeColors(theme)
  }
}
