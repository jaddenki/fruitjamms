import {sanityClient} from 'sanity:client'
import {createImageUrlBuilder} from '@sanity/image-url'
import {defineQuery} from 'groq'

export const SITE_QUERY = defineQuery(`
  *[_type == "siteSettings" && _id == "siteSettings"][0] {
    siteName,
    aboutBlurb,
    bookingLabel,
    bookingUrl,
    workTabLabel,
    aboutTabLabel,
    allFilterLabel,
    teamBlurb,
    contactPrefix,
    contactEmail,
    seoTitle,
    seoDescription,
    canonicalUrl,
    themeColor,
    socialImage,
    projectOrder[]->{
      _id,
      title,
      slug,
      categories,
      linkType,
      projectUrl,
      previewImage,
      "previewVideoUrl": previewVideo.asset->url
    },
    teamOrder[]->{
      _id,
      name,
      role,
      url,
      avatar
    }
  }
`)

const imageBuilder = createImageUrlBuilder(sanityClient)

export function getSiteSettings() {
  return sanityClient.fetch(SITE_QUERY)
}

export function urlFor(source: Parameters<typeof imageBuilder.image>[0]) {
  return imageBuilder.image(source)
}
