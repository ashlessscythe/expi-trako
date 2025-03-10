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

        [data-theme="fire"] {
          --background: 20 100% 97%;
          --foreground: 20 80% 10%;
          --card: 20 100% 97%;
          --card-foreground: 20 80% 10%;
          --popover: 20 100% 97%;
          --popover-foreground: 20 80% 10%;
          --primary: 20 100% 50%;
          --primary-foreground: 0 0% 100%;
          --secondary: 20 30% 90%;
          --secondary-foreground: 20 80% 30%;
          --muted: 20 30% 90%;
          --muted-foreground: 20 40% 40%;
          --accent: 20 30% 90%;
          --accent-foreground: 20 80% 30%;
          --destructive: 0 100% 50%;
          --destructive-foreground: 0 0% 100%;
          --border: 20 30% 85%;
          --input: 20 30% 85%;
          --ring: 20 100% 50%;
        }

        [data-theme="water"] {
          --background: 200 100% 97%;
          --foreground: 200 80% 10%;
          --card: 200 100% 97%;
          --card-foreground: 200 80% 10%;
          --popover: 200 100% 97%;
          --popover-foreground: 200 80% 10%;
          --primary: 200 100% 50%;
          --primary-foreground: 0 0% 100%;
          --secondary: 200 30% 90%;
          --secondary-foreground: 200 80% 30%;
          --muted: 200 30% 90%;
          --muted-foreground: 200 40% 40%;
          --accent: 200 30% 90%;
          --accent-foreground: 200 80% 30%;
          --destructive: 0 100% 50%;
          --destructive-foreground: 0 0% 100%;
          --border: 200 30% 85%;
          --input: 200 30% 85%;
          --ring: 200 100% 50%;
        }

        [data-theme="earth"] {
          --background: 120 30% 97%;
          --foreground: 120 80% 10%;
          --card: 120 30% 97%;
          --card-foreground: 120 80% 10%;
          --popover: 120 30% 97%;
          --popover-foreground: 120 80% 10%;
          --primary: 120 70% 40%;
          --primary-foreground: 0 0% 100%;
          --secondary: 120 20% 90%;
          --secondary-foreground: 120 80% 30%;
          --muted: 120 20% 90%;
          --muted-foreground: 120 40% 40%;
          --accent: 120 20% 90%;
          --accent-foreground: 120 80% 30%;
          --destructive: 0 100% 50%;
          --destructive-foreground: 0 0% 100%;
          --border: 120 20% 85%;
          --input: 120 20% 85%;
          --ring: 120 70% 40%;
        }

        [data-theme="air"] {
          --background: 190 30% 97%;
          --foreground: 190 80% 10%;
          --card: 190 30% 97%;
          --card-foreground: 190 80% 10%;
          --popover: 190 30% 97%;
          --popover-foreground: 190 80% 10%;
          --primary: 190 90% 50%;
          --primary-foreground: 0 0% 100%;
          --secondary: 190 20% 90%;
          --secondary-foreground: 190 80% 30%;
          --muted: 190 20% 90%;
          --muted-foreground: 190 40% 40%;
          --accent: 190 20% 90%;
          --accent-foreground: 190 80% 30%;
          --destructive: 0 100% 50%;
          --destructive-foreground: 0 0% 100%;
          --border: 190 20% 85%;
          --input: 190 20% 85%;
          --ring: 190 90% 50%;
        }

        [data-theme="sleek"] {
          --background: 270 20% 97%;
          --foreground: 270 80% 10%;
          --card: 270 20% 97%;
          --card-foreground: 270 80% 10%;
          --popover: 270 20% 97%;
          --popover-foreground: 270 80% 10%;
          --primary: 270 80% 50%;
          --primary-foreground: 0 0% 100%;
          --secondary: 270 20% 90%;
          --secondary-foreground: 270 80% 30%;
          --muted: 270 20% 90%;
          --muted-foreground: 270 40% 40%;
          --accent: 270 20% 90%;
          --accent-foreground: 270 80% 30%;
          --destructive: 0 100% 50%;
          --destructive-foreground: 0 0% 100%;
          --border: 270 20% 85%;
          --input: 270 20% 85%;
          --ring: 270 80% 50%;
        }
      `}</style>
      <NextThemesProvider
        {...props}
        themes={["light", "dark", "fire", "water", "earth", "air", "sleek"]}
        defaultTheme="light"
      >
        {children}
      </NextThemesProvider>
    </>
  );
}
