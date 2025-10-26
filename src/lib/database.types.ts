export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type UserRole = 'admin' | 'company' | 'client';

export type ReservationStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';
export type NotificationType = 'email' | 'sms';
export type NotificationStatus = 'pending' | 'sent' | 'failed';

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          role: UserRole;
          full_name: string;
          phone: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          role?: UserRole;
          full_name: string;
          phone?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          role?: UserRole;
          full_name?: string;
          phone?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      companies: {
        Row: {
          id: string;
          owner_id: string;
          name: string;
          slug: string;
          description: string | null;
          logo_url: string | null;
          category: string;
          location_address: string | null;
          location_city: string | null;
          location_country: string;
          email: string | null;
          phone: string | null;
          is_active: boolean;
          subscription_tier: string;
          subscription_expires_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          name: string;
          slug: string;
          description?: string | null;
          logo_url?: string | null;
          category: string;
          location_address?: string | null;
          location_city?: string | null;
          location_country?: string;
          email?: string | null;
          phone?: string | null;
          is_active?: boolean;
          subscription_tier?: string;
          subscription_expires_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          owner_id?: string;
          name?: string;
          slug?: string;
          description?: string | null;
          logo_url?: string | null;
          category?: string;
          location_address?: string | null;
          location_city?: string | null;
          location_country?: string;
          email?: string | null;
          phone?: string | null;
          is_active?: boolean;
          subscription_tier?: string;
          subscription_expires_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      services: {
        Row: {
          id: string;
          company_id: string;
          name: string;
          description: string | null;
          duration_minutes: number;
          price: number;
          currency: string;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          company_id: string;
          name: string;
          description?: string | null;
          duration_minutes: number;
          price: number;
          currency?: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          company_id?: string;
          name?: string;
          description?: string | null;
          duration_minutes?: number;
          price?: number;
          currency?: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
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
          created_at: string;
        };
        Insert: {
          id?: string;
          company_id: string;
          day_of_week: number;
          start_time: string;
          end_time: string;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          company_id?: string;
          day_of_week?: number;
          start_time?: string;
          end_time?: string;
          is_active?: boolean;
          created_at?: string;
        };
      };
      schedule_exceptions: {
        Row: {
          id: string;
          company_id: string;
          date: string;
          start_time: string | null;
          end_time: string | null;
          reason: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          company_id: string;
          date: string;
          start_time?: string | null;
          end_time?: string | null;
          reason?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          company_id?: string;
          date?: string;
          start_time?: string | null;
          end_time?: string | null;
          reason?: string | null;
          created_at?: string;
        };
      };
      reservations: {
        Row: {
          id: string;
          company_id: string;
          service_id: string;
          client_id: string | null;
          client_name: string;
          client_email: string;
          client_phone: string;
          reservation_date: string;
          start_time: string;
          end_time: string;
          status: ReservationStatus;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          company_id: string;
          service_id: string;
          client_id?: string | null;
          client_name: string;
          client_email: string;
          client_phone: string;
          reservation_date: string;
          start_time: string;
          end_time: string;
          status?: ReservationStatus;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          company_id?: string;
          service_id?: string;
          client_id?: string | null;
          client_name?: string;
          client_email?: string;
          client_phone?: string;
          reservation_date?: string;
          start_time?: string;
          end_time?: string;
          status?: ReservationStatus;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      payments: {
        Row: {
          id: string;
          company_id: string;
          amount: number;
          currency: string;
          subscription_tier: string;
          payment_method: string | null;
          payment_status: PaymentStatus;
          payment_date: string | null;
          period_start: string;
          period_end: string;
          transaction_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          company_id: string;
          amount: number;
          currency?: string;
          subscription_tier: string;
          payment_method?: string | null;
          payment_status?: PaymentStatus;
          payment_date?: string | null;
          period_start: string;
          period_end: string;
          transaction_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          company_id?: string;
          amount?: number;
          currency?: string;
          subscription_tier?: string;
          payment_method?: string | null;
          payment_status?: PaymentStatus;
          payment_date?: string | null;
          period_start?: string;
          period_end?: string;
          transaction_id?: string | null;
          created_at?: string;
        };
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          type: NotificationType;
          subject: string | null;
          content: string;
          status: NotificationStatus;
          sent_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: NotificationType;
          subject?: string | null;
          content: string;
          status?: NotificationStatus;
          sent_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?: NotificationType;
          subject?: string | null;
          content?: string;
          status?: NotificationStatus;
          sent_at?: string | null;
          created_at?: string;
        };
      };
    };
  };
}
