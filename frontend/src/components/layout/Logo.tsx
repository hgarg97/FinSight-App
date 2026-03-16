import logoIcon from '../../assets/logo-icon.png'

interface LogoProps {
  size?: number
}

export default function Logo({ size = 24 }: LogoProps) {
  return (
    <img
      src={logoIcon}
      alt="FinSight"
      width={size}
      height={size}
      style={{ objectFit: 'contain' }}
    />
  )
}
