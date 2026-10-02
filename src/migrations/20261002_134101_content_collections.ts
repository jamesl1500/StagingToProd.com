import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "payload"."enum_courses_language" AS ENUM('javascript', 'typescript', 'python', 'go', 'rust', 'java', 'csharp', 'sql', 'general');
  CREATE TYPE "payload"."enum_courses_level" AS ENUM('beginner', 'intermediate', 'advanced');
  CREATE TYPE "payload"."enum_courses_price_mode" AS ENUM('free', 'one-time', 'subscription');
  CREATE TYPE "payload"."enum_courses_status" AS ENUM('draft', 'published');
  CREATE TYPE "payload"."enum__courses_v_version_language" AS ENUM('javascript', 'typescript', 'python', 'go', 'rust', 'java', 'csharp', 'sql', 'general');
  CREATE TYPE "payload"."enum__courses_v_version_level" AS ENUM('beginner', 'intermediate', 'advanced');
  CREATE TYPE "payload"."enum__courses_v_version_price_mode" AS ENUM('free', 'one-time', 'subscription');
  CREATE TYPE "payload"."enum__courses_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "payload"."enum_lessons_status" AS ENUM('draft', 'published');
  CREATE TYPE "payload"."enum__lessons_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "payload"."enum_mux_video_playback_options_playback_policy" AS ENUM('signed', 'public');
  CREATE TABLE "payload"."courses" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"slug" varchar,
  	"summary" varchar,
  	"cover_id" integer,
  	"description" jsonb,
  	"language" "payload"."enum_courses_language" DEFAULT 'javascript',
  	"level" "payload"."enum_courses_level" DEFAULT 'beginner',
  	"author_id" integer,
  	"price_mode" "payload"."enum_courses_price_mode" DEFAULT 'free',
  	"stripe_price_id" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "payload"."enum_courses_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "payload"."courses_texts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "payload"."_courses_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_slug" varchar,
  	"version_summary" varchar,
  	"version_cover_id" integer,
  	"version_description" jsonb,
  	"version_language" "payload"."enum__courses_v_version_language" DEFAULT 'javascript',
  	"version_level" "payload"."enum__courses_v_version_level" DEFAULT 'beginner',
  	"version_author_id" integer,
  	"version_price_mode" "payload"."enum__courses_v_version_price_mode" DEFAULT 'free',
  	"version_stripe_price_id" varchar,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "payload"."enum__courses_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "payload"."_courses_v_texts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "payload"."modules" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"_order" varchar,
  	"title" varchar NOT NULL,
  	"course_id" integer NOT NULL,
  	"summary" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload"."lessons" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"_order" varchar,
  	"title" varchar,
  	"slug" varchar,
  	"module_id" integer,
  	"course_id" integer,
  	"is_free" boolean DEFAULT false,
  	"summary" varchar,
  	"video_id" integer,
  	"body" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "payload"."enum_lessons_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "payload"."_lessons_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version__order" varchar,
  	"version_title" varchar,
  	"version_slug" varchar,
  	"version_module_id" integer,
  	"version_course_id" integer,
  	"version_is_free" boolean DEFAULT false,
  	"version_summary" varchar,
  	"version_video_id" integer,
  	"version_body" jsonb,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "payload"."enum__lessons_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "payload"."authors_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"url" varchar NOT NULL
  );
  
  CREATE TABLE "payload"."authors" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"avatar_id" integer,
  	"bio" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload"."mux_video_playback_options" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"playback_id" varchar,
  	"playback_policy" "payload"."enum_mux_video_playback_options_playback_policy"
  );
  
  CREATE TABLE "payload"."mux_video" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"asset_id" varchar,
  	"duration" numeric,
  	"poster_timestamp" numeric,
  	"aspect_ratio" varchar,
  	"max_width" numeric,
  	"max_height" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "payload"."payload_locked_documents_rels" ADD COLUMN "courses_id" integer;
  ALTER TABLE "payload"."payload_locked_documents_rels" ADD COLUMN "modules_id" integer;
  ALTER TABLE "payload"."payload_locked_documents_rels" ADD COLUMN "lessons_id" integer;
  ALTER TABLE "payload"."payload_locked_documents_rels" ADD COLUMN "authors_id" integer;
  ALTER TABLE "payload"."payload_locked_documents_rels" ADD COLUMN "mux_video_id" integer;
  ALTER TABLE "payload"."courses" ADD CONSTRAINT "courses_cover_id_media_id_fk" FOREIGN KEY ("cover_id") REFERENCES "payload"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."courses" ADD CONSTRAINT "courses_author_id_authors_id_fk" FOREIGN KEY ("author_id") REFERENCES "payload"."authors"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."courses_texts" ADD CONSTRAINT "courses_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "payload"."courses"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."_courses_v" ADD CONSTRAINT "_courses_v_parent_id_courses_id_fk" FOREIGN KEY ("parent_id") REFERENCES "payload"."courses"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."_courses_v" ADD CONSTRAINT "_courses_v_version_cover_id_media_id_fk" FOREIGN KEY ("version_cover_id") REFERENCES "payload"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."_courses_v" ADD CONSTRAINT "_courses_v_version_author_id_authors_id_fk" FOREIGN KEY ("version_author_id") REFERENCES "payload"."authors"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."_courses_v_texts" ADD CONSTRAINT "_courses_v_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "payload"."_courses_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."modules" ADD CONSTRAINT "modules_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "payload"."courses"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."lessons" ADD CONSTRAINT "lessons_module_id_modules_id_fk" FOREIGN KEY ("module_id") REFERENCES "payload"."modules"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."lessons" ADD CONSTRAINT "lessons_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "payload"."courses"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."lessons" ADD CONSTRAINT "lessons_video_id_mux_video_id_fk" FOREIGN KEY ("video_id") REFERENCES "payload"."mux_video"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."_lessons_v" ADD CONSTRAINT "_lessons_v_parent_id_lessons_id_fk" FOREIGN KEY ("parent_id") REFERENCES "payload"."lessons"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."_lessons_v" ADD CONSTRAINT "_lessons_v_version_module_id_modules_id_fk" FOREIGN KEY ("version_module_id") REFERENCES "payload"."modules"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."_lessons_v" ADD CONSTRAINT "_lessons_v_version_course_id_courses_id_fk" FOREIGN KEY ("version_course_id") REFERENCES "payload"."courses"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."_lessons_v" ADD CONSTRAINT "_lessons_v_version_video_id_mux_video_id_fk" FOREIGN KEY ("version_video_id") REFERENCES "payload"."mux_video"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."authors_links" ADD CONSTRAINT "authors_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."authors"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."authors" ADD CONSTRAINT "authors_avatar_id_media_id_fk" FOREIGN KEY ("avatar_id") REFERENCES "payload"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload"."mux_video_playback_options" ADD CONSTRAINT "mux_video_playback_options_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "payload"."mux_video"("id") ON DELETE cascade ON UPDATE no action;
  CREATE UNIQUE INDEX "courses_slug_idx" ON "payload"."courses" USING btree ("slug");
  CREATE INDEX "courses_cover_idx" ON "payload"."courses" USING btree ("cover_id");
  CREATE INDEX "courses_author_idx" ON "payload"."courses" USING btree ("author_id");
  CREATE INDEX "courses_updated_at_idx" ON "payload"."courses" USING btree ("updated_at");
  CREATE INDEX "courses_created_at_idx" ON "payload"."courses" USING btree ("created_at");
  CREATE INDEX "courses__status_idx" ON "payload"."courses" USING btree ("_status");
  CREATE INDEX "courses_texts_order_parent" ON "payload"."courses_texts" USING btree ("order","parent_id");
  CREATE INDEX "_courses_v_parent_idx" ON "payload"."_courses_v" USING btree ("parent_id");
  CREATE INDEX "_courses_v_version_version_slug_idx" ON "payload"."_courses_v" USING btree ("version_slug");
  CREATE INDEX "_courses_v_version_version_cover_idx" ON "payload"."_courses_v" USING btree ("version_cover_id");
  CREATE INDEX "_courses_v_version_version_author_idx" ON "payload"."_courses_v" USING btree ("version_author_id");
  CREATE INDEX "_courses_v_version_version_updated_at_idx" ON "payload"."_courses_v" USING btree ("version_updated_at");
  CREATE INDEX "_courses_v_version_version_created_at_idx" ON "payload"."_courses_v" USING btree ("version_created_at");
  CREATE INDEX "_courses_v_version_version__status_idx" ON "payload"."_courses_v" USING btree ("version__status");
  CREATE INDEX "_courses_v_created_at_idx" ON "payload"."_courses_v" USING btree ("created_at");
  CREATE INDEX "_courses_v_updated_at_idx" ON "payload"."_courses_v" USING btree ("updated_at");
  CREATE INDEX "_courses_v_latest_idx" ON "payload"."_courses_v" USING btree ("latest");
  CREATE INDEX "_courses_v_texts_order_parent" ON "payload"."_courses_v_texts" USING btree ("order","parent_id");
  CREATE INDEX "modules__order_idx" ON "payload"."modules" USING btree ("_order");
  CREATE INDEX "modules_course_idx" ON "payload"."modules" USING btree ("course_id");
  CREATE INDEX "modules_updated_at_idx" ON "payload"."modules" USING btree ("updated_at");
  CREATE INDEX "modules_created_at_idx" ON "payload"."modules" USING btree ("created_at");
  CREATE INDEX "lessons__order_idx" ON "payload"."lessons" USING btree ("_order");
  CREATE INDEX "lessons_slug_idx" ON "payload"."lessons" USING btree ("slug");
  CREATE INDEX "lessons_module_idx" ON "payload"."lessons" USING btree ("module_id");
  CREATE INDEX "lessons_course_idx" ON "payload"."lessons" USING btree ("course_id");
  CREATE INDEX "lessons_video_idx" ON "payload"."lessons" USING btree ("video_id");
  CREATE INDEX "lessons_updated_at_idx" ON "payload"."lessons" USING btree ("updated_at");
  CREATE INDEX "lessons_created_at_idx" ON "payload"."lessons" USING btree ("created_at");
  CREATE INDEX "lessons__status_idx" ON "payload"."lessons" USING btree ("_status");
  CREATE INDEX "_lessons_v_parent_idx" ON "payload"."_lessons_v" USING btree ("parent_id");
  CREATE INDEX "_lessons_v_version_version__order_idx" ON "payload"."_lessons_v" USING btree ("version__order");
  CREATE INDEX "_lessons_v_version_version_slug_idx" ON "payload"."_lessons_v" USING btree ("version_slug");
  CREATE INDEX "_lessons_v_version_version_module_idx" ON "payload"."_lessons_v" USING btree ("version_module_id");
  CREATE INDEX "_lessons_v_version_version_course_idx" ON "payload"."_lessons_v" USING btree ("version_course_id");
  CREATE INDEX "_lessons_v_version_version_video_idx" ON "payload"."_lessons_v" USING btree ("version_video_id");
  CREATE INDEX "_lessons_v_version_version_updated_at_idx" ON "payload"."_lessons_v" USING btree ("version_updated_at");
  CREATE INDEX "_lessons_v_version_version_created_at_idx" ON "payload"."_lessons_v" USING btree ("version_created_at");
  CREATE INDEX "_lessons_v_version_version__status_idx" ON "payload"."_lessons_v" USING btree ("version__status");
  CREATE INDEX "_lessons_v_created_at_idx" ON "payload"."_lessons_v" USING btree ("created_at");
  CREATE INDEX "_lessons_v_updated_at_idx" ON "payload"."_lessons_v" USING btree ("updated_at");
  CREATE INDEX "_lessons_v_latest_idx" ON "payload"."_lessons_v" USING btree ("latest");
  CREATE INDEX "authors_links_order_idx" ON "payload"."authors_links" USING btree ("_order");
  CREATE INDEX "authors_links_parent_id_idx" ON "payload"."authors_links" USING btree ("_parent_id");
  CREATE INDEX "authors_avatar_idx" ON "payload"."authors" USING btree ("avatar_id");
  CREATE INDEX "authors_updated_at_idx" ON "payload"."authors" USING btree ("updated_at");
  CREATE INDEX "authors_created_at_idx" ON "payload"."authors" USING btree ("created_at");
  CREATE INDEX "mux_video_playback_options_order_idx" ON "payload"."mux_video_playback_options" USING btree ("_order");
  CREATE INDEX "mux_video_playback_options_parent_id_idx" ON "payload"."mux_video_playback_options" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "mux_video_title_idx" ON "payload"."mux_video" USING btree ("title");
  CREATE UNIQUE INDEX "mux_video_asset_id_idx" ON "payload"."mux_video" USING btree ("asset_id");
  CREATE INDEX "mux_video_updated_at_idx" ON "payload"."mux_video" USING btree ("updated_at");
  CREATE INDEX "mux_video_created_at_idx" ON "payload"."mux_video" USING btree ("created_at");
  ALTER TABLE "payload"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_courses_fk" FOREIGN KEY ("courses_id") REFERENCES "payload"."courses"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_modules_fk" FOREIGN KEY ("modules_id") REFERENCES "payload"."modules"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_lessons_fk" FOREIGN KEY ("lessons_id") REFERENCES "payload"."lessons"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_authors_fk" FOREIGN KEY ("authors_id") REFERENCES "payload"."authors"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload"."payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_mux_video_fk" FOREIGN KEY ("mux_video_id") REFERENCES "payload"."mux_video"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_courses_id_idx" ON "payload"."payload_locked_documents_rels" USING btree ("courses_id");
  CREATE INDEX "payload_locked_documents_rels_modules_id_idx" ON "payload"."payload_locked_documents_rels" USING btree ("modules_id");
  CREATE INDEX "payload_locked_documents_rels_lessons_id_idx" ON "payload"."payload_locked_documents_rels" USING btree ("lessons_id");
  CREATE INDEX "payload_locked_documents_rels_authors_id_idx" ON "payload"."payload_locked_documents_rels" USING btree ("authors_id");
  CREATE INDEX "payload_locked_documents_rels_mux_video_id_idx" ON "payload"."payload_locked_documents_rels" USING btree ("mux_video_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "payload"."courses" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "payload"."courses_texts" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "payload"."_courses_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "payload"."_courses_v_texts" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "payload"."modules" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "payload"."lessons" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "payload"."_lessons_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "payload"."authors_links" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "payload"."authors" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "payload"."mux_video_playback_options" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "payload"."mux_video" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "payload"."courses" CASCADE;
  DROP TABLE "payload"."courses_texts" CASCADE;
  DROP TABLE "payload"."_courses_v" CASCADE;
  DROP TABLE "payload"."_courses_v_texts" CASCADE;
  DROP TABLE "payload"."modules" CASCADE;
  DROP TABLE "payload"."lessons" CASCADE;
  DROP TABLE "payload"."_lessons_v" CASCADE;
  DROP TABLE "payload"."authors_links" CASCADE;
  DROP TABLE "payload"."authors" CASCADE;
  DROP TABLE "payload"."mux_video_playback_options" CASCADE;
  DROP TABLE "payload"."mux_video" CASCADE;
  ALTER TABLE "payload"."payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_courses_fk";
  
  ALTER TABLE "payload"."payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_modules_fk";
  
  ALTER TABLE "payload"."payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_lessons_fk";
  
  ALTER TABLE "payload"."payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_authors_fk";
  
  ALTER TABLE "payload"."payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_mux_video_fk";
  
  DROP INDEX "payload"."payload_locked_documents_rels_courses_id_idx";
  DROP INDEX "payload"."payload_locked_documents_rels_modules_id_idx";
  DROP INDEX "payload"."payload_locked_documents_rels_lessons_id_idx";
  DROP INDEX "payload"."payload_locked_documents_rels_authors_id_idx";
  DROP INDEX "payload"."payload_locked_documents_rels_mux_video_id_idx";
  ALTER TABLE "payload"."payload_locked_documents_rels" DROP COLUMN "courses_id";
  ALTER TABLE "payload"."payload_locked_documents_rels" DROP COLUMN "modules_id";
  ALTER TABLE "payload"."payload_locked_documents_rels" DROP COLUMN "lessons_id";
  ALTER TABLE "payload"."payload_locked_documents_rels" DROP COLUMN "authors_id";
  ALTER TABLE "payload"."payload_locked_documents_rels" DROP COLUMN "mux_video_id";
  DROP TYPE "payload"."enum_courses_language";
  DROP TYPE "payload"."enum_courses_level";
  DROP TYPE "payload"."enum_courses_price_mode";
  DROP TYPE "payload"."enum_courses_status";
  DROP TYPE "payload"."enum__courses_v_version_language";
  DROP TYPE "payload"."enum__courses_v_version_level";
  DROP TYPE "payload"."enum__courses_v_version_price_mode";
  DROP TYPE "payload"."enum__courses_v_version_status";
  DROP TYPE "payload"."enum_lessons_status";
  DROP TYPE "payload"."enum__lessons_v_version_status";
  DROP TYPE "payload"."enum_mux_video_playback_options_playback_policy";`)
}
