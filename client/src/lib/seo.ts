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

  // Geographic targeting
  updateMetaTag("geo.region", "KW");
  updateMetaTag("geo.placename", "الكويت");
  updateMetaTag("geo.position", "29.3759;47.9774"); // Kuwait City coordinates
  updateMetaTag("ICBM", "29.3759, 47.9774");
  
  // Language and region
  updateMetaTag("language", "Arabic");
  updateMetaTag("content-language", "ar-KW");
  
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
  description: "أفضل منصة تعليمية في الكويت للمرحلة الثانوية - مذكرات ومراجعات علمية شاملة للكيمياء والأحياء والفيزياء والجيولوجيا - إشراف فارس العلوم 99457080",
  keywords: [
    "مذكرات ثانوي الكويت",
    "مراجعات ثانوي علمي الكويت",
    "ملخص الزبدة جيولوجيا الكويت",
    "مذكرة جيولوجيا الكويت",
    "ملخص كيمياء 11 الكويت",
    "ملخص أحياء 11 الكويت",
    "ملخص فيزياء الكويت",
    "مذكرات علمية الكويت",
    "صف 11 ثانوي الكويت",
    "صف 10 ثانوي الكويت",
    "صف 12 ثانوي الكويت",
    "فارس العلوم الكويت",
    "مراجعات نهائية الكويت",
    "نماذج اختبارات الكويت",
    "التعليم الثانوي الكويت",
    "المناهج الكويتية",
    "وزارة التربية الكويت"
  ],
  ogType: "website"
};

// SEO configs for different pages
export const pageSEO = {
  about: {
    title: "من نحن",
    description: "منصة ثانوي علمي - أفضل منصة تعليمية في الكويت للمرحلة الثانوية - مذكرات ومراجعات علمية شاملة بإشراف فارس العلوم - خدمة طلاب الكويت منذ سنوات",
    keywords: ["من نحن", "فارس العلوم الكويت", "منصة تعليمية الكويت", "مذكرات ثانوي الكويت", "التعليم في الكويت"]
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
    description: "احجز حصص دراسية مباشرة أونلاين في الكويت مع أفضل المعلمين - كيمياء، أحياء، فيزياء، جيولوجيا - للمرحلة الثانوية",
    keywords: ["حصص أونلاين الكويت", "دروس خصوصية الكويت", "تعليم عن بعد الكويت", "حصص مباشرة الكويت", "معلم خصوصي الكويت"]
  }
};
