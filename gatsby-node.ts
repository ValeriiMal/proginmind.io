import type { GatsbyNode } from "gatsby"
import path from "path"

export const createPages: GatsbyNode["createPages"] = async ({ graphql, actions }) => {
  const { createPage } = actions
  const articleTemplate = path.resolve(`src/templates/article.tsx`)

  const result = await graphql<{
    allMarkdownRemark: {
      edges: Array<{
        node: {
          id: string
          frontmatter: {
            path: string
          }
        }
      }>
    }
  }>(`
    query {
      allMarkdownRemark {
        edges {
          node {
            id
            frontmatter {
              path
            }
          }
        }
      }
    }
  `)

  if (result.errors) {
    throw result.errors
  }

  const articles = result.data?.allMarkdownRemark.edges || []

  articles.forEach(({ node }) => {
    createPage({
      path: node.frontmatter.path,
      component: articleTemplate,
      context: {
        id: node.id,
      },
    })
  })
}
