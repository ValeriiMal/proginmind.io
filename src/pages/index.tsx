import * as React from "react"
import { graphql, Link } from "gatsby"
import type { HeadFC, PageProps } from "gatsby"

const pageStyles = {
  color: "#232129",
  padding: "40px",
  maxWidth: "800px",
  margin: "0 auto",
  fontFamily: "-apple-system, Roboto, sans-serif, serif",
}

const headerStyles = {
  marginBottom: "40px",
  paddingBottom: "20px",
  borderBottom: "1px solid #e0e0e0",
}

const titleStyles = {
  margin: 0,
  fontSize: "28px",
  fontWeight: "normal" as "normal",
}

const articleListStyles = {
  listStyle: "none",
  padding: 0,
  margin: 0,
}

const articleItemStyles = {
  marginBottom: "30px",
  paddingBottom: "30px",
  borderBottom: "1px solid #f0f0f0",
}

const articleTitleStyles = {
  margin: 0,
  fontSize: "20px",
  marginBottom: "8px",
}

const articleLinkStyles = {
  color: "#0066cc",
  textDecoration: "none",
}

const articleMetaStyles = {
  color: "#666",
  fontSize: "14px",
  marginBottom: "8px",
}

const articleDescriptionStyles = {
  color: "#444",
  margin: 0,
  lineHeight: "1.6",
}

interface ArticleNode {
  id: string
  frontmatter: {
    title: string
    date: string
    path: string
    description: string
  }
  excerpt: string
}

interface IndexPageData {
  allMarkdownRemark: {
    edges: Array<{
      node: ArticleNode
    }>
  }
}

const IndexPage: React.FC<PageProps<IndexPageData>> = ({ data }) => {
  const articles = data.allMarkdownRemark.edges

  return (
    <main style={pageStyles}>
      <header style={headerStyles}>
        <h1 style={titleStyles}>Proginmind.io, Valerii Maltsev blog</h1>
      </header>
      
      <ul style={articleListStyles}>
        {articles.map(({ node }) => (
          <li key={node.id} style={articleItemStyles}>
            <h2 style={articleTitleStyles}>
              <Link to={node.frontmatter.path} style={articleLinkStyles}>
                {node.frontmatter.title}
              </Link>
            </h2>
            <div style={articleMetaStyles}>{node.frontmatter.date}</div>
            <p style={articleDescriptionStyles}>
              {node.frontmatter.description || node.excerpt}
            </p>
          </li>
        ))}
      </ul>
    </main>
  )
}

export default IndexPage

export const Head: HeadFC = () => <title>Proginmind.io - Valerii Maltsev blog</title>

export const query = graphql`
  query {
    allMarkdownRemark(sort: { frontmatter: { date: DESC } }) {
      edges {
        node {
          id
          frontmatter {
            title
            date(formatString: "MMMM DD, YYYY")
            path
            description
          }
          excerpt(pruneLength: 200)
        }
      }
    }
  }
`
