CREATE TYPE "public"."capital_request_status_enum" AS ENUM('pending', 'approved', 'rejected', 'completed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."fund_image_type_enum" AS ENUM('emoji', 'url');--> statement-breakpoint
CREATE TYPE "public"."governance_type_enum" AS ENUM('quorum', 'unanimous');--> statement-breakpoint
CREATE TYPE "public"."member_role_enum" AS ENUM('admin', 'member');--> statement-breakpoint
CREATE TYPE "public"."member_status_enum" AS ENUM('active', 'pending', 'blocked', 'left', 'removed');--> statement-breakpoint
CREATE TYPE "public"."payment_method_enum" AS ENUM('pix', 'ted', 'debit_card', 'credit_card', 'account_balance');--> statement-breakpoint
CREATE TYPE "public"."reference_type_enum" AS ENUM('contribution', 'capital_request', 'retribution', 'transfer', 'manual');--> statement-breakpoint
CREATE TYPE "public"."transaction_status_enum" AS ENUM('pending', 'completed', 'failed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."transaction_type_enum" AS ENUM('deposit', 'withdrawal', 'fund_contribution', 'fund_withdrawal', 'transfer_in', 'transfer_out', 'fee', 'refund');--> statement-breakpoint
CREATE TYPE "public"."urgency_level_enum" AS ENUM('low', 'medium', 'high', 'urgent');--> statement-breakpoint
CREATE TYPE "public"."voting_restriction_enum" AS ENUM('all_members', 'admins_only');--> statement-breakpoint
CREATE TABLE "account_transactions" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"account_id" uuid,
	"fund_id" bigint,
	"transaction_type" "transaction_type_enum" NOT NULL,
	"amount" numeric(15, 2) NOT NULL,
	"description" text,
	"reference_type" "reference_type_enum" NOT NULL,
	"reference_id" bigint,
	"status" "transaction_status_enum" DEFAULT 'completed',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"processed_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "accounts" (
	"id" uuid PRIMARY KEY NOT NULL,
	"email" varchar(255) NOT NULL,
	"password_hash" varchar(255) NOT NULL,
	"full_name" varchar(255) NOT NULL,
	"phone" varchar(20),
	"cpf" varchar(11),
	"birth_date" date,
	"profile_picture_url" varchar(500),
	"is_active" boolean DEFAULT true,
	"email_verified" boolean DEFAULT false,
	"phone_verified" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "accounts_email_unique" UNIQUE("email"),
	CONSTRAINT "accounts_cpf_unique" UNIQUE("cpf")
);
--> statement-breakpoint
CREATE TABLE "capital_requests" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"fund_id" bigint,
	"account_id" uuid,
	"amount" numeric(15, 2) NOT NULL,
	"reason" text NOT NULL,
	"urgency_level" "urgency_level_enum" DEFAULT 'medium',
	"status" "capital_request_status_enum" DEFAULT 'pending',
	"approved_at" timestamp,
	"approved_by" uuid,
	"disbursed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "contributions" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"fund_id" bigint,
	"account_id" uuid,
	"amount" numeric(15, 2) NOT NULL,
	"description" text,
	"payment_method" "payment_method_enum",
	"status" "transaction_status_enum" DEFAULT 'pending',
	"transaction_id" varchar(100),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"processed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "fund_members" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"fund_id" bigint,
	"account_id" uuid,
	"role" "member_role_enum" DEFAULT 'member',
	"status" "member_status_enum" DEFAULT 'active',
	"total_contributed" numeric(15, 2) DEFAULT '0.00',
	"total_received" numeric(15, 2) DEFAULT '0.00',
	"total_returned" numeric(15, 2) DEFAULT '0.00',
	"joined_at" timestamp DEFAULT now() NOT NULL,
	"removed_at" timestamp,
	"removed_reason" text
);
--> statement-breakpoint
CREATE TABLE "funds" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"objective" text,
	"contribution_rate" numeric(5, 2) DEFAULT '100.00',
	"retribution_rate" numeric(5, 2) DEFAULT '100.00',
	"is_open_for_new_members" boolean DEFAULT true,
	"requires_approval_for_new_members" boolean DEFAULT false,
	"created_by" uuid,
	"fund_image_type" "fund_image_type_enum" DEFAULT 'emoji',
	"fund_image_value" varchar(500) DEFAULT '💰',
	"is_active" boolean DEFAULT true,
	"governance_type" "governance_type_enum" DEFAULT 'quorum',
	"quorum_percentage" numeric(5, 2) DEFAULT '60.00',
	"voting_restriction" "voting_restriction_enum" DEFAULT 'all_members',
	"proposal_expiry_hours" integer DEFAULT 168,
	"allow_member_proposals" boolean DEFAULT true,
	"auto_execute_approved" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "account_transactions" ADD CONSTRAINT "account_transactions_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "account_transactions" ADD CONSTRAINT "account_transactions_fund_id_funds_id_fk" FOREIGN KEY ("fund_id") REFERENCES "public"."funds"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "capital_requests" ADD CONSTRAINT "capital_requests_fund_id_funds_id_fk" FOREIGN KEY ("fund_id") REFERENCES "public"."funds"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "capital_requests" ADD CONSTRAINT "capital_requests_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "capital_requests" ADD CONSTRAINT "capital_requests_approved_by_accounts_id_fk" FOREIGN KEY ("approved_by") REFERENCES "public"."accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contributions" ADD CONSTRAINT "contributions_fund_id_funds_id_fk" FOREIGN KEY ("fund_id") REFERENCES "public"."funds"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contributions" ADD CONSTRAINT "contributions_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fund_members" ADD CONSTRAINT "fund_members_fund_id_funds_id_fk" FOREIGN KEY ("fund_id") REFERENCES "public"."funds"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fund_members" ADD CONSTRAINT "fund_members_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "funds" ADD CONSTRAINT "funds_created_by_accounts_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."accounts"("id") ON DELETE no action ON UPDATE no action;