"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";

export function EmailSettingsCard() {
  const { toast } = useToast();
  const [sendCompletionEmails, setSendCompletionEmails] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch("/api/admin/settings/email");
        if (!response.ok) throw new Error("Failed to fetch settings");
        const data = await response.json();
        setSendCompletionEmails(data.sendCompletionEmails);
      } catch (error) {
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

  const handleToggle = async (checked: boolean) => {
    try {
      const response = await fetch("/api/admin/settings/email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ sendCompletionEmails: checked }),
      });

      if (!response.ok) throw new Error("Failed to update settings");

      setSendCompletionEmails(checked);
      toast({
        title: "Success",
        description: `Completion emails ${checked ? "enabled" : "disabled"}`,
      });
    } catch (error) {
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
            Send emails on request completion
          </Label>
          <Switch
            id="completion-emails"
            checked={sendCompletionEmails}
            onCheckedChange={handleToggle}
          />
        </div>
      </CardContent>
    </Card>
  );
}
