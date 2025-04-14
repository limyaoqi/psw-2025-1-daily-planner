"use client"

import { useEffect, useState } from "react"
import { Quote } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

interface QuoteData {
  content: string
  author: string
}

export function QuoteOfTheDay() {
  const [quote, setQuote] = useState<QuoteData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    const fetchQuote = async () => {
      try {
        // Check if we have a cached quote for today
        const today = new Date().toDateString()
        const cachedQuote = localStorage.getItem(`quote-${today}`)

        if (cachedQuote) {
          setQuote(JSON.parse(cachedQuote))
          setLoading(false)
          return
        }
        console.log("hi")
        // Fetch a new quote if no cached quote exists
        // const response = await fetch("https://api.quotable.io/random")
        const response = await fetch("https://dummyjson.com/quotes/random")
        // const response = await fetch("/api/quote");
        console.log(response)
        if (!response.ok) throw new Error("Failed to fetch quote")

        const data = await response.json()
        const quoteData = {
          content: data.quote,
          author: data.author,
        }

        // Cache the quote with today's date
        localStorage.setItem(`quote-${today}`, JSON.stringify(quoteData))
        setQuote(quoteData)
      } catch (err) {
        console.error("Error fetching quote:", err)
        setError(true)
      } finally {
        setLoading(false)
      }
    }

    fetchQuote()
  }, [])

  if (loading) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            <Quote className="h-6 w-6 text-muted-foreground shrink-0 mt-1" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/4 mt-2" />
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error || !quote) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            <Quote className="h-6 w-6 text-muted-foreground shrink-0 mt-1" />
            <div>
              <p>Could not load the quote of the day. Please try again later.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <Quote className="h-6 w-6 text-muted-foreground shrink-0 mt-1" />
          <div>
            <p className="italic">{quote.content}</p>
            <p className="text-sm text-muted-foreground mt-2">— {quote.author}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

