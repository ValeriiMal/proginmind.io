import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

const articlesDirectory = path.join(process.cwd(), 'src/articles/articles')

export interface ArticleMetadata {
  title: string
  date: string
  path: string
  description: string
  category?: string
  tags?: string[]
}

export interface Article {
  slug: string
  metadata: ArticleMetadata
  content: string
}

function getAllArticleFiles(dir: string): string[] {
  const files: string[] = []
  const items = fs.readdirSync(dir)

  for (const item of items) {
    const fullPath = path.join(dir, item)
    const stat = fs.statSync(fullPath)

    if (stat.isDirectory()) {
      // Check if there's an index.md in this directory
      const indexPath = path.join(fullPath, 'index.md')
      if (fs.existsSync(indexPath)) {
        files.push(indexPath)
        // Don't recurse into this directory since we found index.md
      } else {
        // Only recurse if no index.md was found
        files.push(...getAllArticleFiles(fullPath))
      }
    } else if (item.endsWith('.md')) {
      files.push(fullPath)
    }
  }

  return files
}

export function getAllArticles(): Article[] {
  const articleFiles = getAllArticleFiles(articlesDirectory)
  
  const articles = articleFiles.map((filePath) => {
    const fileContents = fs.readFileSync(filePath, 'utf8')
    const { data, content } = matter(fileContents)
    
    // Generate slug from path
    const slug = data.path?.replace(/^\/posts\//, '').replace(/\/$/, '') || 
                 path.basename(filePath, '.md')

    return {
      slug,
      metadata: {
        title: data.title || '',
        date: data.date || '',
        path: data.path || '',
        description: data.description || '',
        category: data.category,
        tags: data.tags,
      },
      content,
    }
  })

  // Sort by date, newest first
  return articles.sort((a, b) => {
    const dateA = new Date(a.metadata.date)
    const dateB = new Date(b.metadata.date)
    return dateB.getTime() - dateA.getTime()
  })
}

export function getArticleBySlug(slug: string): Article | null {
  const articles = getAllArticles()
  return articles.find((article) => article.slug === slug) || null
}
