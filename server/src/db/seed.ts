/* eslint-disable @typescript-eslint/no-explicit-any */
import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import static page data to seed into DB
const staticDataPath = path.resolve(__dirname, '../../../src/data/landingPageData.json');
const pageData = JSON.parse(fs.readFileSync(staticDataPath, 'utf8'));

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'root',
};

async function seed() {
  console.log('🚀 Starting Database Migration and Seeding...');
  
  // 1. Establish connection to MySQL server
  const connection = await mysql.createConnection(dbConfig);
  
  // 2. Create and select the database
  console.log('📦 Creating database "gym_db" if not exists...');
  await connection.query('CREATE DATABASE IF NOT EXISTS gym_db;');
  await connection.query('USE gym_db;');
  
  // 3. Load and execute the schema.sql file
  console.log('📜 Executing schema.sql to initialize tables...');
  const schemaPath = path.resolve(__dirname, 'schema.sql');
  const schemaSql = fs.readFileSync(schemaPath, 'utf8');
  
  // Split multiple SQL statements by semicolon
  const statements = schemaSql
    .split(/;\s*$/m)
    .map(stmt => stmt.trim())
    .filter(stmt => stmt.length > 0);
    
  for (const statement of statements) {
    await connection.query(statement);
  }
  console.log('✅ Tables created successfully!');

  // 4. Seed Default Admin User
  console.log('👤 Seeding default admin user...');
  const [users] = await connection.query('SELECT * FROM users WHERE username = ?', ['admin']);
  if ((users as any[]).length === 0) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('adminpassword', salt);
    await connection.query(
      'INSERT INTO users (username, password, email, role) VALUES (?, ?, ?, ?)',
      ['admin', hashedPassword, 'admin@conquerorfitness.com', 'admin']
    );
    console.log('✅ Admin user created! Username: "admin", Password: "adminpassword"');
  } else {
    console.log('ℹ️ Admin user already exists. Skipping...');
  }

  // 5. Seed Site Settings (meta & contact info)
  console.log('⚙️ Seeding site settings...');
  await connection.query('DELETE FROM site_settings;');
  const settings = [
    { key: 'siteMeta_title', val: pageData.siteMeta.title, cat: 'meta' },
    { key: 'siteMeta_description', val: pageData.siteMeta.description, cat: 'meta' },
    { key: 'contactInfo_phone', val: pageData.contactInfo.phone, cat: 'contact' },
    { key: 'contactInfo_whatsappUrl', val: pageData.contactInfo.whatsappUrl, cat: 'contact' },
    { key: 'contactInfo_address', val: pageData.contactInfo.address, cat: 'contact' },
    { key: 'contactInfo_instagram', val: pageData.contactInfo.instagram, cat: 'contact' },
    { key: 'contactInfo_instagramUrl', val: pageData.contactInfo.instagramUrl, cat: 'contact' },
    { key: 'contactInfo_mapUrl', val: pageData.contactInfo.mapUrl, cat: 'contact' },
    { key: 'timings_closedNote', val: pageData.timings.closedNote, cat: 'timings' },
    { key: 'contactOptions_eyebrow', val: pageData.contactOptions.eyebrow, cat: 'contactOptions' },
    { key: 'contactOptions_titleHtml', val: pageData.contactOptions.titleHtml, cat: 'contactOptions' },
    { key: 'contactOptions_goals', val: JSON.stringify(pageData.contactOptions.formOptions.goals), cat: 'contactOptions' },
    { key: 'footer_brandDesc', val: pageData.footer.brandDesc, cat: 'footer' },
    { key: 'footer_copy', val: pageData.footer.copy, cat: 'footer' },
    { key: 'footer_exploreLinks', val: JSON.stringify(pageData.footer.links.Explore), cat: 'footer' },
    { key: 'footer_programLinks', val: JSON.stringify(pageData.footer.links.Programs), cat: 'footer' }
  ];
  for (const s of settings) {
    await connection.query(
      'INSERT INTO site_settings (setting_key, setting_value, category) VALUES (?, ?, ?)',
      [s.key, s.val, s.cat]
    );
  }

  // 6. Seed Hero Details
  console.log('⚡ Seeding Hero section...');
  await connection.query('DELETE FROM hero;');
  await connection.query(
    `INSERT INTO hero (id, eyebrow, subtitle, title_line1, title_line2, title_line3, badge_rating, badge_stars, badge_text)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      1,
      pageData.hero.eyebrow,
      pageData.hero.subtitle,
      pageData.hero.titleLines[0],
      pageData.hero.titleLines[1],
      pageData.hero.titleLines[2],
      pageData.hero.badge.rating,
      pageData.hero.badge.stars,
      pageData.hero.badge.text
    ]
  );

  // 7. Seed Hero Stats
  await connection.query('DELETE FROM hero_stats;');
  for (let i = 0; i < pageData.hero.stats.length; i++) {
    const s = pageData.hero.stats[i];
    await connection.query(
      'INSERT INTO hero_stats (value, suffix, label, display_order) VALUES (?, ?, ?, ?)',
      [s.value, s.suffix, s.label, i]
    );
  }

  // 8. Seed Marquee
  console.log('🎗️ Seeding Marquee item list...');
  await connection.query('DELETE FROM marquee;');
  for (let i = 0; i < pageData.marquee.length; i++) {
    await connection.query(
      'INSERT INTO marquee (text, display_order) VALUES (?, ?)',
      [pageData.marquee[i], i]
    );
  }

  // 9. Seed Stats Banner
  console.log('📊 Seeding Stats banner metrics...');
  await connection.query('DELETE FROM stats_banner;');
  for (let i = 0; i < pageData.statsBanner.length; i++) {
    const sb = pageData.statsBanner[i];
    await connection.query(
      'INSERT INTO stats_banner (target, is_decimal, suffix, label, display_order) VALUES (?, ?, ?, ?, ?)',
      [sb.target, sb.isDecimal ? 1 : 0, sb.suffix, sb.label, i]
    );
  }

  // 10. Seed About Section
  console.log('💪 Seeding About section details...');
  await connection.query('DELETE FROM about;');
  await connection.query(
    `INSERT INTO about (id, eyebrow, title_html, badge_rating, badge_text) VALUES (?, ?, ?, ?, ?)`,
    [1, pageData.about.eyebrow, pageData.about.titleHtml, pageData.about.badge.rating, pageData.about.badge.text]
  );

  await connection.query('DELETE FROM about_paragraphs;');
  for (let i = 0; i < pageData.about.paragraphs.length; i++) {
    await connection.query(
      'INSERT INTO about_paragraphs (paragraph_text, display_order) VALUES (?, ?)',
      [pageData.about.paragraphs[i], i]
    );
  }

  await connection.query('DELETE FROM about_features;');
  for (let i = 0; i < pageData.about.features.length; i++) {
    const f = pageData.about.features[i];
    await connection.query(
      'INSERT INTO about_features (icon, title, description, display_order) VALUES (?, ?, ?, ?)',
      [f.icon, f.title, f.description, i]
    );
  }

  // 11. Seed Timings Section
  console.log('⏰ Seeding Timings & Batches details...');
  await connection.query('DELETE FROM timings;');
  await connection.query(
    `INSERT INTO timings (id, eyebrow, title_html, description, closed_note) VALUES (?, ?, ?, ?, ?)`,
    [1, pageData.timings.eyebrow, pageData.timings.titleHtml, pageData.timings.description, pageData.timings.closedNote]
  );

  await connection.query('DELETE FROM batches;');
  for (let i = 0; i < pageData.timings.batches.length; i++) {
    const b = pageData.timings.batches[i];
    await connection.query(
      'INSERT INTO batches (name, time_range, note, is_active, display_order) VALUES (?, ?, ?, ?, ?)',
      [b.name, b.time, b.note, b.isActive ? 1 : 0, i]
    );
  }

  // 12. Seed Facilities
  console.log('🏢 Seeding Facility offers...');
  await connection.query('DELETE FROM facilities;');
  for (let i = 0; i < pageData.facilities.items.length; i++) {
    const f = pageData.facilities.items[i];
    await connection.query(
      'INSERT INTO facilities (num, icon, title, description, badge, display_order) VALUES (?, ?, ?, ?, ?, ?)',
      [f.num, f.icon, f.title, f.desc, f.badge, i]
    );
  }

  // 13. Seed Pricing Section & Plans
  console.log('💳 Seeding Pricing & Membership plans...');
  await connection.query('DELETE FROM pricing;');
  await connection.query(
    `INSERT INTO pricing (id, eyebrow, title_html, subtitle) VALUES (?, ?, ?, ?)`,
    [1, pageData.pricing.eyebrow, pageData.pricing.titleHtml, pageData.pricing.subtitle]
  );

  await connection.query('DELETE FROM pricing_features;');
  await connection.query('DELETE FROM pricing_plans;');
  
  for (let i = 0; i < pageData.pricing.plans.length; i++) {
    const p = pageData.pricing.plans[i];
    const [result] = await connection.query(
      `INSERT INTO pricing_plans (plan_type, name, amount, per, is_featured, cta_text, plan_value, display_order)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
      [p.planType, p.name, p.amount, p.per, p.isFeatured ? 1 : 0, p.ctaText, p.value, i]
    );
    const planId = (result as any).insertId;

    for (let j = 0; j < p.features.length; j++) {
      await connection.query(
        'INSERT INTO pricing_features (plan_id, feature_text, display_order) VALUES (?, ?, ?)',
        [planId, p.features[j], j]
      );
    }
  }

  // 14. Seed BMI Copy
  console.log('🧮 Seeding BMI Section copy...');
  await connection.query('DELETE FROM bmi_info;');
  await connection.query(
    `INSERT INTO bmi_info (id, eyebrow, title_html, description) VALUES (?, ?, ?, ?)`,
    [1, pageData.bmi.eyebrow, pageData.bmi.titleHtml, pageData.bmi.description]
  );

  // 15. Seed Reviews Info & reviews
  console.log('⭐ Seeding Member reviews...');
  await connection.query('DELETE FROM reviews_info;');
  await connection.query(
    `INSERT INTO reviews_info (id, eyebrow, title_html, overall_rating, overall_stars, overall_count) VALUES (?, ?, ?, ?, ?, ?)`,
    [
      1,
      pageData.reviews.eyebrow,
      pageData.reviews.titleHtml,
      pageData.reviews.overall.rating,
      pageData.reviews.overall.stars,
      pageData.reviews.overall.count
    ]
  );

  await connection.query('DELETE FROM reviews;');
  for (let i = 0; i < pageData.reviews.items.length; i++) {
    const r = pageData.reviews.items[i];
    await connection.query(
      `INSERT INTO reviews (stars, quote, author_initials, author_name, date_label, display_order)
       VALUES (?, ?, ?, ?, ?, ?);`,
      [r.stars, r.quote, r.authorInitials, r.authorName, r.date, i]
    );
  }

  await connection.end();
  console.log('🎉 Seeding completed successfully!');
}

seed().catch(err => {
  console.error('❌ Error during seeding:', err);
  process.exit(1);
});
