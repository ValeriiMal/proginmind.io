import * as React from "react"
import { graphql, Link } from "gatsby"
import type { HeadFC, PageProps } from "gatsby"
import "prismjs/themes/prism-tomorrow.css"
import "../styles/global.css"

const pageStyles = {
  color: "#232129",
  padding: "40px",
  maxWidth: "800px",
  margin: "0 auto",
  fontFamily: "-apple-system, Roboto, sans-serif, serif",
}

const headerStyles = {
  marginBottom: "40px",
}

const backLinkStyles = {
  color: "#0066cc",
  textDecoration: "none",
  fontSize: "14px",
  display: "inline-block",
  marginBottom: "20px",
}

const titleStyles = {
  margin: 0,
  fontSize: "32px",
  marginBottom: "10px",
}

const metaStyles = {
  color: "#666",
  fontSize: "14px",
  marginBottom: "30px",
}

const contentStyles = {
  lineHeight: "1.8",
}

interface ArticleData {
  markdownRemark: {
    html: string
    frontmatter: {
      title: string
      date: string
      description: string
    }
  }
}

const ArticleTemplate: React.FC<PageProps<ArticleData>> = ({ data }) => {
  const { markdownRemark } = data
  const { frontmatter, html } = markdownRemark

  return (
    <main style={pageStyles}>
      <Link to="/" style={backLinkStyles}>← Back to home</Link>
      
      <header style={headerStyles}>
        <h1 style={titleStyles}>{frontmatter.title}</h1>
        <div style={metaStyles}>{frontmatter.date}</div>
      </header>
      
      <article 
        style={contentStyles}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </main>
  )
}

export default ArticleTemplate

export const Head: HeadFC<ArticleData> = ({ data }) => (
  <title>{data.markdownRemark.frontmatter.title} | Proginmind.io</title>
)

export const query = graphql`
  query($id: String!) {
    markdownRemark(id: { eq: $id }) {
      html
      frontmatter {
        title
        date(formatString: "MMMM DD, YYYY")
        description
      }
    }
  }
`
