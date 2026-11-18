import { ImageResponse } from 'next/og'
import { BRAND } from '@/components/brand/logo'

export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

// Same monogram tile as LogoMark (dark tone), drawn with plain hex colors.
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0F2A4A',
        }}
      >
        <div
          style={{
            width: 120,
            height: 120,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#F2A23A',
            borderTopLeftRadius: 45,
            borderBottomRightRadius: 45,
            color: '#0F2A4A',
            fontSize: 72,
            fontWeight: 700,
          }}
        >
          {BRAND.initial}
        </div>
      </div>
    ),
    size,
  )
}
