// components/layout/FooterComponent.tsx
import { FooterContent } from '@prisma/client';
import Link from 'next/link';
// Ensure all icons you intend to use are imported EXACTLY as named by lucide-react
import {
  Twitter,
  Github,
  Linkedin,
  Facebook,
  Instagram,
  Youtube,
  Twitch,
  Globe // For a generic website or other link
  // Add any other icons you might use from lucide-react
} from 'lucide-react';

// --- PRE-RENDER DEBUGGING (Server Components or during build) ---
// This log runs when the component module is first evaluated.
// console.log('[FooterComponent Module] Lucide Twitter Icon at import time:', typeof Twitter, Twitter);
// If 'typeof Twitter' is 'undefined' here, there's a major issue with the import or lucide-react itself.

// Interface for the structure of individual links expected from Prisma's Json field
interface FooterLink {
  text: string;
  href: string;
}

// Interface for the structure of individual social media links expected from Prisma's Json field
interface SocialLink {
  platform: string;
  url: string;
}

interface FooterComponentProps {
  data: FooterContent | null;
}

// Make sure this map is comprehensive and keys are ALWAYS lowercase
const socialIcons: { [key: string]: React.ElementType | undefined } = {
  twitter: Twitter,
  github: Github,
  linkedin: Linkedin,
  facebook: Facebook,
  instagram: Instagram,
  youtube: Youtube,
  twitch: Twitch,
  website: Globe,
  // Add more platform keys (lowercase) and their corresponding Lucide icons here
  // e.g., 'tiktok': TikTok, (ensure TikTok is imported from lucide-react)
};

// New map for displaying platform names with correct capitalization in fallback messages
const displayPlatformNames: { [key: string]: string } = {
  twitter: "Twitter",
  github: "GitHub",
  linkedin: "LinkedIn",
  facebook: "Facebook",
  instagram: "Instagram",
  youtube: "YouTube",
  twitch: "Twitch",
  website: "Website",
  // Add other platforms as needed
};

export default function FooterComponent({ data }: FooterComponentProps) {
  // --- RUNTIME DEBUGGING (Client-side, in the browser) ---
  // Uncomment these lines in your local file to see the logs in your browser's developer console.

  /*
  console.log('[FooterComponent Render] Received data:', data);
  console.log('[FooterComponent Render] socialIcons map:', socialIcons);
  console.log('[FooterComponent Render] Lucide Twitter Icon (at render time):', typeof Twitter, Twitter);
  if (typeof Twitter === 'undefined') {
    console.error("CRITICAL: Twitter icon from lucide-react is UNDEFINED at render time!");
  }
  */

  if (!data) {
    return (
      <footer className="bg-slate-900 text-slate-400 py-12 text-center">
        <p>&copy; {new Date().getFullYear()} MyApp. Footer content loading...</p>
      </footer>
    );
  }

  const footerLinks: FooterLink[] = (data.links as FooterLink[] | null) || [];
  const socialLinksRaw: SocialLink[] = (data.socialMedia as SocialLink[] | null) || [];

  /*
  if (socialLinksRaw.length > 0) {
    console.log('[FooterComponent Render] Raw socialLinks from data:', JSON.stringify(socialLinksRaw));
  } else {
    console.log('[FooterComponent Render] No social links found in data.');
  }
  */

  return (
    <footer className="bg-slate-900 text-slate-400 border-t border-slate-700/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          {/* Column 1: About/Logo */}
          <div className="md:col-span-2 lg:col-span-1">
            <Link href="/" className="inline-block mb-4">
              <h3 className="text-2xl font-bold text-sky-400 hover:text-sky-300 transition-colors">
                MyAppLogo
              </h3>
            </Link>
            <p className="text-sm leading-relaxed">
              Innovating the future, one line of code at a time. Our mission is to build amazing digital experiences that empower users and businesses.
            </p>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Quick Links</h4>
            {footerLinks.length > 0 ? (
              <ul className="space-y-2.5">
                {footerLinks.map((link, index) => (
                  <li key={index}>
                    <Link href={link.href} className="text-sm hover:text-sky-400 transition-colors duration-200 ease-in-out group flex items-center">
                      <span className="group-hover:translate-x-1 transition-transform duration-200 ease-in-out mr-1.5">&rarr;</span> {link.text}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm">No links available.</p>
            )}
          </div>

          {/* Column 3: Resources */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Resources</h4>
            <ul className="space-y-2.5">
              <li><Link href="/blog" className="text-sm hover:text-sky-400 transition-colors duration-200 ease-in-out group flex items-center"><span className="group-hover:translate-x-1 transition-transform duration-200 ease-in-out mr-1.5">&rarr;</span> Blog</Link></li>
              <li><Link href="/faq" className="text-sm hover:text-sky-400 transition-colors duration-200 ease-in-out group flex items-center"><span className="group-hover:translate-x-1 transition-transform duration-200 ease-in-out mr-1.5">&rarr;</span> FAQ</Link></li>
              <li><Link href="/support" className="text-sm hover:text-sky-400 transition-colors duration-200 ease-in-out group flex items-center"><span className="group-hover:translate-x-1 transition-transform duration-200 ease-in-out mr-1.5">&rarr;</span> Support Center</Link></li>
            </ul>
          </div>

          {/* Column 4: Social Media & Contact */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Connect With Us</h4>
            {socialLinksRaw.length > 0 ? (
              <div className="flex space-x-4 mb-5">
                {socialLinksRaw.map((social, index) => {
                  if (!social || typeof social.platform !== 'string') {
                    // console.warn(`[FooterComponent Render] Invalid social item at index ${index}:`, social);
                    return null; // Skip invalid item
                  }
                  const platformKey = social.platform.trim().toLowerCase();
                  const IconComponent = socialIcons[platformKey];
                  const displayName = displayPlatformNames[platformKey] || social.platform; // Use mapped name or original

                  /*
                  console.log(`[FooterComponent Render] Processing social: Original Platform='${social.platform}', Processed Key='${platformKey}', Display Name='${displayName}', IconComponent found:`, typeof IconComponent, IconComponent);
                  */

                  return IconComponent ? (
                    <a
                      key={`${platformKey}-${index}`}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={displayName} // Use displayName for aria-label
                      className="hover:text-sky-400 transition-colors duration-200 ease-in-out transform hover:scale-110"
                    >
                      <IconComponent size={22} />
                    </a>
                  ) : (
                    // Use the displayName in the fallback message
                    <span key={`${platformKey}-${index}`} className="text-xs text-slate-500">(Unsupported: {displayName})</span>
                  );
                })}
              </div>
            ) : (
                 <p className="text-sm">No social media links yet.</p>
            )}
            <p className="text-sm mb-1">contact@myapplogo.com</p>
            <p className="text-sm">+1 (555) 123-4567</p>
          </div>
        </div>

        <div className="border-t border-slate-700 pt-8 text-center md:flex md:justify-between md:items-center">
          <p className="text-sm mb-3 md:mb-0">
            {data.copyrightText || `© ${new Date().getFullYear()} MyAppLogo. All rights reserved.`}
          </p>
          <p className="text-xs text-slate-500">
            Powered by Next.js & Your Awesome CMS
          </p>
        </div>
      </div>
    </footer>
  );
}
