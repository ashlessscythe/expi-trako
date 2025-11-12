"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { type ThemeProviderProps } from "next-themes";

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <>
      <style jsx global>{`
        :root {
          /* Default light theme (Corporate) - Enhanced */
          --background: 0 0% 100%;
          --foreground: 222.2 90% 3%;
          --card: 0 0% 100%;
          --card-foreground: 222.2 90% 3%;
          --popover: 0 0% 100%;
          --popover-foreground: 222.2 90% 3%;
          --primary: 221.2 90% 58%;
          --primary-foreground: 0 0% 100%;
          --secondary: 210 35% 94%;
          --secondary-foreground: 222.2 50% 8%;
          --muted: 210 35% 94%;
          --muted-foreground: 215.4 20% 42%;
          --accent: 210 35% 94%;
          --accent-foreground: 222.2 50% 8%;
          --destructive: 0 90% 65%;
          --destructive-foreground: 0 0% 100%;
          --border: 214.3 28% 88%;
          --input: 214.3 28% 88%;
          --ring: 221.2 90% 58%;
        }

        [data-theme="dark"] {
          --background: 222.2 90% 3%;
          --foreground: 210 45% 98%;
          --card: 222.2 90% 5%;
          --card-foreground: 210 45% 98%;
          --popover: 222.2 90% 5%;
          --popover-foreground: 210 45% 98%;
          --primary: 217.2 95% 65%;
          --primary-foreground: 222.2 50% 8%;
          --secondary: 217.2 28% 15%;
          --secondary-foreground: 210 45% 98%;
          --muted: 217.2 28% 15%;
          --muted-foreground: 215 25% 70%;
          --accent: 217.2 28% 15%;
          --accent-foreground: 210 45% 98%;
          --destructive: 0 70% 55%;
          --destructive-foreground: 0 0% 100%;
          --border: 217.2 28% 20%;
          --input: 217.2 28% 20%;
          --ring: 224.3 80% 55%;
        }

        [data-theme="catppuccin"] {
          --background: 280 15% 95%;
          --foreground: 280 75% 8%;
          --card: 280 15% 95%;
          --card-foreground: 280 75% 8%;
          --popover: 280 15% 95%;
          --popover-foreground: 280 75% 8%;
          --primary: 310 90% 70%;
          --primary-foreground: 0 0% 100%;
          --secondary: 280 25% 88%;
          --secondary-foreground: 280 70% 25%;
          --muted: 280 25% 88%;
          --muted-foreground: 280 50% 35%;
          --accent: 200 85% 65%;
          --accent-foreground: 0 0% 100%;
          --destructive: 0 95% 55%;
          --destructive-foreground: 0 0% 100%;
          --border: 280 25% 82%;
          --input: 280 25% 82%;
          --ring: 310 90% 70%;
        }

        [data-theme="mint"] {
          --background: 150 25% 96%;
          --foreground: 150 85% 8%;
          --card: 150 25% 96%;
          --card-foreground: 150 85% 8%;
          --popover: 150 25% 96%;
          --popover-foreground: 150 85% 8%;
          --primary: 150 75% 45%;
          --primary-foreground: 0 0% 100%;
          --secondary: 150 18% 88%;
          --secondary-foreground: 150 85% 25%;
          --muted: 150 18% 88%;
          --muted-foreground: 150 45% 35%;
          --accent: 150 65% 55%;
          --accent-foreground: 0 0% 100%;
          --destructive: 0 95% 55%;
          --destructive-foreground: 0 0% 100%;
          --border: 150 18% 82%;
          --input: 150 18% 82%;
          --ring: 150 75% 45%;
        }

        [data-theme="crimson"] {
          --background: 0 15% 96%;
          --foreground: 0 85% 8%;
          --card: 0 15% 96%;
          --card-foreground: 0 85% 8%;
          --popover: 0 15% 96%;
          --popover-foreground: 0 85% 8%;
          --primary: 0 85% 50%;
          --primary-foreground: 0 0% 100%;
          --secondary: 0 18% 88%;
          --secondary-foreground: 0 85% 25%;
          --muted: 0 18% 88%;
          --muted-foreground: 0 45% 35%;
          --accent: 0 65% 55%;
          --accent-foreground: 0 0% 100%;
          --destructive: 0 95% 55%;
          --destructive-foreground: 0 0% 100%;
          --border: 0 18% 82%;
          --input: 0 18% 82%;
          --ring: 0 85% 50%;
        }

        [data-theme="seafoam"] {
          --background: 180 25% 96%;
          --foreground: 180 85% 8%;
          --card: 180 25% 96%;
          --card-foreground: 180 85% 8%;
          --popover: 180 25% 96%;
          --popover-foreground: 180 85% 8%;
          --primary: 180 75% 45%;
          --primary-foreground: 0 0% 100%;
          --secondary: 180 18% 88%;
          --secondary-foreground: 180 85% 25%;
          --muted: 180 18% 88%;
          --muted-foreground: 180 45% 35%;
          --accent: 180 65% 55%;
          --accent-foreground: 0 0% 100%;
          --destructive: 0 95% 55%;
          --destructive-foreground: 0 0% 100%;
          --border: 180 18% 82%;
          --input: 180 18% 82%;
          --ring: 180 75% 45%;
        }

        [data-theme="cyberpunk"] {
          --background: 150 100% 5%;
          --foreground: 150 100% 95%;
          --card: 150 100% 8%;
          --card-foreground: 150 100% 95%;
          --popover: 150 100% 8%;
          --popover-foreground: 150 100% 95%;
          --primary: 150 100% 50%;
          --primary-foreground: 150 100% 5%;
          --secondary: 150 100% 12%;
          --secondary-foreground: 150 100% 85%;
          --muted: 150 100% 12%;
          --muted-foreground: 150 80% 60%;
          --accent: 180 100% 55%;
          --accent-foreground: 150 100% 5%;
          --destructive: 0 100% 60%;
          --destructive-foreground: 0 0% 100%;
          --border: 150 100% 20%;
          --input: 150 100% 20%;
          --ring: 150 100% 50%;
        }

        [data-theme="neon"] {
          --background: 300 100% 3%;
          --foreground: 300 100% 98%;
          --card: 300 100% 6%;
          --card-foreground: 300 100% 98%;
          --popover: 300 100% 6%;
          --popover-foreground: 300 100% 98%;
          --primary: 320 100% 65%;
          --primary-foreground: 300 100% 3%;
          --secondary: 300 100% 10%;
          --secondary-foreground: 300 100% 90%;
          --muted: 300 100% 10%;
          --muted-foreground: 300 80% 70%;
          --accent: 180 100% 60%;
          --accent-foreground: 300 100% 3%;
          --destructive: 0 100% 65%;
          --destructive-foreground: 0 0% 100%;
          --border: 300 100% 25%;
          --input: 300 100% 25%;
          --ring: 320 100% 65%;
        }
      `}</style>
      <NextThemesProvider
        {...props}
        themes={[
          "light",
          "dark",
          "catppuccin",
          "mint",
          "crimson",
          "seafoam",
          "cyberpunk",
          "neon",
        ]}
        defaultTheme="light"
      >
        {children}
      </NextThemesProvider>
    </>
  );
}
