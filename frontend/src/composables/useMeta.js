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
  }

  const updateDocumentTitle = () => {
    document.title = title.value
  }

  const updateMetaTag = (property, content) => {
    // Update or create meta tag
    let metaTag = document.querySelector(`meta[property="${property}"]`) || 
                  document.querySelector(`meta[name="${property}"]`)
    
    if (!metaTag) {
      metaTag = document.createElement('meta')
      if (property.startsWith('og:') || property.startsWith('twitter:')) {
        metaTag.setAttribute('property', property)
      } else {
        metaTag.setAttribute('name', property)
      }
      document.head.appendChild(metaTag)
    }
    
    metaTag.setAttribute('content', content)
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