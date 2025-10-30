export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type UserRole = 'business_owner' | 'client';

export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';
export type NotificationType = 'confirmation' | 'reminder' | 'cancellation';
export type NotificationChannel = 'email' | 'sms' | 'both';

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          role: UserRole;
          full_name: string;
          phone: string;
          avatar_url: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          role?: UserRole;
          full_name: string;
          phone?: string;
          avatar_url?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          role?: UserRole;
          full_name?: string;
          phone?: string;
          avatar_url?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      companies: {
        Row: {
          id: string;
          owner_id: string;
          name: string;
          description: string;
          contact_email: string;
          contact_phone: string;
          logo_url: string;
          address: string;
          city: string;
          category: string;
          tags: string[];
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          name: string;
          description?: string;
          contact_email: string;
          contact_phone?: string;
          logo_url?: string;
          address?: string;
          city?: string;
          category?: string;
          tags?: string[];
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          owner_id?: string;
          name?: string;
          description?: string;
          contact_email?: string;
          contact_phone?: string;
          logo_url?: string;
          address?: string;
          city?: string;
          category?: string;
          tags?: string[];
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      services: {
        Row: {
          id: string;
          company_id: string;
          name: string;
          description: string;
          price: number;
          duration_minutes: number;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          company_id: string;
          name: string;
          description?: string;
          price?: number;
          duration_minutes?: number;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          company_id?: string;
          name?: string;
          description?: string;
          price?: number;
          duration_minutes?: number;
          is_active?: boolean;
          created_at?: string;
        };
      };
      schedules: {
        Row: {
          id: string;
          company_id: string;
          day_of_week: number;
          start_time: string;
          end_time: string;
          is_active: boolean;
        };
        Insert: {
          id?: string;
          company_id: string;
          day_of_week: number;
          start_time: string;
          end_time: string;
          is_active?: boolean;
        };
        Update: {
          id?: string;
          company_id?: string;
          day_of_week?: number;
          start_time?: string;
          end_time?: string;
          is_active?: boolean;
        };
      };
      schedule_exceptions: {
        Row: {
          id: string;
          company_id: string;
          date: string;
          is_closed: boolean;
          start_time: string | null;
          end_time: string | null;
          reason: string;
        };
        Insert: {
          id?: string;
          company_id: string;
          date: string;
          is_closed?: boolean;
          start_time?: string | null;
          end_time?: string | null;
          reason?: string;
        };
        Update: {
          id?: string;
          company_id?: string;
          date?: string;
          is_closed?: boolean;
          start_time?: string | null;
          end_time?: string | null;
          reason?: string;
        };
      };
      bookings: {
        Row: {
          id: string;
          company_id: string;
          service_id: string;
          client_user_id: string | null;
          client_name: string;
          client_email: string;
          client_phone: string;
          booking_date: string;
          start_time: string;
          end_time: string;
          status: BookingStatus;
          notes: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          company_id: string;
          service_id: string;
          client_user_id?: string | null;
          client_name: string;
          client_email: string;
          client_phone?: string;
          booking_date: string;
          start_time: string;
          end_time: string;
          status?: BookingStatus;
          notes?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          company_id?: string;
          service_id?: string;
          client_user_id?: string | null;
          client_name?: string;
          client_email?: string;
          client_phone?: string;
          booking_date?: string;
          start_time?: string;
          end_time?: string;
          status?: BookingStatus;
          notes?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      notifications: {
        Row: {
          id: string;
          company_id: string;
          booking_id: string | null;
          recipient_email: string;
          recipient_phone: string;
          type: NotificationType;
          channel: NotificationChannel;
          sent_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          company_id: string;
          booking_id?: string | null;
          recipient_email: string;
          recipient_phone?: string;
          type: NotificationType;
          channel: NotificationChannel;
          sent_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          company_id?: string;
          booking_id?: string | null;
          recipient_email?: string;
          recipient_phone?: string;
          type?: NotificationType;
          channel?: NotificationChannel;
          sent_at?: string | null;
          created_at?: string;
        };
      };
    };
  };
}
