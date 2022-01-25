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
				var player_hacking_lvl = ns.getHackingLevel();
				var server_hacking_lvl = ns.getServerRequiredHackingLevel(h);
				//ns.tprint("Checking for root on " + h);
				if (h != "home" && ns.hasRootAccess(h) == false && player_hacking_lvl >= server_hacking_lvl) {
					//Run hack script attempting to root
					//ns.tprint("NO ROOT! Executing auto-root.js")
					ns.exec("auto-root.js", "home", 1, h);
					//targets.push(h);
				}
				await ns.sleep(100);
				if (h != "home" && ns.hasRootAccess(h) == true) {
					//
					targets.push(h);
				}
			}
			else {
				//ns.tprint(h + " is already in targets list")
			}
			
			await ns.sleep(250);
		}
		//Adds targets array to DataFile
		await ns.write(checkDataFile, targets.join("\n"), "w");

	}
	
    async function AutoHack(targets_value) {
		//var targets = ns.read(checkDataFile).split("\n");
		//ns.tprint("targets_value length: " + targets_value.length);
		//ns.tprint(targets_value);
		if (targets.length < 1) {
			//IDEA: Add break / skip
		}
		var targets_array = targets_value.length - 1;
		for (let i = 0; i <= targets_array; i++) {
			let hack_target = targets_value[i]["servername"];
			//ns.tprint("DEBUG: hack_target: " + hack_target);
			var srv_moneyavailable = ns.getServerMoneyAvailable(hack_target);
            var srv_moneymax = ns.getServerMaxMoney(hack_target);
            var srv_moneypct = (srv_moneyavailable / srv_moneymax * 100);
			//ns.tprint(hack_target + "; Money (Bn): " + srv_moneyavailable + "; Max Money (Bn): " + srv_moneymax + "; % Available: " + srv_moneypct);
			var numThreads = Math.floor((ns.getServerMaxRam("home") - ns.getServerUsedRam("home") * 0.9) / ns.getScriptRam("auto-hack.js"));
			ns.print(hack_target + "; Money %: " + srv_moneypct + "; Threads: " + numThreads);
			//Checks player hacking level
			var player_hacking_lvl = ns.getHackingLevel();
			var server_hacking_lvl = ns.getServerRequiredHackingLevel(hack_target);

			if (srv_moneypct > 80 && numThreads > 3 && player_hacking_lvl > server_hacking_lvl) {
				//Sets max threads
				if (numThreads > 250) {
					numThreads = 250;
				} else if (ns.getServerMaxRam("home") < 512 && numThreads > 25) {
					//If home RAM is under 512, use a max thread of 25 for early game progression
					numThreads = 25;
				}
				ns.exec("auto-hack.js", "home", numThreads, hack_target);
			}
			else {
				ns.print("Not enough RAM OR not enough money... skipping " + hack_target)
			}
			await ns.sleep(250);
		}

	}

    //TargetPhatServer() Begin
    //Scans for phat servers for priority
    async function TargetPhatServer() {
        var targets = ns.read(checkDataFile).split("\n");
        var phat_targets = [];

        //Gets array count
        if (targets.length == 1) {
            var targets_array = 1;
        } else {
            var targets_array = targets.length - 1;
        }
        var server_value = 0;
    
        for (var i = targets_array; i >= 0; i--) {
            var player_hacking_lvl = ns.getHackingLevel();
            var server_hacking_lvl = ns.getServerRequiredHackingLevel(targets[i]);
            if (player_hacking_lvl >= server_hacking_lvl) {
                //Calculate a value (maxmoney * hackchance / weakentime)
                server_value = ns.getServerMaxMoney(targets[i]) * ns.hackAnalyzeChance(targets[i]) / ns.getWeakenTime(targets[i]);
                //ns.tprint("servername: " + targets[i] + "; value: " + server_value);
                phat_targets.push({"servername":targets[i],"value":server_value});
            }
            await ns.sleep(100);
        }
        //Sorts decending based on 'value'
        phat_targets.sort(function(a, b){return b.value-a.value});

        await ns.sleep(6000);
        return phat_targets;
        
    }
    //TargetPhatServer() END


	while (true) {
		
		await AutoScanner();
		await ns.sleep(100);
		let targets_value = await TargetPhatServer();
		ns.exec("auto-target.js", "home", 1, checkDataFile)
		await AutoHack(targets_value);
		await ns.sleep(6000);

	}

}