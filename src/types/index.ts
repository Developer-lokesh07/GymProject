export interface SiteMeta {
  title: string;
  description: string;
}

export interface ContactInfo {
  phone: string;
  whatsappUrl: string;
  address: string;
  instagram: string;
  instagramUrl: string;
  mapUrl: string;
}

export interface HeroData {
  eyebrow: string;
  titleLines: string[];
  subtitle: string;
  stats: { value: string; suffix: string; label: string }[];
  badge: { rating: string; stars: string; text: string };
}

export interface StatsBannerItem {
  target: number;
  isDecimal: boolean;
  suffix: string;
  label: string;
}

export interface AboutFeature {
  icon: string;
  title: string;
  description: string;
}

export interface AboutData {
  eyebrow: string;
  titleHtml: string;
  paragraphs: string[];
  features: AboutFeature[];
  badge: { rating: string; text: string };
}

export interface TimingsBatch {
  name: string;
  time: string;
  note: string;
  isActive: boolean;
}

export interface TimingsData {
  eyebrow: string;
  titleHtml: string;
  description: string;
  batches: TimingsBatch[];
  closedNote: string;
}

export interface FacilityItem {
  num: string;
  icon: string;
  title: string;
  desc: string;
  badge: string;
}

export interface FacilitiesData {
  eyebrow: string;
  titleHtml: string;
  items: FacilityItem[];
}

export interface PricingPlan {
  planType: string;
  name: string;
  amount: string;
  per: string;
  features: string[];
  isFeatured: boolean;
  ctaText: string;
  value: string;
}

export interface PricingData {
  eyebrow: string;
  titleHtml: string;
  subtitle: string;
  plans: PricingPlan[];
}

export interface BmiData {
  eyebrow: string;
  titleHtml: string;
  description: string;
}

export interface ReviewItem {
  stars: string;
  quote: string;
  authorInitials: string;
  authorName: string;
  date: string;
}

export interface ReviewsData {
  eyebrow: string;
  titleHtml: string;
  overall: { rating: string; stars: string; count: string };
  items: ReviewItem[];
}

export interface ContactData {
  eyebrow: string;
  titleHtml: string;
  formOptions: {
    batches: string[];
    goals: string[];
    plans: string[];
  };
}

export interface FooterData {
  brandDesc: string;
  links: Record<string, { name: string; url: string }[]>;
  copy: string;
}

export interface LandingPageData {
  siteMeta: SiteMeta;
  contactInfo: ContactInfo;
  hero: HeroData;
  marquee: string[];
  statsBanner: StatsBannerItem[];
  about: AboutData;
  timings: TimingsData;
  facilities: FacilitiesData;
  pricing: PricingData;
  bmi: BmiData;
  reviews: ReviewsData;
  contactOptions: ContactData;
  footer: FooterData;
}
