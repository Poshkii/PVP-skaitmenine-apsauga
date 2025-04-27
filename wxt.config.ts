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
    permissions: ["storage", "downloads", "downloads.open", "downloads.shelf", "notifications", "cookies", "tabs", "activeTab", "declarativeNetRequest", "declarativeNetRequestFeedback", "webNavigation", "alarms"],
    declarative_net_request: {
      rule_resources: [
        {
          "id": "easylist_rules",
          "enabled": true,
          "path": "rulesets/easylist.json"
        },
        {
          "id": "easyprivacy_rules",
          "enabled": true,
          "path": "rulesets/easyprivacy.json"
        }
      ]
    },
    host_permissions: ["<all_urls>", "http://*/*", "https://*/*"],
  }
});
