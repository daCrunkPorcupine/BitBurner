/** @param {import(".").NS } ns */
export async function main(ns) {
	let i = 1;
	
	
	ns.tprint("NodeCount is " + ns.hacknet.numNodes());
	while (i <= 24) {
		ns.tprint("Counter is " + i);

		i++;
	}
	

	/**
	for (var i = 0; i < await ns.hacknet.numNodes(); i++) {

		ns.tprint("LevelUpgradeCost" + ns.hacknet.getLevelUpgradeCost(i, 1));
		ns.tprint("RamUpgradeCost" + ns.hacknet.getRamUpgradeCost(i, 1));
		ns.tprint("CoreUpgradeCost" + ns.hacknet.getCoreUpgradeCost(i, 1));
		//ns.tprint(ns.hacknet.getNodeStats(i));
				
		ns.tprint(ns.hacknet.getNodeStats(i).name);
		ns.tprint(ns.hacknet.getNodeStats(i).level);
		ns.tprint(ns.hacknet.getNodeStats(i).ram);
		ns.tprint(ns.hacknet.getNodeStats(i).cores);

		await ns.sleep(5000);
	}
	**/

    /**
	ns.tprint(ns.isRunning("weaken.js","home"));
	while(ns.isRunning("weaken.js") == true)
	{
		ns.tprint("Script is still running, sleep...")
		await ns.sleep(1000);
	}	
	**/

}