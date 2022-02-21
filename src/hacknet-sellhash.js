/** @param {import(".").NS } ns */
export async function main(ns) {
    var upgradeName = ns.args[0];

    if (ns.hacknet.numHashes() > ns.hacknet.hashCost(upgradeName)) {
        var hashUpgradeCt = Math.floor((ns.hacknet.numHashes() / ns.hacknet.hashCost(upgradeName)));
    }
    await ns.sleep(100);
    for(let i = 0; i < hashUpgradeCt; i++) {
        ns.print('Buying Hashnet Upgrade: ' + upgradeName);
        ns.hacknet.spendHashes(upgradeName);
        await ns.sleep(100);
    }
}