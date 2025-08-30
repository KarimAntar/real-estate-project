// app/fonts.ts
import { Poppins } from "next/font/google";

export const poppins = Poppins({
  subsets: ["latin"],
  weight: ["100","200","300","400","500","600","700","800","900"],
  fallback: ["Poppins Fallback", "sans-serif"],
});