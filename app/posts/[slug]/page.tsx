import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypePrism from 'rehype-prism-plus'
import rehypeRaw from 'rehype-raw'
import { getAllArticles, getArticleBySlug } from '../../../src/lib/articles'
import type { Metadata } from 'next'

const pageStyles = {
  color: '#232129',
  padding: '40px',
  maxWidth: '800px',
  margin: '0 auto',
  fontFamily: '-apple-system, Roboto, sans-serif, serif',
}

const headerStyles = {
  marginBottom: '40px',
}

const backLinkStyles = {
  color: '#0066cc',
  textDecoration: 'none',
  fontSize: '14px',
  display: 'inline-block',
  marginBottom: '20px',
}

const titleStyles = {
  margin: 0,
  fontSize: '32px',
  marginBottom: '10px',
}

const metaStyles = {
  color: '#666',
  fontSize: '14px',
  marginBottom: '30px',
}

const contentStyles = {
  lineHeight: '1.8',
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export async function generateStaticParams() {
  const articles = getAllArticles()
  return articles.map((article) => ({
    slug: article.slug,
  }))
}

export async function generateMetadata({ 
  params 
}: { 
  params: { slug: string } 
}): Promise<Metadata> {
  const article = getArticleBySlug(params.slug)
  
  if (!article) {
    return {
      title: 'Article Not Found',
    }
  }

  return {
    title: `${article.metadata.title} | Proginmind.io`,
    description: article.metadata.description,
  }
}

export default function ArticlePage({ params }: { params: { slug: string } }) {
  const article = getArticleBySlug(params.slug)

  if (!article) {
    return (
      <main style={pageStyles}>
        <h1>Article not found</h1>
        <Link href="/" style={backLinkStyles}>← Back to home</Link>
      </main>
    )
  }

  return (
    <main style={pageStyles}>
      <Link href="/" style={backLinkStyles}>← Back to home</Link>
      
      <header style={headerStyles}>
        <h1 style={titleStyles}>{article.metadata.title}</h1>
        <div style={metaStyles}>{formatDate(article.metadata.date)}</div>
      </header>
      
      <article style={contentStyles} className="markdown-content">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeRaw, rehypePrism]}
        >
          {article.content}
        </ReactMarkdown>
      </article>
    </main>
  )
}
