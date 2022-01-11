/** @param {import(".").NS } ns */
export async function main(ns) {
	//Automatic scanner & root/nuke script
	var checkDataFile = "auto_serverscan_data.txt";
	var targets = [];
	ns.rm(checkDataFile);
	await ns.write(checkDataFile, "n00dles", "w");

	//Scanner for all servers
	async function AutoScanner() {
		var hosts = ["home"];
		var seen = ["darkweb"].concat(ns.getPurchasedServers());
		var player_servers = ns.getPurchasedServers();
		while (hosts.length > 0) {
			var h = hosts.shift();
			//Checks if host was seen this scan
			if (seen.indexOf(h) != -1) continue;
			seen.push(h);

			hosts = hosts.concat(ns.scan(h));
			//Checks for root access
			if (h != "home" && targets.indexOf(h) == -1) {
				//ns.tprint("Checking for root on " + h);
				if (ns.hasRootAccess(h) == false) {
					//Run hack script attempting to root
					//ns.tprint("NO ROOT! Executing auto-root.js")
					ns.exec("auto-root.js", "home", 1, h)
				} else if (h != "home" && ns.hasRootAccess(h) == true) {
					targets.push(h);
					//ns.tprint("Adding " + h + " to targets. Total count: " + targets.length);
					ns.exec("auto-root.js", "home", 1, h)
					await ns.write(checkDataFile, targets.join("\n"), "w");

				}
			}
			else {
				//ns.tprint(h + " is already in targets list")
			}
			
			await ns.sleep(250);
		}

	}
	
	async function AutoHack() {
		var targets = ns.read(checkDataFile).split("\n");
		var targets_array = targets.length - 1;
		for (var i = targets_array; i >= 0; i--) {
			var srv_moneyavailable = ns.getServerMoneyAvailable(targets[i]);
            var srv_moneymax = ns.getServerMaxMoney(targets[i]);
            var srv_moneypct = (srv_moneyavailable / srv_moneymax * 100);
			//ns.tprint(targets[i] + "; Money (Bn): " + srv_moneyavailable + "; Max Money (Bn): " + srv_moneymax + "; % Available: " + srv_moneypct);
			var numThreads = Math.floor((ns.getServerMaxRam("home") - ns.getServerUsedRam("home")) / ns.getScriptRam("auto-hack.js"));
			ns.print(targets[i] + "; Money %: " + srv_moneypct + "; Threads: " + numThreads);
			//Checks player hacking level
			var player_hacking_lvl = ns.getHackingLevel();
			var server_hacking_lvl = ns.getServerRequiredHackingLevel(targets[i]);

			if (srv_moneypct > 50 && numThreads > 3 && player_hacking_lvl > server_hacking_lvl) {
				//Sets max of 100 threads
				if (numThreads > 100) {
					numThreads = 100;
				} else if (ns.getServerMaxRam("home") < 512 && numThreads > 25) {
					//If home RAM is under 512, use a max thread of 25 for early game progression
					numThreads = 25;
				}
				ns.exec("auto-hack.js", "home", numThreads, targets[i]);
			}
			else {
				ns.print("Not enough RAM OR not enough money... skipping " + targets[i])
			}
			await ns.sleep(250);		
		}

	}

	while (true) {
		
		await AutoScanner();
		await ns.sleep(1000);
		ns.exec("auto-target.js", "home", 1, checkDataFile)
		await AutoHack();
		await ns.sleep(60000);

	}

}