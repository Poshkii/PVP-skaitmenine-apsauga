export interface DeletionDetails {
    url: string;
    notes: string;
    email?: string;
}

export class DeletionProvider {
    private domainToUrlMap: Map<string, DeletionDetails>;

    constructor() {
        this.domainToUrlMap = new Map<string, DeletionDetails>();
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
                        this.domainToUrlMap.set(domain, {
                            url: site.url,
                            notes: site.notes,
                            email: site.email,
                        });
                    }
                }
            }
        } catch (error) {
            console.error("Error loading sites data:", error);
        }
    }

    public getDeletionDetails(domain: string): DeletionDetails | undefined {
        return this.domainToUrlMap.get(domain);
    }
}