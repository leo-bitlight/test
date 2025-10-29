import { Toaster } from "sonner"

export default function Toast() {
  return (
    <Toaster
      expand={true}
      // duration={300000}
      toastOptions={{
        style: {
          border: 0
        },
      }}
    />
  )
}