/*
  # TechLookup Database Schema

  1. New Tables
    - `websites`
      - `id` (uuid, primary key)
      - `url` (text, unique)
      - `last_scraped` (timestamp)
    - `technologies`
      - `id` (uuid, primary key)
      - `name` (text, unique)
      - `category` (text)
    - `website_technologies`
      - `website_id` (uuid, foreign key)
      - `technology_id` (uuid, foreign key)
      - Primary key on both fields

  2. Security
    - Enable RLS on all tables
    - Add policies for public read access
    - Add policies for authenticated write access

  3. Indexes
    - Add indexes for performance on commonly queried fields
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create websites table
CREATE TABLE IF NOT EXISTS websites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  url TEXT NOT NULL UNIQUE,
  last_scraped TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create technologies table
CREATE TABLE IF NOT EXISTS technologies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  category TEXT DEFAULT 'Other',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create junction table for many-to-many relationship
CREATE TABLE IF NOT EXISTS website_technologies (
  website_id UUID REFERENCES websites(id) ON DELETE CASCADE,
  technology_id UUID REFERENCES technologies(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (website_id, technology_id)
);

-- Enable Row Level Security
ALTER TABLE websites ENABLE ROW LEVEL SECURITY;
ALTER TABLE technologies ENABLE ROW LEVEL SECURITY;
ALTER TABLE website_technologies ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Allow public read access to websites"
  ON websites
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public read access to technologies"
  ON technologies
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public read access to website_technologies"
  ON website_technologies
  FOR SELECT
  TO public
  USING (true);

-- Create policies for authenticated write access
CREATE POLICY "Allow authenticated insert to websites"
  ON websites
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated update to websites"
  ON websites
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated insert to technologies"
  ON technologies
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated insert to website_technologies"
  ON website_technologies
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_websites_url ON websites(url);
CREATE INDEX IF NOT EXISTS idx_websites_last_scraped ON websites(last_scraped DESC);
CREATE INDEX IF NOT EXISTS idx_technologies_name ON technologies(name);
CREATE INDEX IF NOT EXISTS idx_technologies_category ON technologies(category);
CREATE INDEX IF NOT EXISTS idx_website_technologies_website_id ON website_technologies(website_id);
CREATE INDEX IF NOT EXISTS idx_website_technologies_technology_id ON website_technologies(technology_id);

-- Insert some initial technology categories and popular technologies
INSERT INTO technologies (name, category) VALUES
  ('React', 'JavaScript Framework'),
  ('Vue.js', 'JavaScript Framework'),
  ('Angular', 'JavaScript Framework'),
  ('Next.js', 'React Framework'),
  ('Nuxt.js', 'Vue Framework'),
  ('WordPress', 'CMS'),
  ('Shopify', 'E-commerce'),
  ('WooCommerce', 'E-commerce'),
  ('Google Analytics', 'Analytics'),
  ('Google Tag Manager', 'Analytics'),
  ('Cloudflare', 'CDN'),
  ('AWS CloudFront', 'CDN'),
  ('Tailwind CSS', 'CSS Framework'),
  ('Bootstrap', 'CSS Framework'),
  ('jQuery', 'JavaScript Library'),
  ('Node.js', 'Runtime'),
  ('PHP', 'Programming Language'),
  ('Python', 'Programming Language'),
  ('Webpack', 'Build Tool'),
  ('Vite', 'Build Tool'),
  ('Vercel', 'Hosting'),
  ('Netlify', 'Hosting'),
  ('Stripe', 'Payment Processing'),
  ('PayPal', 'Payment Processing'),
  ('Mailchimp', 'Email Marketing'),
  ('SendGrid', 'Email Service'),
  ('Hotjar', 'User Analytics'),
  ('Intercom', 'Customer Support'),
  ('Zendesk', 'Customer Support'),
  ('Prisma', 'Database ORM')
ON CONFLICT (name) DO NOTHING;