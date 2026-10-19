export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {

  public: {
    CompositeTypes: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Tables: {
      bank_reports: {
        ComputedFields: never
        Insert: {
          balance_amount?: number | null
          balance_date?: number | null
          created_at?: number
          debt_amount?: number | null
          debt_report_date?: number | null
          grace_debt_amount?: number | null
          grace_end_date?: number | null
          id: string
          min_payment_amount?: number | null
          min_payment_due_date?: number | null
          min_payment_period_start_date?: number | null
          next_interest_amount?: number | null
          next_payment_date?: number | null
          next_principal_amount?: number | null
          statement_date?: number | null
          updated_at?: number
          user_id: string
        }
        Relationships: [

        ]
        Row: {
          balance_amount: number | null
          balance_date: number | null
          created_at: number
          debt_amount: number | null
          debt_report_date: number | null
          grace_debt_amount: number | null
          grace_end_date: number | null
          id: string
          min_payment_amount: number | null
          min_payment_due_date: number | null
          min_payment_period_start_date: number | null
          next_interest_amount: number | null
          next_payment_date: number | null
          next_principal_amount: number | null
          statement_date: number | null
          updated_at: number
          user_id: string
        }
        Update: {
          balance_amount?: number | null
          balance_date?: number | null
          created_at?: number
          debt_amount?: number | null
          debt_report_date?: number | null
          grace_debt_amount?: number | null
          grace_end_date?: number | null
          id?: string
          min_payment_amount?: number | null
          min_payment_due_date?: number | null
          min_payment_period_start_date?: number | null
          next_interest_amount?: number | null
          next_payment_date?: number | null
          next_principal_amount?: number | null
          statement_date?: number | null
          updated_at?: number
          user_id?: string
        }
      }
      categories: {
        ComputedFields: never
        Insert: {
          color: string
          created_at?: number
          icon: string
          id: string
          is_excluded_from_stats?: boolean
          is_in_quick_selector?: boolean
          is_in_recent?: boolean
          name: string
          parent_id?: string | null
          sort_order?: number
          updated_at?: number
          user_id: string
        }
        Relationships: [

        ]
        Row: {
          color: string
          created_at: number
          icon: string
          id: string
          is_excluded_from_stats: boolean
          is_in_quick_selector: boolean
          is_in_recent: boolean
          name: string
          parent_id: string | null
          sort_order: number
          updated_at: number
          user_id: string
        }
        Update: {
          color?: string
          created_at?: number
          icon?: string
          id?: string
          is_excluded_from_stats?: boolean
          is_in_quick_selector?: boolean
          is_in_recent?: boolean
          name?: string
          parent_id?: string | null
          sort_order?: number
          updated_at?: number
          user_id?: string
        }
      }
      currencies: {
        ComputedFields: never
        Insert: {
          code: string
          created_at?: number
          id: string
          manual_rate?: number | null
          manual_rate_currency_code?: string | null
          minor_display?: string | null
          name?: string | null
          scale?: number | null
          symbol?: string | null
          updated_at?: number
          user_id: string
        }
        Relationships: [

        ]
        Row: {
          code: string
          created_at: number
          id: string
          manual_rate: number | null
          manual_rate_currency_code: string | null
          minor_display: string | null
          name: string | null
          scale: number | null
          symbol: string | null
          updated_at: number
          user_id: string
        }
        Update: {
          code?: string
          created_at?: number
          id?: string
          manual_rate?: number | null
          manual_rate_currency_code?: string | null
          minor_display?: string | null
          name?: string | null
          scale?: number | null
          symbol?: string | null
          updated_at?: number
          user_id?: string
        }
      }
      display_overrides: {
        ComputedFields: never
        Insert: {
          color?: string | null
          created_at?: number
          icon?: string | null
          id: string
          kind: string
          name?: string | null
          parent_id?: string | null
          target_id: string
          updated_at?: number
          user_id: string
        }
        Relationships: [

        ]
        Row: {
          color: string | null
          created_at: number
          icon: string | null
          id: string
          kind: string
          name: string | null
          parent_id: string | null
          target_id: string
          updated_at: number
          user_id: string
        }
        Update: {
          color?: string | null
          created_at?: number
          icon?: string | null
          id?: string
          kind?: string
          name?: string | null
          parent_id?: string | null
          target_id?: string
          updated_at?: number
          user_id?: string
        }
      }
      exchange_rates: {
        ComputedFields: never
        Insert: {
          date: number
          id: string
          rates: NonNullable<Json>
          source: string
          updated_at?: number
        }
        Relationships: [

        ]
        Row: {
          date: number
          id: string
          rates: NonNullable<Json>
          source: string
          updated_at: number
        }
        Update: {
          date?: number
          id?: string
          rates?: NonNullable<Json>
          source?: string
          updated_at?: number
        }
      }
      forecast_categories: {
        ComputedFields: never
        Insert: {
          category_id: string
          created_at?: number
          currency_code?: string | null
          id: string
          is_included?: boolean | null
          monthly_amount?: number | null
          updated_at?: number
          user_id: string
        }
        Relationships: [

        ]
        Row: {
          category_id: string
          created_at: number
          currency_code: string | null
          id: string
          is_included: boolean | null
          monthly_amount: number | null
          updated_at: number
          user_id: string
        }
        Update: {
          category_id?: string
          created_at?: number
          currency_code?: string | null
          id?: string
          is_included?: boolean | null
          monthly_amount?: number | null
          updated_at?: number
          user_id?: string
        }
      }
      forecast_settings: {
        ComputedFields: never
        Insert: {
          card_payment_mode?: string
          created_at?: number
          history_months?: number
          horizon_months?: number
          id: string
          is_by_parent_category?: boolean
          regular_amount_mode?: string
          regular_min_months?: number
          updated_at?: number
          user_id: string
        }
        Relationships: [

        ]
        Row: {
          card_payment_mode: string
          created_at: number
          history_months: number
          horizon_months: number
          id: string
          is_by_parent_category: boolean
          regular_amount_mode: string
          regular_min_months: number
          updated_at: number
          user_id: string
        }
        Update: {
          card_payment_mode?: string
          created_at?: number
          history_months?: number
          horizon_months?: number
          id?: string
          is_by_parent_category?: boolean
          regular_amount_mode?: string
          regular_min_months?: number
          updated_at?: number
          user_id?: string
        }
      }
      loan_schedule_overrides: {
        ComputedFields: never
        Insert: {
          created_at?: number
          due_date: number
          id: string
          interest_amount: number
          loan_id: string
          payment_number: number
          principal_amount: number
          source: string
          total_amount: number
          updated_at?: number
          user_id: string
        }
        Relationships: [

        ]
        Row: {
          created_at: number
          due_date: number
          id: string
          interest_amount: number
          loan_id: string
          payment_number: number
          principal_amount: number
          source: string
          total_amount: number
          updated_at: number
          user_id: string
        }
        Update: {
          created_at?: number
          due_date?: number
          id?: string
          interest_amount?: number
          loan_id?: string
          payment_number?: number
          principal_amount?: number
          source?: string
          total_amount?: number
          updated_at?: number
          user_id?: string
        }
      }
      loans: {
        ComputedFields: never
        Insert: {
          annual_rate_percent?: number | null
          closed_date?: number | null
          contract_number?: string | null
          created_at?: number
          description?: string | null
          first_payment_date: number
          id: string
          interest_accrual?: string | null
          late_after_days?: number | null
          payment_day_of_month: number
          payment_wallet_id?: string | null
          prepayment_mode: string
          prepayment_window_days?: number | null
          principal_amount: number
          schedule_type: string
          start_date: number
          term_months: number
          updated_at?: number
          user_id: string
        }
        Relationships: [

        ]
        Row: {
          annual_rate_percent: number | null
          closed_date: number | null
          contract_number: string | null
          created_at: number
          description: string | null
          first_payment_date: number
          id: string
          interest_accrual: string | null
          late_after_days: number | null
          payment_day_of_month: number
          payment_wallet_id: string | null
          prepayment_mode: string
          prepayment_window_days: number | null
          principal_amount: number
          schedule_type: string
          start_date: number
          term_months: number
          updated_at: number
          user_id: string
        }
        Update: {
          annual_rate_percent?: number | null
          closed_date?: number | null
          contract_number?: string | null
          created_at?: number
          description?: string | null
          first_payment_date?: number
          id?: string
          interest_accrual?: string | null
          late_after_days?: number | null
          payment_day_of_month?: number
          payment_wallet_id?: string | null
          prepayment_mode?: string
          prepayment_window_days?: number | null
          principal_amount?: number
          schedule_type?: string
          start_date?: number
          term_months?: number
          updated_at?: number
          user_id?: string
        }
      }
      payment_reminder_deliveries: {
        ComputedFields: never
        Insert: {
          due_date: number
          kind: string
          sent_at: number
          user_id: string
          wallet_id: string
        }
        Relationships: [

        ]
        Row: {
          due_date: number
          kind: string
          sent_at: number
          user_id: string
          wallet_id: string
        }
        Update: {
          due_date?: number
          kind?: string
          sent_at?: number
          user_id?: string
          wallet_id?: string
        }
      }
      push_subscriptions: {
        ComputedFields: never
        Insert: {
          auth_secret: string
          created_at?: number
          endpoint: string
          id: string
          p256dh_key: string
          updated_at?: number
          user_agent?: string | null
          user_id: string
        }
        Relationships: [

        ]
        Row: {
          auth_secret: string
          created_at: number
          endpoint: string
          id: string
          p256dh_key: string
          updated_at: number
          user_agent: string | null
          user_id: string
        }
        Update: {
          auth_secret?: string
          created_at?: number
          endpoint?: string
          id?: string
          p256dh_key?: string
          updated_at?: number
          user_agent?: string | null
          user_id?: string
        }
      }
      stat_views: {
        ComputedFields: never
        Insert: {
          auto_rule?: Json | null
          config: NonNullable<Json>
          created_at?: number
          id: string
          is_active?: boolean
          is_auto_rule_enabled?: boolean
          name: string
          scope?: string
          sort_order?: number
          updated_at?: number
          user_id: string
        }
        Relationships: [

        ]
        Row: {
          auto_rule: Json | null
          config: NonNullable<Json>
          created_at: number
          id: string
          is_active: boolean
          is_auto_rule_enabled: boolean
          name: string
          scope: string
          sort_order: number
          updated_at: number
          user_id: string
        }
        Update: {
          auto_rule?: Json | null
          config?: NonNullable<Json>
          created_at?: number
          id?: string
          is_active?: boolean
          is_auto_rule_enabled?: boolean
          name?: string
          scope?: string
          sort_order?: number
          updated_at?: number
          user_id?: string
        }
      }
      transactions: {
        ComputedFields: never
        Insert: {
          category_id?: string | null
          created_at?: number
          date: number
          description?: string | null
          from_amount?: number | null
          from_wallet_id?: string | null
          id: string
          to_amount?: number | null
          to_wallet_id?: string | null
          type: string
          updated_at?: number
          user_id: string
        }
        Relationships: [

        ]
        Row: {
          category_id: string | null
          created_at: number
          date: number
          description: string | null
          from_amount: number | null
          from_wallet_id: string | null
          id: string
          to_amount: number | null
          to_wallet_id: string | null
          type: string
          updated_at: number
          user_id: string
        }
        Update: {
          category_id?: string | null
          created_at?: number
          date?: number
          description?: string | null
          from_amount?: number | null
          from_wallet_id?: string | null
          id?: string
          to_amount?: number | null
          to_wallet_id?: string | null
          type?: string
          updated_at?: number
          user_id?: string
        }
      }
      user_settings: {
        ComputedFields: never
        Insert: {
          base_currency_code?: string
          created_at?: number
          id: string
          is_payment_reminders_enabled?: boolean
          locale?: string | null
          timezone?: string | null
          updated_at?: number
          user_id: string
        }
        Relationships: [

        ]
        Row: {
          base_currency_code: string
          created_at: number
          id: string
          is_payment_reminders_enabled: boolean
          locale: string | null
          timezone: string | null
          updated_at: number
          user_id: string
        }
        Update: {
          base_currency_code?: string
          created_at?: number
          id?: string
          is_payment_reminders_enabled?: boolean
          locale?: string | null
          timezone?: string | null
          updated_at?: number
          user_id?: string
        }
      }
      wallets: {
        ComputedFields: never
        Insert: {
          color: string
          created_at?: number
          credit_limit?: number | null
          currency_code: string
          description?: string | null
          id: string
          is_archived?: boolean
          is_excluded_from_total?: boolean
          is_in_forecast?: boolean | null
          is_withdrawable?: boolean
          name: string
          sort_order?: number
          type: string
          updated_at?: number
          user_id: string
        }
        Relationships: [

        ]
        Row: {
          color: string
          created_at: number
          credit_limit: number | null
          currency_code: string
          description: string | null
          id: string
          is_archived: boolean
          is_excluded_from_total: boolean
          is_in_forecast: boolean | null
          is_withdrawable: boolean
          name: string
          sort_order: number
          type: string
          updated_at: number
          user_id: string
        }
        Update: {
          color?: string
          created_at?: number
          credit_limit?: number | null
          currency_code?: string
          description?: string | null
          id?: string
          is_archived?: boolean
          is_excluded_from_total?: boolean
          is_in_forecast?: boolean | null
          is_withdrawable?: boolean
          name?: string
          sort_order?: number
          type?: string
          updated_at?: number
          user_id?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, 'public'>]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
  | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
  | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
      & DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    & DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R
    }
      ? R
      : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] & DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
        ? R
        : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
  | keyof DefaultSchema['Tables']
  | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
    Insert: infer I
  }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
      Insert: infer I
    }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
  | keyof DefaultSchema['Tables']
  | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
    Update: infer U
  }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
      Update: infer U
    }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
  | keyof DefaultSchema['Enums']
  | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
  | keyof DefaultSchema['CompositeTypes']
  | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {

    },
  },
} as const
