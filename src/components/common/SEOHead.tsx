import React, { useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  canonicalUrl?: string;
  noIndex?: boolean; // 是否阻止搜索引擎索引
}

const SEOHead: React.FC<SEOHeadProps> = ({
  title,
  description,
  keywords,
  ogTitle,
  ogDescription,
  ogImage,
  canonicalUrl,
  noIndex = true // 默认阻止索引
}) => {
  const { language } = useLanguage();

  useEffect(() => {
    // 设置页面标题
    if (title) {
      document.title = title;
    }

    // 设置或更新meta标签
    const updateOrCreateMeta = (name: string, content: string, useProperty = false) => {
      const selector = useProperty ? `meta[property="${name}"]` : `meta[name="${name}"]`;
      let meta = document.querySelector(selector) as HTMLMetaElement;
      
      if (!meta) {
        meta = document.createElement('meta');
        if (useProperty) {
          meta.setAttribute('property', name);
        } else {
          meta.setAttribute('name', name);
        }
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };

    // 设置描述
    if (description) {
      updateOrCreateMeta('description', description);
    }

    // 设置关键词
    if (keywords) {
      updateOrCreateMeta('keywords', keywords);
    }

    // 设置 SEO 索引配置
    if (noIndex) {
      updateOrCreateMeta('robots', 'noindex, nofollow, noarchive, nosnippet, noimageindex');
      updateOrCreateMeta('googlebot', 'noindex, nofollow, noarchive, nosnippet, noimageindex');
      updateOrCreateMeta('bingbot', 'noindex, nofollow, noarchive, nosnippet, noimageindex');
    } else {
      updateOrCreateMeta('robots', 'index, follow');
      updateOrCreateMeta('googlebot', 'index, follow');
      updateOrCreateMeta('bingbot', 'index, follow');
    }

    // 设置语言
    document.documentElement.lang = language;

    // 设置Open Graph标签
    if (ogTitle) {
      updateOrCreateMeta('og:title', ogTitle, true);
    }
    if (ogDescription) {
      updateOrCreateMeta('og:description', ogDescription, true);
    }
    if (ogImage) {
      updateOrCreateMeta('og:image', ogImage, true);
    }
    updateOrCreateMeta('og:type', 'website', true);

    // 设置Twitter Card标签
    updateOrCreateMeta('twitter:card', 'summary_large_image');
    if (ogTitle) {
      updateOrCreateMeta('twitter:title', ogTitle);
    }
    if (ogDescription) {
      updateOrCreateMeta('twitter:description', ogDescription);
    }
    if (ogImage) {
      updateOrCreateMeta('twitter:image', ogImage);
    }

    // 设置canonical链接
    if (canonicalUrl) {
      let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
      if (!link) {
        link = document.createElement('link');
        link.rel = 'canonical';
        document.head.appendChild(link);
      }
      link.href = canonicalUrl;
    }

    // 设置favicon
    const updateOrCreateLink = (rel: string, href: string, type?: string) => {
      let link = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement;
      if (!link) {
        link = document.createElement('link');
        link.rel = rel;
        if (type) {
          link.type = type;
        }
        document.head.appendChild(link);
      }
      link.href = href;
    };

    // 设置各种尺寸的favicon
    updateOrCreateLink('icon', '/images/logo.svg', 'image/svg+xml');
    updateOrCreateLink('apple-touch-icon', '/images/logo.svg');
    updateOrCreateLink('shortcut icon', '/images/logo.svg');

  }, [title, description, keywords, ogTitle, ogDescription, ogImage, canonicalUrl, noIndex, language]);

  return null; // 这个组件不渲染任何内容
};

export default SEOHead; 