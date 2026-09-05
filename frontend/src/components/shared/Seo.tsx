import React, { useEffect } from 'react';

export interface SeoProps {
  title?: string;
  description?: string;
  image?: string;
  type?: 'website' | 'article';
  jsonLd?: Record<string, any> | Array<Record<string, any>>;
}

const DEFAULT_TITLE = 'Qindil Apologetics — Islamic Apologetics & Intellectual Research Platform';
const DEFAULT_DESCRIPTION =
  'Qindil Apologetics is an Islamic apologetics and intellectual research platform delivering peer-reviewed articles, theological refutations, and educational content.';
const DEFAULT_IMAGE = '/logo/logo-dark.svg';

export const Seo: React.FC<SeoProps> = ({
  title,
  description = DEFAULT_DESCRIPTION,
  image = DEFAULT_IMAGE,
  type = 'website',
  jsonLd,
}) => {
  useEffect(() => {
    // 1. Update Document Title with consistent site-wide pattern
    let formattedTitle = DEFAULT_TITLE;
    if (title) {
      formattedTitle = title.includes('Qindil') ? title : `${title} — Qindil Apologetics`;
    }
    const previousTitle = document.title;
    document.title = formattedTitle;

    // Track modified and created meta tags for clean removal on unmount
    const createdElements: (HTMLMetaElement | HTMLScriptElement)[] = [];
    const originalContentMap = new Map<HTMLMetaElement, string>();

    const updateOrCreateMeta = (
      attrName: 'name' | 'property',
      attrValue: string,
      contentValue: string
    ) => {
      let element = document.querySelector<HTMLMetaElement>(
        `meta[${attrName}="${attrValue}"]`
      );

      if (element) {
        if (!originalContentMap.has(element)) {
          originalContentMap.set(element, element.getAttribute('content') || '');
        }
        element.setAttribute('content', contentValue);
      } else {
        element = document.createElement('meta');
        element.setAttribute(attrName, attrValue);
        element.setAttribute('content', contentValue);
        document.head.appendChild(element);
        createdElements.push(element);
      }
    };

    // 2. Standard Description Meta Tag
    updateOrCreateMeta('name', 'description', description);

    // 3. OpenGraph Meta Tags
    updateOrCreateMeta('property', 'og:title', formattedTitle);
    updateOrCreateMeta('property', 'og:description', description);
    updateOrCreateMeta('property', 'og:image', image);
    updateOrCreateMeta('property', 'og:type', type);

    // 4. Twitter Card Meta Tags
    updateOrCreateMeta('name', 'twitter:card', 'summary_large_image');
    updateOrCreateMeta('name', 'twitter:title', formattedTitle);
    updateOrCreateMeta('name', 'twitter:description', description);
    updateOrCreateMeta('name', 'twitter:image', image);

    // 5. JSON-LD Structured Data Injection
    let jsonLdScript: HTMLScriptElement | null = null;
    if (jsonLd) {
      jsonLdScript = document.createElement('script');
      jsonLdScript.type = 'application/ld+json';
      jsonLdScript.text = JSON.stringify(jsonLd);
      document.head.appendChild(jsonLdScript);
      createdElements.push(jsonLdScript);
    }

    // Cleanup on unmount or prop change
    return () => {
      document.title = previousTitle;

      // Revert updated existing elements
      originalContentMap.forEach((oldContent, element) => {
        if (oldContent) {
          element.setAttribute('content', oldContent);
        } else {
          element.removeAttribute('content');
        }
      });

      // Remove created elements
      createdElements.forEach((el) => {
        if (el.parentNode) {
          el.parentNode.removeChild(el);
        }
      });
    };
  }, [title, description, image, type, jsonLd]);

  return null;
};

export default Seo;
