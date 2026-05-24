/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from 'express';
import pool from '../config/db.js';

export async function getLandingPageData(req: Request, res: Response): Promise<void> {
  try {
    // 1. Fetch site settings
    const [settingsRows] = await pool.query('SELECT * FROM site_settings');
    const settings = settingsRows as any[];
    const settingsMap = new Map(settings.map(s => [s.setting_key, s.setting_value]));

    const siteMeta = {
      title: settingsMap.get('siteMeta_title') || '',
      description: settingsMap.get('siteMeta_description') || '',
    };

    const contactInfo = {
      phone: settingsMap.get('contactInfo_phone') || '',
      whatsappUrl: settingsMap.get('contactInfo_whatsappUrl') || '',
      address: settingsMap.get('contactInfo_address') || '',
      instagram: settingsMap.get('contactInfo_instagram') || '',
      instagramUrl: settingsMap.get('contactInfo_instagramUrl') || '',
      mapUrl: settingsMap.get('contactInfo_mapUrl') || '',
    };

    // 2. Fetch Hero
    const [heroRows] = await pool.query('SELECT * FROM hero LIMIT 1');
    const heroRow = (heroRows as any[])[0] || {};
    
    const [heroStatsRows] = await pool.query('SELECT * FROM hero_stats ORDER BY display_order');
    const heroStats = (heroStatsRows as any[]).map(s => ({
      value: s.value,
      suffix: s.suffix,
      label: s.label
    }));

    const hero = {
      eyebrow: heroRow.eyebrow || '',
      titleLines: [heroRow.title_line1 || '', heroRow.title_line2 || '', heroRow.title_line3 || ''],
      subtitle: heroRow.subtitle || '',
      stats: heroStats,
      badge: {
        rating: heroRow.badge_rating || '',
        stars: heroRow.badge_stars || '',
        text: heroRow.badge_text || '',
      }
    };

    // 3. Fetch Marquee
    const [marqueeRows] = await pool.query('SELECT * FROM marquee ORDER BY display_order');
    const marquee = (marqueeRows as any[]).map(m => m.text);

    // 4. Fetch Stats Banner
    const [statsBannerRows] = await pool.query('SELECT * FROM stats_banner ORDER BY display_order');
    const statsBanner = (statsBannerRows as any[]).map(sb => ({
      target: parseFloat(sb.target),
      isDecimal: Boolean(sb.is_decimal),
      suffix: sb.suffix,
      label: sb.label
    }));

    // 5. Fetch About
    const [aboutRows] = await pool.query('SELECT * FROM about LIMIT 1');
    const aboutRow = (aboutRows as any[])[0] || {};

    const [paragraphsRows] = await pool.query('SELECT * FROM about_paragraphs ORDER BY display_order');
    const paragraphs = (paragraphsRows as any[]).map(p => p.paragraph_text);

    const [aboutFeaturesRows] = await pool.query('SELECT * FROM about_features ORDER BY display_order');
    const aboutFeatures = (aboutFeaturesRows as any[]).map(f => ({
      icon: f.icon,
      title: f.title,
      description: f.description
    }));

    const about = {
      eyebrow: aboutRow.eyebrow || '',
      titleHtml: aboutRow.title_html || '',
      paragraphs,
      features: aboutFeatures,
      badge: {
        rating: aboutRow.badge_rating || '',
        text: aboutRow.badge_text || ''
      }
    };

    // 6. Fetch Timings & Batches
    const [timingsRows] = await pool.query('SELECT * FROM timings LIMIT 1');
    const timingsRow = (timingsRows as any[])[0] || {};

    const [batchesRows] = await pool.query('SELECT * FROM batches ORDER BY display_order');
    const batches = (batchesRows as any[]).map(b => ({
      name: b.name,
      time: b.time_range,
      note: b.note,
      isActive: Boolean(b.is_active)
    }));

    const timings = {
      eyebrow: timingsRow.eyebrow || '',
      titleHtml: timingsRow.title_html || '',
      description: timingsRow.description || '',
      batches,
      closedNote: timingsRow.closed_note || settingsMap.get('timings_closedNote') || ''
    };

    // 7. Fetch Facilities
    const [facilitiesRows] = await pool.query('SELECT * FROM facilities ORDER BY display_order');
    const facilitiesList = (facilitiesRows as any[]).map(f => ({
      num: f.num,
      icon: f.icon,
      title: f.title,
      desc: f.description,
      badge: f.badge
    }));
    const facilities = {
      eyebrow: settingsMap.get('facilities_eyebrow') || 'What We Offer',
      titleHtml: settingsMap.get('facilities_titleHtml') || 'World-Class<br><em>Facilities.</em>',
      items: facilitiesList
    };

    // 8. Fetch Pricing & Plans
    const [pricingRows] = await pool.query('SELECT * FROM pricing LIMIT 1');
    const pricingRow = (pricingRows as any[])[0] || {};

    const [plansRows] = await pool.query('SELECT * FROM pricing_plans ORDER BY display_order');
    const plans = plansRows as any[];

    const [featuresRows] = await pool.query('SELECT * FROM pricing_features ORDER BY display_order');
    const featuresList = featuresRows as any[];

    const formattedPlans = plans.map(p => {
      const planFeatures = featuresList
        .filter(f => f.plan_id === p.id)
        .map(f => f.feature_text);
      return {
        planType: p.plan_type,
        name: p.name,
        amount: p.amount,
        per: p.per,
        features: planFeatures,
        isFeatured: Boolean(p.is_featured),
        ctaText: p.cta_text,
        value: p.plan_value
      };
    });

    const pricing = {
      eyebrow: pricingRow.eyebrow || '',
      titleHtml: pricingRow.title_html || '',
      subtitle: pricingRow.subtitle || '',
      plans: formattedPlans
    };

    // 9. Fetch BMI Tool Copy
    const [bmiRows] = await pool.query('SELECT * FROM bmi_info LIMIT 1');
    const bmiRow = (bmiRows as any[])[0] || {};
    const bmi = {
      eyebrow: bmiRow.eyebrow || '',
      titleHtml: bmiRow.title_html || '',
      description: bmiRow.description || ''
    };

    // 10. Fetch Reviews Section
    const [reviewsInfoRows] = await pool.query('SELECT * FROM reviews_info LIMIT 1');
    const reviewsInfo = (reviewsInfoRows as any[])[0] || {};

    const [reviewsRows] = await pool.query('SELECT * FROM reviews ORDER BY display_order');
    const reviewsList = (reviewsRows as any[]).map(r => ({
      stars: r.stars,
      quote: r.quote,
      authorInitials: r.author_initials,
      authorName: r.author_name,
      date: r.date_label
    }));

    const reviews = {
      eyebrow: reviewsInfo.eyebrow || '',
      titleHtml: reviewsInfo.title_html || '',
      overall: {
        rating: reviewsInfo.overall_rating || '',
        stars: reviewsInfo.overall_stars || '',
        count: reviewsInfo.overall_count || ''
      },
      items: reviewsList
    };

    // 11. Fetch Contact Copy & Dropdowns
    const contactOptions = {
      eyebrow: settingsMap.get('contactOptions_eyebrow') || 'Get in Touch',
      titleHtml: settingsMap.get('contactOptions_titleHtml') || "Come Visit.<br><em>We'll Show You Around.</em>",
      formOptions: {
        batches: batches.map(b => `${b.name} (${b.time})`).concat('Either works'),
        plans: formattedPlans.map(p => p.value).concat('Free Trial First'),
        goals: settingsMap.get('contactOptions_goals')
          ? JSON.parse(settingsMap.get('contactOptions_goals')!)
          : [
              'Weight Loss',
              'Build Muscle',
              'Improve Fitness & Stamina',
              'Sports Performance',
              'General Health & Wellbeing'
            ]
      }
    };

    // 12. Fetch Footer
    const exploreLinks = settingsMap.get('footer_exploreLinks')
      ? JSON.parse(settingsMap.get('footer_exploreLinks')!)
      : [
          { name: 'About Us', url: '#about' },
          { name: 'Facilities', url: '#facilities' },
          { name: 'Timings', url: '#timings' },
          { name: 'Membership', url: '#pricing' },
          { name: 'Reviews', url: '#reviews' }
        ];

    const programLinks = settingsMap.get('footer_programLinks')
      ? JSON.parse(settingsMap.get('footer_programLinks')!)
      : [
          { name: 'Weight Loss', url: '#contact' },
          { name: 'Muscle Building', url: '#contact' },
          { name: 'Personal Training', url: '#contact' },
          { name: 'Diet Consultation', url: '#contact' },
          { name: 'Steam Therapy', url: '#contact' }
        ];

    const footer = {
      brandDesc: settingsMap.get('footer_brandDesc') || 'Jalgaon\'s #1 premium fitness hub. Advanced equipment, certified trainers, fully AC with steam room — everything you need, all under one roof.',
      links: {
        'Explore': exploreLinks,
        'Programs': programLinks
      },
      copy: settingsMap.get('footer_copy') || '© 2026 Conqueror Fitness Hub, Jalgaon. All rights reserved.'
    };

    // Construct the payload matching landingPageData.json structure
    const payload = {
      siteMeta,
      contactInfo,
      hero,
      marquee,
      statsBanner,
      about,
      timings,
      facilities,
      pricing,
      bmi,
      reviews,
      contactOptions,
      footer
    };

    res.json(payload);
  } catch (error) {
    console.error('Error fetching landing page data:', error);
    res.status(500).json({ error: 'Failed to compile landing page data from database.' });
  }
}

