import Link from "next/link"
import { Leaf } from "lucide-react"
import { Card } from "@/components/ui/card"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-muted/30 p-4">
      <Link href="/" className="flex items-center gap-2 mb-8">
        <Leaf className="h-6 w-6 text-green-600" />
        <span className="font-bold text-xl">EcoWatch</span>
      </Link>
      
      <Card className="w-full max-w-md">
        {children}
      </Card>
    </div>
  )
}
