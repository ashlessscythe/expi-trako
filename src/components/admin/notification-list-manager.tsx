"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";

type NotificationList = {
  id: string;
  siteId: string;
  plant: string;
  emails: string[];
};

export function NotificationListManager() {
  const router = useRouter();
  const [selectedSite, setSelectedSite] = useState<string>("");
  const [selectedPlant, setSelectedPlant] = useState<string>("");
  const [emailInput, setEmailInput] = useState<string>("");
  const [notificationList, setNotificationList] =
    useState<NotificationList | null>(null);
  const [sites, setSites] = useState<{ id: string; name: string }[]>([]);
  const [plants, setPlants] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load sites on component mount
  const loadSites = async () => {
    try {
      const response = await fetch("/api/sites");
      const data = await response.json();
      setSites(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load sites",
        variant: "destructive",
      });
    }
  };

  // Load plants for selected site
  const loadPlants = async (siteId: string) => {
    try {
      const response = await fetch(`/api/sites/${siteId}/plants`);
      const data = await response.json();
      setPlants(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load plants",
        variant: "destructive",
      });
    }
  };

  // Load notification list for selected site and plant
  const loadNotificationList = async (siteId: string, plant: string) => {
    try {
      const response = await fetch(
        `/api/notification-lists?siteId=${siteId}&plant=${plant}`
      );
      const data = await response.json();
      setNotificationList(data);
    } catch (error) {
      setNotificationList(null);
    }
  };

  // Handle site selection
  const handleSiteChange = async (siteId: string) => {
    setSelectedSite(siteId);
    setSelectedPlant("");
    setNotificationList(null);
    await loadPlants(siteId);
  };

  // Handle plant selection
  const handlePlantChange = async (plant: string) => {
    setSelectedPlant(plant);
    if (selectedSite && plant) {
      await loadNotificationList(selectedSite, plant);
    }
  };

  // Validate single email
  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  };

  // Add email(s) to list
  const handleAddEmail = async () => {
    if (!emailInput || !selectedSite || !selectedPlant) return;

    // Split input on commas and clean up each email
    const emailsToAdd = emailInput
      .split(",")
      .map((e) => e.trim())
      .filter((e) => e.length > 0);

    // Validate all emails
    const invalidEmails = emailsToAdd.filter((email) => !isValidEmail(email));
    if (invalidEmails.length > 0) {
      toast({
        title: "Invalid Email(s)",
        description: `The following emails are invalid: ${invalidEmails.join(", ")}`,
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const currentEmails = notificationList?.emails || [];
      const newEmails = [...new Set([...currentEmails, ...emailsToAdd])]; // Remove duplicates

      const response = await fetch("/api/notification-lists", {
        method: notificationList ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          siteId: selectedSite,
          plant: selectedPlant,
          emails: newEmails,
        }),
      });

      if (!response.ok) throw new Error("Failed to update notification list");

      const updatedList = await response.json();
      setNotificationList(updatedList);
      setEmailInput("");
      toast({
        title: "Success",
        description: "Email added to notification list",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update notification list",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Remove email from list
  const handleRemoveEmail = async (emailToRemove: string) => {
    if (!notificationList || !selectedSite || !selectedPlant) return;

    setIsLoading(true);
    try {
      const response = await fetch("/api/notification-lists", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          siteId: selectedSite,
          plant: selectedPlant,
          emails: notificationList.emails.filter(
            (email) => email !== emailToRemove
          ),
        }),
      });

      if (!response.ok) throw new Error("Failed to update notification list");

      const updatedList = await response.json();
      setNotificationList(updatedList);
      toast({
        title: "Success",
        description: "Email removed from notification list",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update notification list",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Load sites on mount
  useEffect(() => {
    loadSites();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Manage Plant Notification Lists</CardTitle>
        <CardDescription>
          Configure email notifications for plant-specific requests
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Site</label>
            <Select value={selectedSite} onValueChange={handleSiteChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select a site" />
              </SelectTrigger>
              <SelectContent>
                {sites.map((site) => (
                  <SelectItem key={site.id} value={site.id}>
                    {site.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Plant</label>
            <Select
              value={selectedPlant}
              onValueChange={handlePlantChange}
              disabled={!selectedSite}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a plant" />
              </SelectTrigger>
              <SelectContent>
                {plants.map((plant) => (
                  <SelectItem key={plant} value={plant}>
                    {plant}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {selectedSite && selectedPlant && (
          <div className="space-y-4">
            <div className="flex space-x-2">
              <Input
                type="text"
                placeholder="Enter email address(es) - comma separated"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
              />
              <Button
                onClick={handleAddEmail}
                disabled={isLoading || !emailInput}
              >
                Add Email
              </Button>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">Current Notification List</h4>
              {notificationList?.emails.length ? (
                <div className="space-y-2">
                  {notificationList.emails.map((email) => (
                    <div
                      key={email}
                      className="flex items-center justify-between p-2 bg-secondary rounded-md"
                    >
                      <span>{email}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveEmail(email)}
                        disabled={isLoading}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No emails in notification list
                </p>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
