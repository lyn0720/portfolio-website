import { ChevronDown } from "lucide-react"
import Hero from "@/components/hero"
import LatestArticles from "@/components/about"
import BlogColumns from "@/components/projects"
import CategoryTags from "@/components/services"
import ArchiveTimeline from "@/components/blog"
import ReaderComments from "@/components/testimonials"
import Footer from "@/components/footer"

export default function Home() {
  return (
    <main className="min-h-screen">
      <Hero />

      <div className="flex justify-center my-8">
        <a
          href="#articles"
          className="animate-bounce p-2 bg-stone-100 rounded-full dark:bg-jungle-900 transition-colors"
        >
          <ChevronDown className="h-6 w-6 text-stone-700 dark:text-stone-200" />
        </a>
      </div>

      <LatestArticles />
      <BlogColumns />
      <CategoryTags />
      <ArchiveTimeline />
      <ReaderComments />
      <Footer />
    </main>
  )
}
