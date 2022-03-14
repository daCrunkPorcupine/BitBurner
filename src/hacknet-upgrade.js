/** @param {import(".").NS } ns */
// Hacknet automated upgrade script
// Running will automatically purchase hacknet nodes & upgrade
var killScript;
export async function main(ns) {
	const costMax = ns.args[0];
	ns.disableLog('ALL');
	while (true) {
		killScript = 0;
		await ns.sleep(100);
		for (var i = 0; i < ns.hacknet.numNodes(); i++) {
			if (ns.getPlayer().money > ns.hacknet.getLevelUpgradeCost(i, 1) && costMax > ns.hacknet.getLevelUpgradeCost(i, 1)) {
				ns.hacknet.upgradeLevel(i, 1);
			} else if ((i = ns.hacknet.numNodes() - 1) && costMax < ns.hacknet.getLevelUpgradeCost(i, 1)) {
                killScript++;
            }
			await ns.sleep(100);
			if (ns.getPlayer().money > ns.hacknet.getRamUpgradeCost(i, 1) && costMax > ns.hacknet.getRamUpgradeCost(i, 1)) {
				ns.hacknet.upgradeRam(i, 1);
			} else if ((i = ns.hacknet.numNodes() - 1) && costMax < ns.hacknet.getRamUpgradeCost(i, 1)) {
                killScript++;
            }
			await ns.sleep(100);
			if (ns.getPlayer().money > ns.hacknet.getCoreUpgradeCost(i, 1) && costMax > ns.hacknet.getCoreUpgradeCost(i, 1)) {
				ns.hacknet.upgradeCore(i, 1);
			} else if ((i = ns.hacknet.numNodes() - 1) && costMax < ns.hacknet.getCoreUpgradeCost(i, 1)) {
                killScript++;
            }
			await ns.sleep(100);
			if (ns.getPlayer().money > ns.hacknet.getCacheUpgradeCost(i, 1) && costMax > ns.hacknet.getCacheUpgradeCost(i, 1)) {
				ns.hacknet.upgradeCache(i, 1);
			} else if ((i = ns.hacknet.numNodes() - 1) && costMax < ns.hacknet.getCacheUpgradeCost(i, 1)) {
                killScript++;
            }
			await ns.sleep(100);
		}
		if (ns.getPlayer().money > ns.hacknet.getPurchaseNodeCost() && costMax * 2 > ns.hacknet.getPurchaseNodeCost()) {
			ns.hacknet.purchaseNode();
		} else if (costMax * 2 < ns.hacknet.getPurchaseNodeCost()) {
			killScript++;
		}
		await ns.sleep(100);
		if (killScript == 5) break;
		await ns.sleep(1000);
	}
}