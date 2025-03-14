"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { type ThemeProviderProps } from "next-themes";

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <>
      <style jsx global>{`
        :root {
          /* Default light theme (Corporate) */
          --background: 0 0% 100%;
          --foreground: 222.2 84% 4.9%;
          --card: 0 0% 100%;
          --card-foreground: 222.2 84% 4.9%;
          --popover: 0 0% 100%;
          --popover-foreground: 222.2 84% 4.9%;
          --primary: 221.2 83.2% 53.3%;
          --primary-foreground: 210 40% 98%;
          --secondary: 210 40% 96.1%;
          --secondary-foreground: 222.2 47.4% 11.2%;
          --muted: 210 40% 96.1%;
          --muted-foreground: 215.4 16.3% 46.9%;
          --accent: 210 40% 96.1%;
          --accent-foreground: 222.2 47.4% 11.2%;
          --destructive: 0 84.2% 60.2%;
          --destructive-foreground: 210 40% 98%;
          --border: 214.3 31.8% 91.4%;
          --input: 214.3 31.8% 91.4%;
          --ring: 221.2 83.2% 53.3%;
        }

        [data-theme="dark"] {
          --background: 222.2 84% 4.9%;
          --foreground: 210 40% 98%;
          --card: 222.2 84% 4.9%;
          --card-foreground: 210 40% 98%;
          --popover: 222.2 84% 4.9%;
          --popover-foreground: 210 40% 98%;
          --primary: 217.2 91.2% 59.8%;
          --primary-foreground: 222.2 47.4% 11.2%;
          --secondary: 217.2 32.6% 17.5%;
          --secondary-foreground: 210 40% 98%;
          --muted: 217.2 32.6% 17.5%;
          --muted-foreground: 215 20.2% 65.1%;
          --accent: 217.2 32.6% 17.5%;
          --accent-foreground: 210 40% 98%;
          --destructive: 0 62.8% 30.6%;
          --destructive-foreground: 210 40% 98%;
          --border: 217.2 32.6% 17.5%;
          --input: 217.2 32.6% 17.5%;
          --ring: 224.3 76.3% 48%;
        }

        [data-theme="catppuccin"] {
          --background: 280 20% 97%;
          --foreground: 280 60% 10%;
          --card: 280 20% 97%;
          --card-foreground: 280 60% 10%;
          --popover: 280 20% 97%;
          --popover-foreground: 280 60% 10%;
          --primary: 310 80% 65%;
          --primary-foreground: 0 0% 100%;
          --secondary: 280 30% 90%;
          --secondary-foreground: 280 60% 30%;
          --muted: 280 30% 90%;
          --muted-foreground: 280 40% 40%;
          --accent: 200 80% 60%;
          --accent-foreground: 0 0% 100%;
          --destructive: 0 100% 50%;
          --destructive-foreground: 0 0% 100%;
          --border: 280 30% 85%;
          --input: 280 30% 85%;
          --ring: 310 80% 65%;
        }

        [data-theme="mint"] {
          --background: 150 30% 97%;
          --foreground: 150 80% 10%;
          --card: 150 30% 97%;
          --card-foreground: 150 80% 10%;
          --popover: 150 30% 97%;
          --popover-foreground: 150 80% 10%;
          --primary: 150 70% 40%;
          --primary-foreground: 0 0% 100%;
          --secondary: 150 20% 90%;
          --secondary-foreground: 150 80% 30%;
          --muted: 150 20% 90%;
          --muted-foreground: 150 40% 40%;
          --accent: 150 60% 50%;
          --accent-foreground: 0 0% 100%;
          --destructive: 0 100% 50%;
          --destructive-foreground: 0 0% 100%;
          --border: 150 20% 85%;
          --input: 150 20% 85%;
          --ring: 150 70% 40%;
        }

        [data-theme="crimson"] {
          --background: 0 20% 97%;
          --foreground: 0 80% 10%;
          --card: 0 20% 97%;
          --card-foreground: 0 80% 10%;
          --popover: 0 20% 97%;
          --popover-foreground: 0 80% 10%;
          --primary: 0 80% 45%;
          --primary-foreground: 0 0% 100%;
          --secondary: 0 20% 90%;
          --secondary-foreground: 0 80% 30%;
          --muted: 0 20% 90%;
          --muted-foreground: 0 40% 40%;
          --accent: 0 60% 50%;
          --accent-foreground: 0 0% 100%;
          --destructive: 0 100% 50%;
          --destructive-foreground: 0 0% 100%;
          --border: 0 20% 85%;
          --input: 0 20% 85%;
          --ring: 0 80% 45%;
        }

        [data-theme="seafoam"] {
          --background: 180 30% 97%;
          --foreground: 180 80% 10%;
          --card: 180 30% 97%;
          --card-foreground: 180 80% 10%;
          --popover: 180 30% 97%;
          --popover-foreground: 180 80% 10%;
          --primary: 180 70% 40%;
          --primary-foreground: 0 0% 100%;
          --secondary: 180 20% 90%;
          --secondary-foreground: 180 80% 30%;
          --muted: 180 20% 90%;
          --muted-foreground: 180 40% 40%;
          --accent: 180 60% 50%;
          --accent-foreground: 0 0% 100%;
          --destructive: 0 100% 50%;
          --destructive-foreground: 0 0% 100%;
          --border: 180 20% 85%;
          --input: 180 20% 85%;
          --ring: 180 70% 40%;
        }

        [data-theme="rocket"] {
          --background: 220 30% 97%;
          --foreground: 220 80% 10%;
          --card: 220 30% 97%;
          --card-foreground: 220 80% 10%;
          --popover: 220 30% 97%;
          --popover-foreground: 220 80% 10%;
          --primary: 220 80% 50%;
          --primary-foreground: 0 0% 100%;
          --secondary: 220 20% 90%;
          --secondary-foreground: 220 80% 30%;
          --muted: 220 20% 90%;
          --muted-foreground: 220 40% 40%;
          --accent: 260 60% 60%;
          --accent-foreground: 0 0% 100%;
          --destructive: 0 100% 50%;
          --destructive-foreground: 0 0% 100%;
          --border: 220 20% 85%;
          --input: 220 20% 85%;
          --ring: 220 80% 50%;
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
          "rocket",
        ]}
        defaultTheme="light"
      >
        {children}
      </NextThemesProvider>
    </>
  );
}
