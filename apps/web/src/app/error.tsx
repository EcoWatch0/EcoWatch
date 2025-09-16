"use client"

export default function GlobalError({ error }: { error: Error & { digest?: string } }) {
  return (
    <html>
      <body>
        <div className="container mx-auto py-20 px-4">
          <h2 className="text-2xl font-bold mb-2">Une erreur est survenue</h2>
          <p className="text-muted-foreground">{error.message}</p>
        </div>
      </body>
    </html>
  )
}

