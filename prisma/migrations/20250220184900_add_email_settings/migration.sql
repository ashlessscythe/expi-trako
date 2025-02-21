-- AlterTable
ALTER TABLE "SystemSetting" ADD COLUMN "type" TEXT NOT NULL DEFAULT 'string',
  ADD COLUMN "description" TEXT;

-- Insert default email settings
INSERT INTO "SystemSetting" ("key", "value", "type", "description")
VALUES 
  ('sendCompletionEmails', 'true', 'boolean', 'Send emails when requests are completed'),
  ('sendNewUserEmails', 'true', 'boolean', 'Send notifications when new users register')
ON CONFLICT ("key") DO NOTHING;
