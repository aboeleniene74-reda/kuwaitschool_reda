/**
 * SEO Helper Functions
 * إدارة meta tags و SEO للصفحات - محسّن لعمليات البحث في الكويت
 */

interface SEOConfig {
  title: string;
  description: string;
  keywords?: string[];
  ogImage?: string;
  ogType?: string;
  canonical?: string;
}

const SITE_NAME = "مذكرة و مدرس";
const LOGO_URL = "https://files.manuscdn.com/user_upload_by_module/session_file/310519663268166641/OnCTfKKmyCezjhPb.png";

export function updateSEO(config: SEOConfig) {
  // Update title - format: Page Title | Site Name
  document.title = `${config.title} | ${SITE_NAME}`;

  // Update or create meta tags
  updateMetaTag("description", config.description);
  
  if (config.keywords && config.keywords.length > 0) {
    updateMetaTag("keywords", config.keywords.join(", "));
  }

  // Open Graph tags
  updateMetaTag("og:title", `${config.title} | ${SITE_NAME}`, "property");
  updateMetaTag("og:description", config.description, "property");
  updateMetaTag("og:type", config.ogType || "website", "property");
  updateMetaTag("og:site_name", SITE_NAME, "property");
  updateMetaTag("og:locale", "ar_KW", "property");
  updateMetaTag("og:image", config.ogImage || LOGO_URL, "property");
  updateMetaTag("og:image:alt", config.title, "property");

  // Geographic targeting for Kuwait
  updateMetaTag("geo.region", "KW");
  updateMetaTag("geo.placename", "الكويت");
  updateMetaTag("geo.position", "29.3759;47.9774");
  updateMetaTag("ICBM", "29.3759, 47.9774");
  
  // Language and region
  updateMetaTag("language", "Arabic");
  updateMetaTag("content-language", "ar-KW");
  
  // Twitter Card tags
  updateMetaTag("twitter:card", "summary_large_image");
  updateMetaTag("twitter:title", `${config.title} | ${SITE_NAME}`);
  updateMetaTag("twitter:description", config.description);
  updateMetaTag("twitter:image", config.ogImage || LOGO_URL);

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

// ===== الكلمات المفتاحية الأساسية =====
// مبنية على أنماط البحث الفعلية في الكويت

const CORE_KEYWORDS = [
  // كلمات عامة عالية البحث
  "مذكرات ثانوي الكويت",
  "ملخصات ثانوي الكويت",
  "مراجعات ثانوي الكويت",
  "نماذج اختبارات ثانوي الكويت",
  "بنك أسئلة ثانوي الكويت",
  "تحميل مذكرات الكويت",
  "مذكرات مجانية الكويت",
  
  // حسب المادة
  "مذكرة كيمياء الكويت",
  "مذكرة أحياء الكويت",
  "مذكرة فيزياء الكويت",
  "مذكرة جيولوجيا الكويت",
  "شرح كيمياء الكويت",
  "شرح أحياء الكويت",
  "شرح فيزياء الكويت",
  "شرح جيولوجيا الكويت",
  
  // حسب الصف
  "الصف العاشر الكويت",
  "الصف الحادي عشر الكويت",
  "الصف الثاني عشر الكويت",
  
  // حسب نوع المراجعة
  "مراجعة فاينل الكويت",
  "مراجعة قصير الكويت",
  "مراجعة نهائية الكويت",
  "امتحانات ثانوي الكويت",
  
  // العلامة التجارية
  "فارس العلوم",
  "مذكرة و مدرس",
  "مذكرة ومدرس",
  "مدرس كيمياء أحياء جيولوجيا",
  "مدرس كيمياء الكويت",
  "مدرس أحياء الكويت",
  "مدرس جيولوجيا الكويت",
  "ملخص الزبدة جيولوجيا",
  
  // كلمات مؤسسية
  "المنهج الكويتي",
  "وزارة التربية الكويت",
  "تعليم ثانوي الكويت",
  "المرحلة الثانوية الكويت",
];

// Default SEO config for home page
export const defaultSEO: SEOConfig = {
  title: "مدرس كيمياء - أحياء - جيولوجيا | مذكرات ثانوي الكويت",
  description: "مذكرة و مدرس - مدرس كيمياء - أحياء - جيولوجيا. أفضل مذكرات وملخصات المرحلة الثانوية في الكويت للصف العاشر والحادي عشر والثاني عشر. مراجعات شاملة، نماذج اختبارات سابقة، ملخصات الفاينل والقصير. إعداد فارس العلوم ☎ 99457080",
  keywords: CORE_KEYWORDS,
  ogType: "website"
};

// SEO configs for different pages
export const pageSEO = {
  about: {
    title: "من نحن - فارس العلوم",
    description: "مذكرة و مدرس - مدرس كيمياء - أحياء - جيولوجيا. إعداد فارس العلوم - خبرة سنوات في تدريس الكيمياء والأحياء والفيزياء والجيولوجيا لطلاب الثانوية في الكويت",
    keywords: [
      "فارس العلوم الكويت",
      "مدرس كيمياء الكويت",
      "مدرس أحياء الكويت",
      "مدرس فيزياء الكويت",
      "مدرس جيولوجيا الكويت",
      "معلم خصوصي الكويت",
      "مذكرة و مدرس",
      "منصة تعليمية الكويت",
      "تعليم ثانوي الكويت",
    ]
  },
  
  privacy: {
    title: "سياسة الخصوصية",
    description: "سياسة الخصوصية وحماية البيانات في مذكرة و مدرس - نلتزم بحماية معلوماتك الشخصية وفقاً لأعلى معايير الأمان",
    keywords: ["سياسة الخصوصية", "حماية البيانات", "أمان المعلومات", "مذكرة و مدرس"]
  },
  
  terms: {
    title: "شروط الاستخدام",
    description: "شروط وأحكام استخدام مذكرة و مدرس - اقرأ الشروط والأحكام قبل استخدام المنصة التعليمية",
    keywords: ["شروط الاستخدام", "أحكام الاستخدام", "قواعد المنصة", "مذكرة و مدرس"]
  },
  
  sessions: {
    title: "حصص دراسية أونلاين في الكويت",
    description: "احجز حصص دراسية مباشرة أونلاين في الكويت مع فارس العلوم - كيمياء، أحياء، فيزياء، جيولوجيا للمرحلة الثانوية. دروس خصوصية عن بعد بأسعار مناسبة",
    keywords: [
      "حصص أونلاين الكويت",
      "دروس خصوصية الكويت",
      "تعليم عن بعد الكويت",
      "حصص مباشرة الكويت",
      "معلم خصوصي الكويت",
      "دروس كيمياء أونلاين الكويت",
      "دروس أحياء أونلاين الكويت",
      "دروس فيزياء أونلاين الكويت",
      "حجز حصة خصوصية الكويت",
      "مدرس أونلاين الكويت",
    ]
  },

  faq: {
    title: "الأسئلة الشائعة",
    description: "الأسئلة الشائعة حول مذكرة و مدرس - كيفية تحميل المذكرات، حجز الحصص، والتواصل مع فارس العلوم في الكويت",
    keywords: [
      "أسئلة شائعة مذكرات الكويت",
      "كيف أحمل مذكرات الكويت",
      "مذكرة و مدرس",
      "فارس العلوم",
    ]
  },
};

// Dynamic SEO for grade pages
export function getGradeSEO(gradeName: string): SEOConfig {
  return {
    title: `مذكرات ${gradeName} في الكويت`,
    description: `مذكرات وملخصات ومراجعات ${gradeName} الثانوي في الكويت - كيمياء، أحياء، فيزياء، جيولوجيا. مراجعات شاملة، نماذج اختبارات سابقة، ملخصات الفاينل والقصير. إعداد فارس العلوم`,
    keywords: [
      `مذكرات ${gradeName} الكويت`,
      `ملخصات ${gradeName} الكويت`,
      `مراجعات ${gradeName} الكويت`,
      `اختبارات ${gradeName} الكويت`,
      `نماذج ${gradeName} الكويت`,
      `كيمياء ${gradeName} الكويت`,
      `أحياء ${gradeName} الكويت`,
      `فيزياء ${gradeName} الكويت`,
      `جيولوجيا ${gradeName} الكويت`,
      "مذكرات ثانوي الكويت",
      "فارس العلوم",
      "مذكرة و مدرس",
    ]
  };
}

// Dynamic SEO for subject pages
export function getSubjectSEO(subjectName: string, gradeName: string, semesterName: string): SEOConfig {
  return {
    title: `مذكرات ${subjectName} - ${gradeName} - ${semesterName}`,
    description: `مذكرات وملخصات ${subjectName} ${gradeName} ${semesterName} في الكويت - ملخصات شرح، مراجعات قصير وفاينل، نماذج اختبارات سابقة، الكتاب المدرسي. إعداد فارس العلوم`,
    keywords: [
      `مذكرة ${subjectName} ${gradeName} الكويت`,
      `ملخص ${subjectName} ${gradeName} الكويت`,
      `مراجعة ${subjectName} ${gradeName} الكويت`,
      `شرح ${subjectName} ${gradeName} الكويت`,
      `اختبارات ${subjectName} ${gradeName} الكويت`,
      `${subjectName} ${semesterName} الكويت`,
      `نماذج ${subjectName} الكويت`,
      "مذكرات ثانوي الكويت",
      "فارس العلوم",
      "مذكرة و مدرس",
    ]
  };
}

// Dynamic SEO for category content pages
export function getCategorySEO(categoryName: string, subjectName: string, gradeName: string): SEOConfig {
  return {
    title: `${categoryName} - ${subjectName} - ${gradeName}`,
    description: `${categoryName} مادة ${subjectName} ${gradeName} في الكويت - تحميل ومعاينة مجاناً. مذكرات وملخصات شاملة للمنهج الكويتي. إعداد فارس العلوم`,
    keywords: [
      `${categoryName} ${subjectName} ${gradeName} الكويت`,
      `تحميل ${categoryName} ${subjectName} الكويت`,
      `${subjectName} ${gradeName} الكويت`,
      `مذكرة ${subjectName} الكويت`,
      "مذكرات ثانوي الكويت",
      "تحميل مذكرات الكويت",
      "فارس العلوم",
      "مذكرة و مدرس",
    ]
  };
}

// Dynamic SEO for semester pages
export function getSemesterSEO(gradeName: string, semesterName: string): SEOConfig {
  return {
    title: `مذكرات ${gradeName} - ${semesterName} في الكويت`,
    description: `مذكرات وملخصات ${gradeName} ${semesterName} في الكويت - كيمياء، أحياء، فيزياء، جيولوجيا. مراجعات شاملة ونماذج اختبارات. إعداد فارس العلوم`,
    keywords: [
      `مذكرات ${gradeName} ${semesterName} الكويت`,
      `ملخصات ${gradeName} ${semesterName} الكويت`,
      `مراجعات ${gradeName} ${semesterName} الكويت`,
      `${gradeName} ${semesterName} الكويت`,
      "مذكرات ثانوي الكويت",
      "فارس العلوم",
      "مذكرة و مدرس",
    ]
  };
}
