/*
  # Create Booking System Schema

  ## 1. New Tables
  
  ### `profiles`
  - `id` (uuid, primary key, references auth.users)
  - `role` (text) - 'business_owner' or 'client'
  - `full_name` (text) - User's full name
  - `phone` (text) - Phone number
  - `avatar_url` (text) - Profile picture URL
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### `companies`
  - `id` (uuid, primary key)
  - `owner_id` (uuid, references auth.users)
  - `name` (text) - Company name
  - `description` (text) - Company description
  - `contact_email` (text) - Contact email
  - `contact_phone` (text) - Contact phone
  - `logo_url` (text) - Logo URL
  - `address` (text) - Physical address
  - `city` (text) - City
  - `category` (text) - Business category
  - `tags` (text[]) - Searchable keywords and categories
  - `is_active` (boolean) - Active status
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### `services`
  - `id` (uuid, primary key)
  - `company_id` (uuid, references companies)
  - `name` (text) - Service name
  - `description` (text) - Service description
  - `price` (numeric) - Service price
  - `duration_minutes` (integer) - Duration in minutes
  - `is_active` (boolean) - Active status
  - `created_at` (timestamptz)

  ### `schedules`
  - `id` (uuid, primary key)
  - `company_id` (uuid, references companies)
  - `day_of_week` (integer) - 0-6 (Sunday-Saturday)
  - `start_time` (time) - Opening time
  - `end_time` (time) - Closing time
  - `is_active` (boolean) - Active status

  ### `schedule_exceptions`
  - `id` (uuid, primary key)
  - `company_id` (uuid, references companies)
  - `date` (date) - Exception date
  - `is_closed` (boolean) - Closed or custom hours
  - `start_time` (time) - Custom start time
  - `end_time` (time) - Custom end time
  - `reason` (text) - Reason for exception

  ### `bookings`
  - `id` (uuid, primary key)
  - `company_id` (uuid, references companies)
  - `service_id` (uuid, references services)
  - `client_user_id` (uuid, references auth.users, nullable)
  - `client_name` (text) - Client name
  - `client_email` (text) - Client email
  - `client_phone` (text) - Client phone
  - `booking_date` (date) - Booking date
  - `start_time` (time) - Start time
  - `end_time` (time) - End time
  - `status` (text) - pending, confirmed, cancelled, completed
  - `notes` (text) - Additional notes
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### `notifications`
  - `id` (uuid, primary key)
  - `company_id` (uuid, references companies)
  - `booking_id` (uuid, references bookings, nullable)
  - `recipient_email` (text) - Recipient email
  - `recipient_phone` (text) - Recipient phone
  - `type` (text) - confirmation, reminder, cancellation
  - `channel` (text) - email, sms, both
  - `sent_at` (timestamptz)
  - `created_at` (timestamptz)

  ## 2. Security
  - Enable RLS on all tables
  - Profiles: Users can manage their own profile
  - Company owners can manage their own companies, services, schedules, and bookings
  - Clients can view active companies and services
  - Clients can create bookings and view their own bookings
  - Authenticated users can view their relevant data

  ## 3. Search & Filtering
  - Companies have tags array for flexible categorization
  - Search function filters by name, description, category, tags, and city
  - GIN index on tags for efficient array searching
*/

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'client' CHECK (role IN ('business_owner', 'client')),
  full_name text NOT NULL,
  phone text DEFAULT '',
  avatar_url text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Companies table
CREATE TABLE IF NOT EXISTS companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid REFERENCES auth.users NOT NULL,
  name text NOT NULL,
  description text DEFAULT '',
  contact_email text NOT NULL,
  contact_phone text DEFAULT '',
  logo_url text DEFAULT '',
  address text DEFAULT '',
  city text DEFAULT '',
  category text DEFAULT '',
  tags text[] DEFAULT '{}',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Company owners can view their companies"
  ON companies FOR SELECT
  TO authenticated
  USING (auth.uid() = owner_id);

CREATE POLICY "Company owners can insert their companies"
  ON companies FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Company owners can update their companies"
  ON companies FOR UPDATE
  TO authenticated
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Clients can view active companies"
  ON companies FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Services table
CREATE TABLE IF NOT EXISTS services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  description text DEFAULT '',
  price numeric(10,2) NOT NULL DEFAULT 0,
  duration_minutes integer NOT NULL DEFAULT 60,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Company owners can view their services"
  ON services FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM companies
      WHERE companies.id = services.company_id
      AND companies.owner_id = auth.uid()
    )
  );

CREATE POLICY "Company owners can insert their services"
  ON services FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM companies
      WHERE companies.id = services.company_id
      AND companies.owner_id = auth.uid()
    )
  );

CREATE POLICY "Company owners can update their services"
  ON services FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM companies
      WHERE companies.id = services.company_id
      AND companies.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM companies
      WHERE companies.id = services.company_id
      AND companies.owner_id = auth.uid()
    )
  );

CREATE POLICY "Company owners can delete their services"
  ON services FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM companies
      WHERE companies.id = services.company_id
      AND companies.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can view active services"
  ON services FOR SELECT
  TO authenticated
  USING (
    is_active = true AND
    EXISTS (
      SELECT 1 FROM companies
      WHERE companies.id = services.company_id
      AND companies.is_active = true
    )
  );

-- Schedules table
CREATE TABLE IF NOT EXISTS schedules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies ON DELETE CASCADE NOT NULL,
  day_of_week integer NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time time NOT NULL,
  end_time time NOT NULL,
  is_active boolean DEFAULT true,
  UNIQUE(company_id, day_of_week)
);

ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Company owners can view their schedules"
  ON schedules FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM companies
      WHERE companies.id = schedules.company_id
      AND companies.owner_id = auth.uid()
    )
  );

CREATE POLICY "Company owners can insert their schedules"
  ON schedules FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM companies
      WHERE companies.id = schedules.company_id
      AND companies.owner_id = auth.uid()
    )
  );

CREATE POLICY "Company owners can update their schedules"
  ON schedules FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM companies
      WHERE companies.id = schedules.company_id
      AND companies.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM companies
      WHERE companies.id = schedules.company_id
      AND companies.owner_id = auth.uid()
    )
  );

CREATE POLICY "Company owners can delete their schedules"
  ON schedules FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM companies
      WHERE companies.id = schedules.company_id
      AND companies.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can view active schedules"
  ON schedules FOR SELECT
  TO authenticated
  USING (
    is_active = true AND
    EXISTS (
      SELECT 1 FROM companies
      WHERE companies.id = schedules.company_id
      AND companies.is_active = true
    )
  );

-- Schedule exceptions table
CREATE TABLE IF NOT EXISTS schedule_exceptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies ON DELETE CASCADE NOT NULL,
  date date NOT NULL,
  is_closed boolean DEFAULT false,
  start_time time,
  end_time time,
  reason text DEFAULT '',
  UNIQUE(company_id, date)
);

ALTER TABLE schedule_exceptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Company owners can view their schedule exceptions"
  ON schedule_exceptions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM companies
      WHERE companies.id = schedule_exceptions.company_id
      AND companies.owner_id = auth.uid()
    )
  );

CREATE POLICY "Company owners can insert their schedule exceptions"
  ON schedule_exceptions FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM companies
      WHERE companies.id = schedule_exceptions.company_id
      AND companies.owner_id = auth.uid()
    )
  );

CREATE POLICY "Company owners can update their schedule exceptions"
  ON schedule_exceptions FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM companies
      WHERE companies.id = schedule_exceptions.company_id
      AND companies.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM companies
      WHERE companies.id = schedule_exceptions.company_id
      AND companies.owner_id = auth.uid()
    )
  );

CREATE POLICY "Company owners can delete their schedule exceptions"
  ON schedule_exceptions FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM companies
      WHERE companies.id = schedule_exceptions.company_id
      AND companies.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can view schedule exceptions"
  ON schedule_exceptions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM companies
      WHERE companies.id = schedule_exceptions.company_id
      AND companies.is_active = true
    )
  );

-- Bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies ON DELETE CASCADE NOT NULL,
  service_id uuid REFERENCES services ON DELETE CASCADE NOT NULL,
  client_user_id uuid REFERENCES auth.users,
  client_name text NOT NULL,
  client_email text NOT NULL,
  client_phone text DEFAULT '',
  booking_date date NOT NULL,
  start_time time NOT NULL,
  end_time time NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Company owners can view their bookings"
  ON bookings FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM companies
      WHERE companies.id = bookings.company_id
      AND companies.owner_id = auth.uid()
    )
  );

CREATE POLICY "Company owners can update their bookings"
  ON bookings FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM companies
      WHERE companies.id = bookings.company_id
      AND companies.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM companies
      WHERE companies.id = bookings.company_id
      AND companies.owner_id = auth.uid()
    )
  );

CREATE POLICY "Clients can create bookings"
  ON bookings FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Clients can view their own bookings"
  ON bookings FOR SELECT
  TO authenticated
  USING (client_user_id = auth.uid());

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies ON DELETE CASCADE NOT NULL,
  booking_id uuid REFERENCES bookings ON DELETE CASCADE,
  recipient_email text NOT NULL,
  recipient_phone text DEFAULT '',
  type text NOT NULL CHECK (type IN ('confirmation', 'reminder', 'cancellation')),
  channel text NOT NULL CHECK (channel IN ('email', 'sms', 'both')),
  sent_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Company owners can view their notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM companies
      WHERE companies.id = notifications.company_id
      AND companies.owner_id = auth.uid()
    )
  );

CREATE POLICY "System can create notifications"
  ON notifications FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_companies_owner ON companies(owner_id);
CREATE INDEX IF NOT EXISTS idx_companies_active ON companies(is_active);
CREATE INDEX IF NOT EXISTS idx_companies_tags ON companies USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_companies_city ON companies(city);
CREATE INDEX IF NOT EXISTS idx_services_company ON services(company_id);
CREATE INDEX IF NOT EXISTS idx_schedules_company ON schedules(company_id);
CREATE INDEX IF NOT EXISTS idx_bookings_company ON bookings(company_id);
CREATE INDEX IF NOT EXISTS idx_bookings_client ON bookings(client_user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings(booking_date);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);

-- Create a function to search companies by tags and location
CREATE OR REPLACE FUNCTION search_companies(
  search_query text DEFAULT '',
  filter_tags text[] DEFAULT '{}',
  filter_city text DEFAULT ''
)
RETURNS TABLE (
  id uuid,
  owner_id uuid,
  name text,
  description text,
  contact_email text,
  contact_phone text,
  logo_url text,
  address text,
  city text,
  category text,
  tags text[],
  is_active boolean,
  created_at timestamptz,
  updated_at timestamptz
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    c.owner_id,
    c.name,
    c.description,
    c.contact_email,
    c.contact_phone,
    c.logo_url,
    c.address,
    c.city,
    c.category,
    c.tags,
    c.is_active,
    c.created_at,
    c.updated_at
  FROM companies c
  WHERE c.is_active = true
    AND (
      search_query = '' 
      OR c.name ILIKE '%' || search_query || '%'
      OR c.description ILIKE '%' || search_query || '%'
      OR c.category ILIKE '%' || search_query || '%'
      OR EXISTS (
        SELECT 1 FROM unnest(c.tags) AS tag
        WHERE tag ILIKE '%' || search_query || '%'
      )
    )
    AND (
      cardinality(filter_tags) = 0
      OR c.tags && filter_tags
    )
    AND (
      filter_city = ''
      OR c.city ILIKE '%' || filter_city || '%'
    )
  ORDER BY c.created_at DESC;
END;
$$ LANGUAGE plpgsql;
