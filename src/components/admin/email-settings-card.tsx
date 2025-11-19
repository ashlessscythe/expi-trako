"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";

interface RawEmailSetting {
  key: string;
  value: string;
}

type EmailSettingKey = "sendCompletionEmails" | "sendNewUserEmails";

export function EmailSettingsCard() {
  const { toast } = useToast();
  const [settings, setSettings] = useState({
    sendCompletionEmails: true,
    sendNewUserEmails: true,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch("/api/admin/settings/email");
        if (!response.ok) throw new Error("Failed to fetch settings");
        const data: RawEmailSetting[] = await response.json();

        // Convert string values to booleans
        setSettings({
          sendCompletionEmails:
            data.find((setting) => setting.key === "sendCompletionEmails")
              ?.value === "true",
          sendNewUserEmails:
            data.find((setting) => setting.key === "sendNewUserEmails")
              ?.value === "true",
        });
      } catch (error) {
        console.error("Failed to load email settings", error);
        toast({
          title: "Error",
          description: "Failed to load email settings",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, [toast]);

  const updateSetting = async (key: EmailSettingKey, checked: boolean) => {
    try {
      const response = await fetch("/api/admin/settings/email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          key,
          value: checked.toString(),
          type: "boolean",
        }),
      });

      if (!response.ok) throw new Error("Failed to update settings");

      setSettings((prev) => ({
        ...prev,
        [key]: checked,
      }));

      toast({
        title: "Success",
        description: `${key === "sendCompletionEmails" ? "Completion" : "New user"} emails ${checked ? "enabled" : "disabled"}`,
      });
    } catch (error) {
      console.error("Failed to update email settings", error);
      toast({
        title: "Error",
        description: "Failed to update email settings",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Email Settings</CardTitle>
        </CardHeader>
        <CardContent>Loading...</CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Email Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between space-x-4">
          <Label htmlFor="completion-emails">
            Send action emails (completion, feedback, etc.)
          </Label>
          <Switch
            id="completion-emails"
            checked={settings.sendCompletionEmails}
            onCheckedChange={(checked) =>
              updateSetting("sendCompletionEmails", checked)
            }
          />
        </div>
        <div className="flex items-center justify-between space-x-4">
          <Label htmlFor="new-user-emails">
            Send emails when new users register
          </Label>
          <Switch
            id="new-user-emails"
            checked={settings.sendNewUserEmails}
            onCheckedChange={(checked) =>
              updateSetting("sendNewUserEmails", checked)
            }
          />
        </div>
      </CardContent>
    </Card>
  );
}
