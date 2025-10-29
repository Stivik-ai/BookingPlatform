# BookingPlatform - Multi-Tenant Booking System

A subscription-based booking platform that enables businesses to manage their services, schedules, and customer reservations.

## Features

- **Multi-tenant Architecture**: Each business has its own isolated profile and data
- **Role-based Access Control**: Admin, Company, and Client roles with appropriate permissions
- **Subscription Management**: Monthly subscription plans for businesses
- **Service Management**: Companies can create and manage their service offerings
- **Schedule Management**: Flexible scheduling with regular hours and exceptions
- **Online Booking**: Clients can browse companies and book appointments
- **Reservation Management**: Track and manage bookings with status updates

## Database Setup

1. Go to your Supabase project SQL Editor
2. Copy the contents of `database-setup.sql`
3. Execute the SQL to create all tables, policies, and indexes

The database includes:
- `profiles` - User profiles with role information
- `companies` - Business profiles with subscription status
- `services` - Service offerings with pricing
- `schedules` - Regular working hours (day_of_week based)
- `schedule_exceptions` - Holidays and special hours
- `reservations` - Customer bookings
- `payments` - Subscription payment records
- `notifications` - Email/SMS notification log

## Tech Stack

- **Frontend**: React + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Icons**: Lucide React

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up your environment variables (already configured in `.env`):
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

3. Set up the database using the SQL file provided

4. Start the development server (automatic)

## User Roles

### Client
- Browse active companies
- View services and schedules
- Make reservations
- View own booking history

### Company Owner
- Create and manage company profile
- Add and configure services
- Set working hours and exceptions
- Manage reservations
- View subscription status
- Access analytics dashboard

### Admin
- Manage all companies
- View platform statistics
- Handle subscriptions and payments
- Access system-wide settings

## Subscription Model

Companies pay a monthly subscription (20 PLN) to:
- Maintain an active profile
- Accept online bookings
- Access management dashboard
- Receive notifications

## Security

- Row Level Security (RLS) enabled on all tables
- Companies can only access their own data
- Clients can only view their own reservations
- Authentication required for all sensitive operations

## Future Enhancements

- Email/SMS notifications integration (SendGrid, Twilio)
- Payment gateway integration (PayU, Przelewy24)
- Multi-language support
- Customer reviews and ratings
- Advanced analytics and reporting
- Calendar integrations (Google Calendar, etc.)
- Mobile applications
