const GITHUB_API = 'https://api.github.com'
const RAW_BASE = 'https://raw.githubusercontent.com'

export function parseRepoUrl(url: string) {
  const match = url.match(/github\.com\/([^/]+)\/([^/]+)(?:\/tree\/([^/]+))?/)
  if (!match) throw new Error('invalid URL')

  const [_, owner, repo, branch = 'main'] = match
  return { owner, repo, branch }
}

export async function getFileList(owner: string, repo: string, branch: string) {
  const treeUrl = `${GITHUB_API}/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`
  const response = await fetch(treeUrl, {
    headers: {
      Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
      Accept: 'application/vnd.github.v3+json',
    },
  })

  if (!response.ok) {
    throw new Error(`Error fetching file tree: ${response.statusText}`)
  }

  const data = await response.json()
  return data.tree
    .filter((item: any) => item.type === 'blob' && !item.path.endsWith('.zip'))
    .map((file: any) => file.path)
}

export const fetchFileContents = async (
  owner: string,
  repo: string,
  branch: string,
  filePath: string,
) => {
  const contentUrl = `${RAW_BASE}/${owner}/${repo}/${branch}/${filePath}`

  try {
    const response = await fetch(contentUrl)
    if (!response.ok) {
      throw new Error(
        `Error fetching content of ${filePath}: ${response.status} ${response.statusText}`,
      )
    }

    const content = await response.text()

    const fileMetadata = {
      content,
      url: `https://github.com/${owner}/${repo}/blob/${branch}/${filePath}`,
      title: filePath,
      metadata: {
        suffix: '.' + filePath.split('.').pop(),
        num_lines: content.split('\n').length,
        filename: filePath.split('/').pop(),
        repository: `https://github.com/${owner}/${repo}`,
      },
    }

    return fileMetadata
  } catch (error) {
    console.error(`❌ Error processing file ${filePath}:`, error)
    return {
      content: '',
      url: `https://github.com/${owner}/${repo}/blob/${branch}/${filePath}`,
      title: filePath,
      metadata: {
        suffix: '.' + filePath.split('.').pop(),
        num_lines: 0,
        filename: filePath.split('/').pop(),
        repository: `https://github.com/${owner}/${repo}`,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
    }
  }
}
