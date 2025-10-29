/*
  # Create Booking System Schema

  ## 1. New Tables
  
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
  - Company owners can manage their own companies, services, schedules, and bookings
  - Clients can view active companies and services
  - Clients can create bookings and view their own bookings
  - Authenticated users can view their relevant data
*/

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

CREATE POLICY "Company owners can manage their services"
  ON services FOR ALL
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

CREATE POLICY "Company owners can manage their schedules"
  ON schedules FOR ALL
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

CREATE POLICY "Company owners can manage their schedule exceptions"
  ON schedule_exceptions FOR ALL
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
CREATE INDEX IF NOT EXISTS idx_companies_owner ON companies(owner_id);
CREATE INDEX IF NOT EXISTS idx_companies_active ON companies(is_active);
CREATE INDEX IF NOT EXISTS idx_services_company ON services(company_id);
CREATE INDEX IF NOT EXISTS idx_schedules_company ON schedules(company_id);
CREATE INDEX IF NOT EXISTS idx_bookings_company ON bookings(company_id);
CREATE INDEX IF NOT EXISTS idx_bookings_client ON bookings(client_user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings(booking_date);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);