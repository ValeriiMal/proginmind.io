import Link from 'next/link'
import { getAllArticles } from '../src/lib/articles'

const pageStyles = {
  color: '#232129',
  padding: '40px',
  maxWidth: '800px',
  margin: '0 auto',
  fontFamily: '-apple-system, Roboto, sans-serif, serif',
}

const headerStyles = {
  marginBottom: '40px',
  paddingBottom: '20px',
  borderBottom: '1px solid #e0e0e0',
}

const titleStyles = {
  margin: 0,
  fontSize: '28px',
  fontWeight: 'normal' as const,
}

const articleListStyles = {
  listStyle: 'none',
  padding: 0,
  margin: 0,
}

const articleItemStyles = {
  marginBottom: '30px',
  paddingBottom: '30px',
  borderBottom: '1px solid #f0f0f0',
}

const articleTitleStyles = {
  margin: 0,
  fontSize: '20px',
  marginBottom: '8px',
}

const articleLinkStyles = {
  color: '#0066cc',
  textDecoration: 'none',
}

const articleMetaStyles = {
  color: '#666',
  fontSize: '14px',
  marginBottom: '8px',
}

const articleDescriptionStyles = {
  color: '#444',
  margin: 0,
  lineHeight: '1.6',
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export default function Home() {
  const articles = getAllArticles()

  return (
    <main style={pageStyles}>
      <header style={headerStyles}>
        <h1 style={titleStyles}>Proginmind.io, Valerii Maltsev blog</h1>
      </header>
      
      <ul style={articleListStyles}>
        {articles.map((article) => (
          <li key={article.slug} style={articleItemStyles}>
            <h2 style={articleTitleStyles}>
              <Link href={`/posts/${article.slug}`} style={articleLinkStyles}>
                {article.metadata.title}
              </Link>
            </h2>
            <div style={articleMetaStyles}>{formatDate(article.metadata.date)}</div>
            <p style={articleDescriptionStyles}>
              {article.metadata.description}
            </p>
          </li>
        ))}
      </ul>
    </main>
  )
}
