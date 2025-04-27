export interface CategorizedRules {
  analytics: chrome.declarativeNetRequest.Rule[];
  advertising: chrome.declarativeNetRequest.Rule[];
  social: chrome.declarativeNetRequest.Rule[];
  other: chrome.declarativeNetRequest.Rule[];
}

// Define a type for enabled categories
export interface EnabledCategories {
  analytics?: boolean;
  advertising?: boolean;
  social?: boolean;
  other?: boolean;
}

// Fetch EasyList content as text
export async function fetchEasyList(listUrl: string): Promise<string | null> {
  try {
    const response = await fetch(listUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch list: ${response.status}`);
    }
    return await response.text();
  } catch (error: any) {
    console.error(`Error fetching EasyList: ${error.message}`);
    return null;
  }
}

// Parse EasyList content into DNR rules
export function parseEasyList(easyListContent: string): chrome.declarativeNetRequest.Rule[] {
  const rules: chrome.declarativeNetRequest.Rule[] = [];
  let ruleId = 1;

  const lines = easyListContent.split('\n');

  for (const line of lines) {
    if (line.trim() === '' || line.startsWith('!') || line.startsWith('##')) {
      continue;
    }

    try {
      if (line.startsWith('||') && line.includes('^')) {
        const domainPart = line.slice(2, line.indexOf('^'));
        if (domainPart.includes('*') || domainPart.includes('/')) {
          continue;
        }

        rules.push({
          id: ruleId++,
          priority: 1,
          action: { type: chrome.declarativeNetRequest.RuleActionType.BLOCK },
          condition: {
            urlFilter: `||${domainPart}^`,
            resourceTypes: [
              chrome.declarativeNetRequest.ResourceType.SCRIPT,
              chrome.declarativeNetRequest.ResourceType.XMLHTTPREQUEST,
              chrome.declarativeNetRequest.ResourceType.IMAGE,
              chrome.declarativeNetRequest.ResourceType.SUB_FRAME,
              chrome.declarativeNetRequest.ResourceType.MAIN_FRAME
            ],
          },
        });
      } else if (!line.startsWith('@@') && !line.includes('##') && !line.includes('#@#')) {
        let urlFilter = line;
        if (line.includes('$')) {
          urlFilter = line.substring(0, line.indexOf('$'));
        }

        if (urlFilter && urlFilter.length > 1 && urlFilter.length < 100) {
          rules.push({
            id: ruleId++,
            priority: 1,
            action: { type: chrome.declarativeNetRequest.RuleActionType.BLOCK },
            condition: {
              urlFilter,
              resourceTypes: [
                chrome.declarativeNetRequest.ResourceType.SCRIPT,
                chrome.declarativeNetRequest.ResourceType.XMLHTTPREQUEST,
                chrome.declarativeNetRequest.ResourceType.IMAGE,
                chrome.declarativeNetRequest.ResourceType.SUB_FRAME
              ],
            },
          });
        }
      }

      if (rules.length >= 30000) {
        break;
      }
    } catch (error) {
      console.error(`Error parsing rule: ${line}`, error);
    }
  }

  return rules;
}

// Categorize DNR rules by keywords
export function categorizeRules(rules: chrome.declarativeNetRequest.Rule[]): CategorizedRules {
  const categories: CategorizedRules = {
    analytics: [],
    advertising: [],
    social: [],
    other: []
  };

  const analyticsKeywords = ['analytics', 'stats', 'pixel', 'track', 'metric', 'piwik', 'matomo', 'ga.js'];
  const advertisingKeywords = ['ad', 'ads', 'banner', 'sponsor', 'popup', 'doubleclick', 'adsense'];
  const socialKeywords = ['facebook', 'twitter', 'linkedin', 'social', 'share', 'instagram', 'pinterest'];

  rules.forEach(rule => {
    const urlFilter = rule.condition?.urlFilter?.toLowerCase() || '';

    if (analyticsKeywords.some(keyword => urlFilter.includes(keyword))) {
      categories.analytics.push(rule);
    } else if (advertisingKeywords.some(keyword => urlFilter.includes(keyword))) {
      categories.advertising.push(rule);
    } else if (socialKeywords.some(keyword => urlFilter.includes(keyword))) {
      categories.social.push(rule);
    } else {
      categories.other.push(rule);
    }
  });

  return categories;
}

// Create rulesets for enabled categories
export function createRulesets(
  categories: CategorizedRules,
  enabled: EnabledCategories
): Partial<CategorizedRules> {
  const rulesets: Partial<CategorizedRules> = {};

  (Object.keys(categories) as (keyof CategorizedRules)[]).forEach(category => {
    if (enabled[category]) {
      rulesets[category] = categories[category];
    }
  });

  return rulesets;
}