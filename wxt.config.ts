import { defineConfig } from "wxt";

export default defineConfig({
  extensionApi: "chrome",
  modules: [
    "@wxt-dev/module-react",
    '@wxt-dev/auto-icons'
  ],
  manifest: {
    name: "FalconFort",
    description: "Privacy extension",
    permissions: ["storage", "downloads", "downloads.open", "downloads.shelf", "notifications", "cookies", "tabs", "activeTab"],
    host_permissions: ["<all_urls>", "*://mail.google.com/*", "*://outlook.office.com/*"],
    content_scripts: [{"matches": ["*://mail.google.com/*", "*://outlook.office.com/*"],"js": ["content-script.js"]}
  ],
  }
});
