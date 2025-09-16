import { ref, watch } from 'vue'

const title = ref('Neovolt - Deutsche Connectors')
const description = ref('High-quality German electrical connectors for reliable power connections')
const keywords = ref('deutsche connectors, german electrical, power connectors, electrical hardware')
const image = ref('/api/placeholder/1200/630')

export function useMeta() {
  const setTitle = (newTitle) => {
    title.value = newTitle
    updateDocumentTitle()
  }

  const setDescription = (newDescription) => {
    description.value = newDescription
    updateMetaTag('description', newDescription)
  }

  const setKeywords = (newKeywords) => {
    keywords.value = newKeywords
    updateMetaTag('keywords', newKeywords)
  }

  const setImage = (newImage) => {
    image.value = newImage
    updateMetaTag('og:image', newImage)
    updateMetaTag('twitter:image', newImage)
  }

  const setMeta = (metaData) => {
    if (metaData.title) setTitle(metaData.title)
    if (metaData.description) setDescription(metaData.description)
    if (metaData.keywords) setKeywords(metaData.keywords)
    if (metaData.image) setImage(metaData.image)
    
    // Set additional SEO meta tags
    if (metaData.canonical) updateMetaTag('canonical', metaData.canonical, 'link', 'href')
    if (metaData.robots) updateMetaTag('robots', metaData.robots)
    if (metaData.author) updateMetaTag('author', metaData.author)
    if (metaData.publishedTime) updateMetaTag('article:published_time', metaData.publishedTime)
    if (metaData.modifiedTime) updateMetaTag('article:modified_time', metaData.modifiedTime)
    if (metaData.section) updateMetaTag('article:section', metaData.section)
    if (metaData.tags) updateMetaTag('article:tag', metaData.tags)
  }

  const updateDocumentTitle = () => {
    document.title = title.value
  }

  const updateMetaTag = (property, content, tagName = 'meta', attribute = 'content') => {
    // Update or create meta tag
    let metaTag = document.querySelector(`${tagName}[property="${property}"]`) || 
                  document.querySelector(`${tagName}[name="${property}"]`) ||
                  document.querySelector(`${tagName}[rel="${property}"]`)
    
    if (!metaTag) {
      metaTag = document.createElement(tagName)
      if (property.startsWith('og:') || property.startsWith('twitter:') || property.startsWith('article:')) {
        metaTag.setAttribute('property', property)
      } else if (property === 'canonical') {
        metaTag.setAttribute('rel', property)
      } else {
        metaTag.setAttribute('name', property)
      }
      document.head.appendChild(metaTag)
    }
    
    metaTag.setAttribute(attribute, content)
  }

  const initializeMeta = () => {
    // Set initial meta tags
    updateDocumentTitle()
    updateMetaTag('description', description.value)
    updateMetaTag('keywords', keywords.value)
    updateMetaTag('og:title', title.value)
    updateMetaTag('og:description', description.value)
    updateMetaTag('og:image', image.value)
    updateMetaTag('og:type', 'website')
    updateMetaTag('og:url', window.location.href)
    updateMetaTag('twitter:card', 'summary_large_image')
    updateMetaTag('twitter:title', title.value)
    updateMetaTag('twitter:description', description.value)
    updateMetaTag('twitter:image', image.value)
  }

  // Watch for changes and update document
  watch(title, updateDocumentTitle)

  return {
    title,
    description,
    keywords,
    image,
    setTitle,
    setDescription,
    setKeywords,
    setImage,
    setMeta,
    initializeMeta
  }
}