export function formatAddress(address?: string, show = 10): string {
  if (!address) {
    return ''
  }

  const half = Math.floor(show * 0.5)
  const len = address.length
  if (len <= show) {
    return address
  }

  return address.substring(0, half) + '...' + address.substring(len - half)
}