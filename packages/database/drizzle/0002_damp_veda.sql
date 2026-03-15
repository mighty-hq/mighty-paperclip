CREATE TABLE "file_assets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"attributes" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"asset" varchar(800) NOT NULL,
	"created_by_id" uuid,
	"updated_by_id" uuid,
	"user_id" uuid,
	"is_deleted" boolean DEFAULT false,
	"deleted_at" timestamp with time zone,
	"is_archived" boolean DEFAULT false,
	"entity_type" varchar(255),
	"entity_identifier" varchar(255),
	"external_id" varchar(255),
	"external_source" varchar(255),
	"is_uploaded" boolean,
	"size" double precision NOT NULL,
	"storage_metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"password" varchar(128) NOT NULL,
	"last_login" timestamp with time zone,
	"username" varchar(128) NOT NULL,
	"mobile_number" varchar(255),
	"email" varchar(255),
	"first_name" varchar(255) NOT NULL,
	"last_name" varchar(255) NOT NULL,
	"avatar" text,
	"date_joined" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_location" varchar(255),
	"created_location" varchar(255),
	"is_superuser" boolean DEFAULT false NOT NULL,
	"is_managed" boolean DEFAULT false NOT NULL,
	"is_password_expired" boolean DEFAULT false NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"is_staff" boolean DEFAULT false NOT NULL,
	"is_email_verified" boolean DEFAULT false NOT NULL,
	"is_password_autoset" boolean,
	"token" varchar(64),
	"user_timezone" varchar(255) DEFAULT 'UTC' NOT NULL,
	"last_active" timestamp with time zone,
	"last_login_time" timestamp with time zone,
	"last_logout_time" timestamp with time zone,
	"last_login_ip" varchar(255),
	"last_logout_ip" varchar(255),
	"last_login_medium" varchar(20),
	"last_login_uagent" text,
	"token_updated_at" timestamp with time zone,
	"is_bot" boolean DEFAULT false NOT NULL,
	"cover_image" varchar(800),
	"display_name" varchar(255) NOT NULL,
	"avatar_asset_id" uuid,
	"cover_image_asset_id" uuid,
	"bot_type" varchar(30),
	"is_email_valid" boolean DEFAULT false NOT NULL,
	"masked_at" timestamp with time zone,
	"is_password_reset_required" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
ALTER TABLE "file_assets" ADD CONSTRAINT "file_assets_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "file_assets" ADD CONSTRAINT "file_assets_updated_by_id_users_id_fk" FOREIGN KEY ("updated_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "file_assets" ADD CONSTRAINT "file_assets_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_avatar_asset_id_file_assets_id_fk" FOREIGN KEY ("avatar_asset_id") REFERENCES "public"."file_assets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_cover_image_asset_id_file_assets_id_fk" FOREIGN KEY ("cover_image_asset_id") REFERENCES "public"."file_assets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "file_asset_created_by_id_966942a0" ON "file_assets" USING btree ("created_by_id");--> statement-breakpoint
CREATE INDEX "file_asset_updated_by_id_d6aaf4f0" ON "file_assets" USING btree ("updated_by_id");--> statement-breakpoint
CREATE INDEX "file_assets_user_id_ce1818dc" ON "file_assets" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "asset_entity_type_idx" ON "file_assets" USING btree ("entity_type");--> statement-breakpoint
CREATE INDEX "asset_entity_identifier_idx" ON "file_assets" USING btree ("entity_identifier");--> statement-breakpoint
CREATE INDEX "asset_entity_idx" ON "file_assets" USING btree ("entity_type","entity_identifier");--> statement-breakpoint
CREATE INDEX "asset_asset_idx" ON "file_assets" USING btree ("asset");--> statement-breakpoint
CREATE UNIQUE INDEX "user_email_key" ON "users" USING btree ("email");--> statement-breakpoint
CREATE UNIQUE INDEX "user_username_key" ON "users" USING btree ("username");--> statement-breakpoint
CREATE INDEX "user_username_cf016618_like" ON "users" USING btree ("username");--> statement-breakpoint
CREATE INDEX "user_email_54dc62b2_like" ON "users" USING btree ("email");--> statement-breakpoint
CREATE INDEX "users_avatar_asset_id_50fa2043" ON "users" USING btree ("avatar_asset_id");--> statement-breakpoint
CREATE INDEX "users_cover_image_asset_id_b9679cbc" ON "users" USING btree ("cover_image_asset_id");--> statement-breakpoint
ALTER TABLE "user_settings" ADD CONSTRAINT "user_settings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;