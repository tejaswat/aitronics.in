'use client'

type Props = { error: Error; reset: () => void }

export default function GlobalError({ error, reset }: Props) {
  return (
    <html>
      <body>
        <main style={{ padding: 24 }}>
          <h2>Something went wrong</h2>
          <p>{error.message}</p>
          <button className="button primary" onClick={reset}>Try again</button>
        </main>
      </body>
    </html>
  )
}
