DROP INDEX "user_settings_user_id_idx";--> statement-breakpoint
ALTER TABLE "bookmark_folders" ALTER COLUMN "user_id" SET DATA TYPE uuid USING "user_id"::uuid;--> statement-breakpoint
ALTER TABLE "bookmarks" ALTER COLUMN "user_id" SET DATA TYPE uuid USING "user_id"::uuid;--> statement-breakpoint
ALTER TABLE "categories" ALTER COLUMN "user_id" SET DATA TYPE uuid USING "user_id"::uuid;--> statement-breakpoint
ALTER TABLE "clipboard_items" ALTER COLUMN "user_id" SET DATA TYPE uuid USING "user_id"::uuid;--> statement-breakpoint
ALTER TABLE "launcher_pins" ALTER COLUMN "user_id" SET DATA TYPE uuid USING "user_id"::uuid;--> statement-breakpoint
ALTER TABLE "prompts" ALTER COLUMN "user_id" SET DATA TYPE uuid USING "user_id"::uuid;--> statement-breakpoint
ALTER TABLE "quick_links" ALTER COLUMN "user_id" SET DATA TYPE uuid USING "user_id"::uuid;--> statement-breakpoint
ALTER TABLE "snippets" ALTER COLUMN "user_id" SET DATA TYPE uuid USING "user_id"::uuid;--> statement-breakpoint
ALTER TABLE "user_settings" ALTER COLUMN "user_id" SET DATA TYPE uuid USING "user_id"::uuid;--> statement-breakpoint
CREATE UNIQUE INDEX "categories_user_name_type_uidx" ON "categories" USING btree ("user_id","name","type");--> statement-breakpoint
CREATE UNIQUE INDEX "user_settings_user_id_uidx" ON "user_settings" USING btree ("user_id");--> statement-breakpoint

ALTER TABLE "bookmark_folders"
ADD CONSTRAINT "bookmark_folders_user_id_auth_users_id_fk"
FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;--> statement-breakpoint

ALTER TABLE "bookmarks"
ADD CONSTRAINT "bookmarks_user_id_auth_users_id_fk"
FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;--> statement-breakpoint

ALTER TABLE "categories"
ADD CONSTRAINT "categories_user_id_auth_users_id_fk"
FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;--> statement-breakpoint

ALTER TABLE "clipboard_items"
ADD CONSTRAINT "clipboard_items_user_id_auth_users_id_fk"
FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;--> statement-breakpoint

ALTER TABLE "launcher_pins"
ADD CONSTRAINT "launcher_pins_user_id_auth_users_id_fk"
FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;--> statement-breakpoint

ALTER TABLE "prompts"
ADD CONSTRAINT "prompts_user_id_auth_users_id_fk"
FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;--> statement-breakpoint

ALTER TABLE "quick_links"
ADD CONSTRAINT "quick_links_user_id_auth_users_id_fk"
FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;--> statement-breakpoint

ALTER TABLE "snippets"
ADD CONSTRAINT "snippets_user_id_auth_users_id_fk"
FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;--> statement-breakpoint

ALTER TABLE "user_settings"
ADD CONSTRAINT "user_settings_user_id_auth_users_id_fk"
FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;--> statement-breakpoint

ALTER TABLE "bookmark_folders"
ADD CONSTRAINT "bookmark_folders_parent_id_bookmark_folders_id_fk"
FOREIGN KEY ("parent_id") REFERENCES "public"."bookmark_folders"("id") ON DELETE CASCADE;--> statement-breakpoint

ALTER TABLE "bookmarks"
ADD CONSTRAINT "bookmarks_folder_id_bookmark_folders_id_fk"
FOREIGN KEY ("folder_id") REFERENCES "public"."bookmark_folders"("id") ON DELETE CASCADE;--> statement-breakpoint

ALTER TABLE "prompts"
ADD CONSTRAINT "prompts_category_id_categories_id_fk"
FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE SET NULL;--> statement-breakpoint

ALTER TABLE "snippets"
ADD CONSTRAINT "snippets_category_id_categories_id_fk"
FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE SET NULL;--> statement-breakpoint

CREATE OR REPLACE FUNCTION public.seed_new_user_defaults()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_settings (
    user_id, theme, scale, launch_on_startup, show_in_menu_bar, auto_update, animations, history_retention
  ) VALUES (
    NEW.id, 'dark', 'medium', false, true, true, true, '30d'
  )
  ON CONFLICT (user_id) DO NOTHING;

  INSERT INTO public.categories (user_id, name, icon, color, type, tags)
  VALUES
    (NEW.id, 'Development', 'Code2', '#3b82f6', 'both', '["default"]'::jsonb),
    (NEW.id, 'Work', 'Briefcase', '#10b981', 'both', '["default"]'::jsonb),
    (NEW.id, 'Personal', 'User', '#a855f7', 'both', '["default"]'::jsonb)
  ON CONFLICT ON CONSTRAINT categories_user_name_type_uidx DO NOTHING;

  RETURN NEW;
END;
$$;--> statement-breakpoint

DROP TRIGGER IF EXISTS on_auth_user_created_seed_defaults ON auth.users;--> statement-breakpoint
CREATE TRIGGER on_auth_user_created_seed_defaults
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.seed_new_user_defaults();--> statement-breakpoint

CREATE OR REPLACE FUNCTION public.seed_defaults_for_user(target_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_settings (
    user_id, theme, scale, launch_on_startup, show_in_menu_bar, auto_update, animations, history_retention
  ) VALUES (
    target_user_id, 'dark', 'medium', false, true, true, true, '30d'
  )
  ON CONFLICT (user_id) DO NOTHING;

  INSERT INTO public.categories (user_id, name, icon, color, type, tags)
  VALUES
    (target_user_id, 'Development', 'Code2', '#3b82f6', 'both', '["default"]'::jsonb),
    (target_user_id, 'Work', 'Briefcase', '#10b981', 'both', '["default"]'::jsonb),
    (target_user_id, 'Personal', 'User', '#a855f7', 'both', '["default"]'::jsonb)
  ON CONFLICT ON CONSTRAINT categories_user_name_type_uidx DO NOTHING;
END;
$$;