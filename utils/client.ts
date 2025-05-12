export async function getAuthHeader() {
    const { token } = await browser.storage.local.get("token");
    return { "Authorization": `Bearer ${token}` };
}