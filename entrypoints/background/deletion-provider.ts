export class DeletionProvider {
    private domainToUrlMap: Map<string, string>;

    constructor() {
        this.domainToUrlMap = new Map<string, string>();
        this.loadSitesData();
    }

    private async loadSitesData(): Promise<void> {
        try {
            const response = await fetch(browser.runtime.getURL('/jdm/sites.json'));

            if (!response.ok) {
                throw new Error(`Failed to load sites data: ${response.statusText}`);
            }

            const sitesData = await response.json();

            for (const site of sitesData) {
                if (site.domains && Array.isArray(site.domains)) {
                    for (const domain of site.domains) {
                        this.domainToUrlMap.set(domain, site.url);
                    }
                }
            }
        } catch (error) {
            console.error("Error loading sites data:", error);
        }
    }

    public getDeletionUrl(domain: string): string | undefined {
        return this.domainToUrlMap.get(domain);
    }
}