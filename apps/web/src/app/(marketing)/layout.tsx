import { Header } from "@/components/layout/header"

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-12">
        {children}
      </main>
      <footer className="border-t py-6 text-center text-sm text-muted-foreground">
        <div className="container mx-auto">
          EcoWatch © {new Date().getFullYear()} - Solution de surveillance environnementale
        </div>
      </footer>
    </div>
  )
}
