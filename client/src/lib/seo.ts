/**
 * SEO Helper Functions
 * إدارة meta tags و SEO للصفحات
 */

interface SEOConfig {
  title: string;
  description: string;
  keywords?: string[];
  ogImage?: string;
  ogType?: string;
  canonical?: string;
}

export function updateSEO(config: SEOConfig) {
  // Update title
  document.title = `${config.title} | منصة ثانوي علمي بالكويت`;

  // Update or create meta tags
  updateMetaTag("description", config.description);
  
  if (config.keywords && config.keywords.length > 0) {
    updateMetaTag("keywords", config.keywords.join(", "));
  }

  // Open Graph tags
  updateMetaTag("og:title", config.title, "property");
  updateMetaTag("og:description", config.description, "property");
  updateMetaTag("og:type", config.ogType || "website", "property");
  
  if (config.ogImage) {
    updateMetaTag("og:image", config.ogImage, "property");
  }

  // Twitter Card tags
  updateMetaTag("twitter:card", "summary_large_image");
  updateMetaTag("twitter:title", config.title);
  updateMetaTag("twitter:description", config.description);
  
  if (config.ogImage) {
    updateMetaTag("twitter:image", config.ogImage);
  }

  // Canonical URL
  if (config.canonical) {
    updateLinkTag("canonical", config.canonical);
  }
}

function updateMetaTag(name: string, content: string, attribute: string = "name") {
  let element = document.querySelector(`meta[${attribute}="${name}"]`);
  
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attribute, name);
    document.head.appendChild(element);
  }
  
  element.setAttribute("content", content);
}

function updateLinkTag(rel: string, href: string) {
  let element = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement;
  
  if (!element) {
    element = document.createElement("link");
    element.setAttribute("rel", rel);
    document.head.appendChild(element);
  }
  
  element.href = href;
}

// Default SEO config for home page
export const defaultSEO: SEOConfig = {
  title: "الصفحة الرئيسية",
  description: "منصة تعليمية متخصصة في توفير مذكرات ومراجعات علمية شاملة للمرحلة الثانوية في الكويت - كيمياء، أحياء، فيزياء، جيولوجيا",
  keywords: [
    "ملخص الزبدة جيولوجيا",
    "مذكرة جيولوجيا",
    "ملخص كيمياء 11",
    "ملخص أحياء 11",
    "ملخص احياء 10",
    "ملخص كيمياء 10",
    "صف 11 ثانوي",
    "صف 10 ثانوي"
  ],
  ogType: "website"
};

// SEO configs for different pages
export const pageSEO = {
  about: {
    title: "من نحن",
    description: "تعرف على منصة ثانوي علمي بالكويت - نوفر أفضل المذكرات والمراجعات العلمية للطلاب بإشراف فارس العلوم",
    keywords: ["من نحن", "فارس العلوم", "منصة تعليمية", "الكويت"]
  },
  
  privacy: {
    title: "سياسة الخصوصية",
    description: "سياسة الخصوصية وحماية البيانات في منصة ثانوي علمي بالكويت - نلتزم بحماية معلوماتك الشخصية",
    keywords: ["سياسة الخصوصية", "حماية البيانات", "أمان المعلومات"]
  },
  
  terms: {
    title: "شروط الاستخدام",
    description: "شروط وأحكام استخدام منصة ثانوي علمي بالكويت - اقرأ الشروط قبل استخدام المنصة",
    keywords: ["شروط الاستخدام", "أحكام الاستخدام", "قواعد المنصة"]
  },
  
  sessions: {
    title: "الحصص الدراسية أونلاين",
    description: "احجز حصص دراسية مباشرة أونلاين مع أفضل المعلمين في العلوم للمرحلة الثانوية",
    keywords: ["حصص أونلاين", "دروس خصوصية", "تعليم عن بعد", "حصص مباشرة"]
  }
};
