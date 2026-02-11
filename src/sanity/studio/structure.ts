import type { StructureResolver } from 'sanity/structure';

// Singleton document IDs
const SITE_CONFIG_ID = 'siteConfig';
const ABOUT_ID = 'about';

export const structure: StructureResolver = (S) =>
  S.list()
    .title('Content')
    .items([
      // Site Configuration singleton
      S.listItem()
        .title('Site Configuration')
        .id('siteConfig')
        .child(
          S.document()
            .schemaType('siteConfig')
            .documentId(SITE_CONFIG_ID)
        ),

      // About Page singleton
      S.listItem()
        .title('About Page')
        .id('about')
        .child(
          S.document()
            .schemaType('about')
            .documentId(ABOUT_ID)
        ),

      S.divider(),

      // Projects list
      S.documentTypeListItem('project').title('Projects'),
    ]);
