<template>
  <script type="application/ld+json" v-html="structuredData"></script>
</template>

<script>
import { computed } from 'vue'

export default {
  name: 'StructuredData',
  props: {
    type: {
      type: String,
      required: true,
      validator: (value) => ['Organization', 'WebSite', 'Product', 'BreadcrumbList', 'WebPage'].includes(value)
    },
    data: {
      type: Object,
      required: true
    }
  },
  setup(props) {
    const structuredData = computed(() => {
      const baseUrl = window.location.origin
      
      switch (props.type) {
        case 'Organization':
          return JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "Neovolt",
            "description": "High-quality German electrical connectors and hardware for reliable power connections",
            "url": baseUrl,
            "logo": `${baseUrl}/icons/icon-512x512.png`,
            "contactPoint": {
              "@type": "ContactPoint",
              "telephone": "+27-XX-XXX-XXXX",
              "contactType": "customer service",
              "availableLanguage": ["English"]
            },
            "sameAs": [
              "https://www.facebook.com/neovolt",
              "https://www.twitter.com/neovolt",
              "https://www.linkedin.com/company/neovolt"
            ],
            "address": {
              "@type": "PostalAddress",
              "addressCountry": "ZA",
              "addressLocality": "Cape Town",
              "addressRegion": "Western Cape"
            }
          })

        case 'WebSite':
          return JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": "Neovolt - Deutsche Connectors",
            "description": "High-quality German electrical connectors and hardware for reliable power connections",
            "url": baseUrl,
            "potentialAction": {
              "@type": "SearchAction",
              "target": {
                "@type": "EntryPoint",
                "urlTemplate": `${baseUrl}/products?search={search_term_string}`
              },
              "query-input": "required name=search_term_string"
            },
            "publisher": {
              "@type": "Organization",
              "name": "Neovolt",
              "logo": `${baseUrl}/icons/icon-512x512.png`
            }
          })

        case 'Product':
          return JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            "name": props.data.name,
            "description": props.data.description,
            "image": props.data.image_url ? [props.data.image_url] : [`${baseUrl}/api/placeholder/400/300`],
            "sku": `PRODUCT-${props.data.id}`,
            "brand": {
              "@type": "Brand",
              "name": "Neovolt"
            },
            "offers": {
              "@type": "Offer",
              "price": props.data.price,
              "priceCurrency": "ZAR",
              "availability": props.data.stock_quantity > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
              "seller": {
                "@type": "Organization",
                "name": "Neovolt"
              }
            },
            "aggregateRating": props.data.average_rating > 0 ? {
              "@type": "AggregateRating",
              "ratingValue": props.data.average_rating,
              "reviewCount": props.data.review_count
            } : undefined,
            "category": props.data.category_name
          })

        case 'BreadcrumbList':
          return JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": props.data.map((item, index) => ({
              "@type": "ListItem",
              "position": index + 1,
              "name": item.name,
              "item": item.url
            }))
          })

        case 'WebPage':
          return JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": props.data.title,
            "description": props.data.description,
            "url": props.data.url,
            "isPartOf": {
              "@type": "WebSite",
              "name": "Neovolt - Deutsche Connectors",
              "url": baseUrl
            },
            "breadcrumb": props.data.breadcrumb ? {
              "@type": "BreadcrumbList",
              "itemListElement": props.data.breadcrumb
            } : undefined
          })

        default:
          return '{}'
      }
    })

    return {
      structuredData
    }
  }
}
</script>