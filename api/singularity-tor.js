/** @param {import(".").NS } ns */
export async function main(ns) {
    await ns.sleep(100);
    ns.purchaseTor();
    await ns.sleep(100);
}