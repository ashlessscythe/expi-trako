"use client";

import { useTheme } from "next-themes";
import {
  Menu,
  X,
  Github,
  Monitor,
  Palette,
  Leaf,
  Heart,
  Droplet,
  Rocket,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { APP_NAME } from "@/lib/config";
import { useAuth } from "@/lib/auth-context";
import { FeedbackModal } from "./feedback-modal";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function Header() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const { user, signOut } = useAuth();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);

  // Ensure theme selection works properly with SSR
  useEffect(() => {
    setMounted(true);
  }, []);

  const navLinks = user
    ? [
        { href: "/dashboard", label: "Dashboard" },
        { href: "/requests", label: "Requests" },
        // Show reports for both ADMIN and REPORT_RUNNER
        ...(user.role === "ADMIN" || user.role === "REPORT_RUNNER"
          ? [{ href: "/reports", label: "Reports" }]
          : []),
        // Admin-only links
        ...(user.role === "ADMIN"
          ? [
              { href: "/admin", label: "Admin Dashboard" },
              { href: "/admin/users", label: "User Management" },
            ]
          : []),
      ]
    : [];

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href={"/"} className="flex items-center space-x-2">
              <span className="font-semibold">{APP_NAME}</span>
            </Link>
            <nav className="hidden gap-6 md:flex">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center text-sm font-medium transition-colors hover:text-primary ${
                    pathname === link.href
                      ? "text-primary"
                      : "text-muted-foreground"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden md:flex md:items-center md:gap-4">
              {user ? (
                <>
                  <span className="text-sm text-muted-foreground">
                    {user.email}
                  </span>
                  <button
                    onClick={() => setFeedbackModalOpen(true)}
                    className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 flex items-center gap-1"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="lucide lucide-message-square"
                    >
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                    Feedback
                  </button>
                  <button
                    onClick={signOut}
                    className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/signin"
                    className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/signup"
                    className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                  >
                    Register
                  </Link>
                </>
              )}
            </div>
            <button
              className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-input bg-background md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-4 w-4" />
              ) : (
                <Menu className="h-4 w-4" />
              )}
            </button>
            <Select
              value={mounted ? theme : undefined}
              onValueChange={(value) => setTheme(value)}
            >
              <SelectTrigger className="w-[140px] h-9">
                <SelectValue placeholder="Theme" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">
                  <div className="flex items-center gap-2">
                    <Monitor className="h-4 w-4" />
                    <span>Corporate</span>
                  </div>
                </SelectItem>
                <SelectItem value="dark">
                  <div className="flex items-center gap-2">
                    <Monitor className="h-4 w-4" />
                    <span>Dark</span>
                  </div>
                </SelectItem>
                <SelectItem value="catppuccin">
                  <div className="flex items-center gap-2">
                    <Palette className="h-4 w-4 text-purple-500" />
                    <span>Catppuccin</span>
                  </div>
                </SelectItem>
                <SelectItem value="mint">
                  <div className="flex items-center gap-2">
                    <Leaf className="h-4 w-4 text-green-500" />
                    <span>Mint</span>
                  </div>
                </SelectItem>
                <SelectItem value="crimson">
                  <div className="flex items-center gap-2">
                    <Heart className="h-4 w-4 text-red-500" />
                    <span>Crimson</span>
                  </div>
                </SelectItem>
                <SelectItem value="seafoam">
                  <div className="flex items-center gap-2">
                    <Droplet className="h-4 w-4 text-teal-500" />
                    <span>Seafoam</span>
                  </div>
                </SelectItem>
                <SelectItem value="rocket">
                  <div className="flex items-center gap-2">
                    <Rocket className="h-4 w-4 text-blue-500" />
                    <span>Rocket</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            {!user && (
              <Link
                href="https://github.com/ashlessscythe/expi-trako"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-input bg-background text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <Github className="h-4 w-4" />
                <span className="sr-only">GitHub repository</span>
              </Link>
            )}
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="border-b bg-background md:hidden">
            <div className="container py-4">
              <nav className="flex flex-col gap-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`text-sm font-medium transition-colors hover:text-primary ${
                      pathname === link.href
                        ? "text-primary"
                        : "text-muted-foreground"
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
                <div className="flex flex-col gap-2">
                  {user ? (
                    <>
                      <span className="text-sm text-muted-foreground">
                        {user.email}
                      </span>
                      <button
                        onClick={() => {
                          setFeedbackModalOpen(true);
                          setMobileMenuOpen(false);
                        }}
                        className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 flex items-center gap-1 w-fit"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="lucide lucide-message-square"
                        >
                          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                        </svg>
                        Feedback
                      </button>
                      <button
                        onClick={() => {
                          signOut();
                          setMobileMenuOpen(false);
                        }}
                        className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
                      >
                        Sign Out
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        href="/signin"
                        className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Sign In
                      </Link>
                      <Link
                        href="/signup"
                        className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Register
                      </Link>
                    </>
                  )}
                </div>
              </nav>
            </div>
          </div>
        )}
      </header>

      {/* Feedback Modal */}
      {user && (
        <FeedbackModal
          open={feedbackModalOpen}
          onOpenChange={setFeedbackModalOpen}
        />
      )}
    </>
  );
}
