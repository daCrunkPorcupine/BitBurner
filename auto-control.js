/** @param {import(".").NS } ns */
export async function main(ns) {
    //Executes all automation scripts
	var checkDataFile = "auto_serverscan_data.txt";
	var targets = [];
    var targets_value = [];
    var target_servers = [];
	ns.rm(checkDataFile);
	await ns.write(checkDataFile, "n00dles", "w");
    //RAM usage limit for calling individual targets
    var ram_homereserve = 0.7;
    //Debug Flag
    var debug = false;


	//AutoScanner() Begin
	async function AutoScanner() {
        //Scanner for all servers
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
					targets.push(h);
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
        ns.print(targets);
        return targets;

	}
    //AutoScanner() END

    //TargetPhatServer() Begin    
    async function TargetPhatServer(target_servers) {
        //Scans for phat servers for priority
        //var targets = ns.read(checkDataFile).split("\n");
        let targets = target_servers;
        var phat_targets = [];
        if(debug){ns.tprint("DEBUG: TargetPhatServer() var target_servers[0]: " + target_servers[0])}
        if(debug){ns.tprint("DEBUG: TargetPhatServer() var targets[0]: " + targets[0])}
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

    //AutoHack() Begin
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
            //Checks if hack_target is the top index/phat target, uses max threads available for hack to allow re-grow
            if (hack_target==targets_value[0]["servername"] && srv_moneypct > 70) {
                var numThreads = Math.floor(((ns.getServerMaxRam("home") - ns.getServerUsedRam("home")) * ram_homereserve) / ns.getScriptRam("auto-hack.js"));
                ns.exec("auto-hack.js", "home", numThreads, hack_target);                
                if(debug){ns.tprint("DEBUG: AutoHack() PHAT TARGET MAX THREADS auto-hack.js on: " + hack_target + " " + numThreads + " threads")}
            } else if (srv_moneypct > 70 && numThreads > 3 && player_hacking_lvl > server_hacking_lvl) {
				//Sets max threads
				if (numThreads > 250) {
					numThreads = 250;
				} else if (ns.getServerMaxRam("home") < 512 && numThreads > 25) {
					//If home RAM is under 512, use a max thread of 25 for early game progression
					numThreads = 25;
				}
                if(debug){ns.tprint("DEBUG: AutoHack() auto-hack.js on: " + hack_target)}
				ns.exec("auto-hack.js", "home", numThreads, hack_target);
			}
			else {
				ns.print("Not enough RAM OR not enough money... skipping " + hack_target)
			}
			await ns.sleep(250);
		}

	}
    //AutoHack() END

    //Pushes attacks from home if free RAM
    async function homeTarget(targets_value) {
        let bestserver = targets_value[0]["servername"];
        var moneyCheck = ns.getServerMaxMoney(bestserver) * 0.8;
        //Checks target Minimum Security level + value
        var securityCheck = ns.getServerMinSecurityLevel(bestserver) + 10;
        if (ns.getServerSecurityLevel(bestserver) > securityCheck || ns.getServerMoneyAvailable(bestserver) < moneyCheck) {
            ns.exec("auto-phattarget.js", "home", 1,bestserver);
        }
    }
    //botnetTarget() Begin
    //Pushes attacks from BOTNET lists
    async function botnetTarget(targets_value) {
        let bestserver = targets_value[0]["servername"];
        var targets = ns.read(checkDataFile).split("\n");
        var botnet_list = [];
        var debug_botnet_server_prepped = 0;
        if(debug){ns.tprint("DEBUG: botnetTarget() botnet best target " + bestserver)}
        //Gets array count
        if (targets.length == 1) {
            var targets_array = 1;
        } else {
            var targets_array = targets.length - 1;
        }
        var server_value = 0;

        
        var moneyCheck = ns.getServerMaxMoney(bestserver) * 0.8;
        //Checks target Minimum Security level + value
        var securityCheck = ns.getServerMinSecurityLevel(bestserver) + 10;
        for (var i = targets_array; i >= 0; i--) {
            var player_hacking_lvl = ns.getHackingLevel();
            var server_hacking_lvl = ns.getServerRequiredHackingLevel(targets[i]);
            //Adds to botnet_list if target RAM > 32gb
            if (player_hacking_lvl >= server_hacking_lvl && ns.getServerMaxRam(targets[i]) >= 32) {
                botnet_list.push(targets[i]);
                await ns.sleep(100);
            }
        }
        //IDEA: Add logic to retrieve total thread count for weaken() and queue up commands to minimums
        //IDEA: Add logic to run commands on multiple targets based on value (srv 1 first, srv 2 ec)
        //Executes botnet attacks
        if (botnet_list.length >= 1) {
            for (var ia = botnet_list.length - 1; ia >= 0; ia--) {
                //Checks if values are still necessary - doesn't push attack if server is already prepped
                if (ns.getServerSecurityLevel(bestserver) > securityCheck || ns.getServerMoneyAvailable(bestserver) < moneyCheck) {
                    if (ns.isRunning("auto-phattarget.js", botnet_list[ia], bestserver) == false) {
                        if(debug){ns.tprint("DEBUG: EXECUTING BOTNET ATTACK: " + botnet_list[ia] + "; WITH RAM: " + ns.getServerMaxRam(botnet_list[ia]))}
                        await ns.scp("auto-phattarget.js", "home", botnet_list[ia]);
                        await ns.scp("auto-weaken.js", "home", botnet_list[ia]);
                        await ns.scp("auto-grow.js", "home", botnet_list[ia]);
                        ns.killall(botnet_list[ia]);
                        ns.exec("auto-phattarget.js", botnet_list[ia], 1, bestserver);
                    } else {
                        if(debug){ns.tprint("DEBUG: BOTNET ATTACK ALREADY RUNNING! " + botnet_list[ia] + " to " + bestserver)}
                    }

                } else {
                    if(debug){debug_botnet_server_prepped = 1}
                }
                if(debug_botnet_server_prepped==1){ns.tprint("DEBUG: botnetTarget() skipping target (already weak/grow) " + bestserver)}
                await ns.sleep(100);
            }
        }
    }
    //botnetTarget() END
    
    //Reads target list backwards
    async function AutoTarget(target_servers) {
        var player_servers = ns.getPurchasedServers();
        //var targets = ns.read(checkDataFile).split("\n");
        let targets = target_servers;
        //Gets array count
        if(debug){ns.tprint("DEBUG: AutoTarget() target count " + targets.length)}
        if (targets.length == 1) {
            var targets_array = 1;
        } else {
            var targets_array = targets.length - 1;
        }
        
        var numThreads = 1;
        //ns.print("Player Servers: " + player_servers);
        if(debug){ns.tprint("DEBUG: AutoTarget() starting target scans")}
        for (var i = targets_array; i >= 0; i--) {
            var chk_loop = 1;
            //ns.print(targets[i]);
            
            //Checks servername Minimum Security level + value
            var securityCheck = ns.getServerMinSecurityLevel(targets[i]) + 10;
            //Checks servername MaxMoney * value
            var moneyCheck = ns.getServerMaxMoney(targets[i]) * 0.8;
            //Checks player hacking level
            var player_hacking_lvl = ns.getHackingLevel();
            var server_hacking_lvl = ns.getServerRequiredHackingLevel(targets[i]);


            // if security > minimum + 10 then weaken (pushed to player servers if exist)
            if (ns.getServerSecurityLevel(targets[i]) > securityCheck && player_hacking_lvl >= server_hacking_lvl) {
                //If security level is higher than 'securityCheck' threshold, weaken
                if (player_servers.length != 0) {
                    //ns.print("Player Server Count: " + player_servers.length)
                    var ia = 0;
                    // && ia != player_servers.length
                    while (chk_loop == 1) {
                        //ns.print("Checking Available RAM on " + player_servers[ia]);
                        var ps_MaxRam = ns.getServerMaxRam(player_servers[ia]);
                        var ps_UsedRam = ns.getServerUsedRam(player_servers[ia]);
                        var ps_ScriptRam = ns.getScriptRam("auto-weaken.js");

                        numThreads = Math.floor((ps_MaxRam - ps_UsedRam) / ps_ScriptRam);
                        //ns.print("Possible Threads: " + numThreads);
                        if (numThreads >= 1) {
                            //Checks for maximum threads required. Security lowered 0.05 per 1 thread
                            var req_security_threads = Math.floor((ns.getServerSecurityLevel(targets[i]) - (ns.getServerMinSecurityLevel(targets[i]) + 10)) / 0.05);
                            req_security_threads++;
                            if (numThreads > req_security_threads && req_security_threads >= 1) {
                                numThreads = req_security_threads
                            }
                            //ns.tprint("Executing weaken on " + targets[i] + " with threads: " + numThreads);
                            //ns.tprint("Math: " + req_security_threads);
                            ns.exec("auto-weaken.js", player_servers[ia], numThreads, targets[i]);
                            if(debug){ns.tprint("DEBUG: AutoTarget() starting WEAKEN: " + player_servers[ia] + "," + targets[i] + " threads " + numThreads)}
                            chk_loop = 0;
                        }
                        ia++;
                        if (ia == player_servers.length) {
                            //Break loop once all servers reached
                            chk_loop = 0;
                            //ns.print("No available servers, wait...");
                            if (ns.getServerUsedRam("home") < (ns.getServerMaxRam("home") * ram_homereserve)) { chk_loop = 0 }
                            await ns.sleep(100);
                            var player_servers = ns.getPurchasedServers();
                            ia = 0;
                        }
                        await ns.sleep(100);
                    }
                    await ns.sleep(100);
                }
            }
            else if (ns.getServerMoneyAvailable(targets[i]) < moneyCheck && player_hacking_lvl >= server_hacking_lvl) {
                if (player_servers.length != 0) {
                    //ns.print("Player Server Count: " + player_servers.length)
                    var ia = 0;
                    // && ia != player_servers.length
                    var set_break = 0
                    while (chk_loop == 1) {
                        //ns.print("Checking Available RAM on " + player_servers[ia]);
                        var ps_MaxRam = ns.getServerMaxRam(player_servers[ia]);
                        var ps_UsedRam = ns.getServerUsedRam(player_servers[ia]);
                        var ps_ScriptRam = ns.getScriptRam("auto-grow.js");

                        numThreads = Math.floor((ps_MaxRam - ps_UsedRam) / ps_ScriptRam);
                        //ns.print("Possible Threads: " + numThreads);
                        if (numThreads >= 1 && ps_UsedRam < (ps_MaxRam * 0.8)) {
                            ns.exec("auto-grow.js", player_servers[ia], numThreads, targets[i]);
                            if(debug){ns.tprint("DEBUG: AutoTarget() starting GROW: " + player_servers[ia] + "," + targets[i] + " threads " + numThreads)}
                            chk_loop = 0;
                        }
                        ia++;
                        if (ia == player_servers.length) {
                            //Break loop once all servers reached
                            chk_loop = 0;
                            //ns.print("No available servers, wait...");
                            if (ns.getServerUsedRam("home") < (ns.getServerMaxRam("home") * ram_homereserve)) { chk_loop = 0 }
                            await ns.sleep(100);
                            var player_servers = ns.getPurchasedServers();
                            ia = 0;
                        }
                        await ns.sleep(100);
                    }

                    await ns.sleep(100);
                }
            }

        }

    }

    async function PlayerServerCopies() {
        if(debug){ns.tprint("DEBUG: PlayerServerCopies() execute")}
        var player_servers = ns.getPurchasedServers();
        for (var i_ps = 0; i_ps < player_servers.length; i_ps++) {
            //ns.print("Copying scripts to " + player_servers[i_ps]);
            await ns.scp("auto-weaken.js", "home", player_servers[i_ps]);
            await ns.scp("auto-grow.js", "home", player_servers[i_ps]);
            await ns.scp("auto-hack.js", "home", player_servers[i_ps]);
            await ns.sleep(100);
        }
    }
    
    let scanner_task = 0;
    //While loop tiggers all processes
    while (true) {
        
        /**
        //Can use scanner_task to avoid full scan each loop
        if (scanner_task==0) {
            if(debug){ns.tprint("DEBUG: scanner_task==0, run AutoScanner()")}
            target_servers = await AutoScanner();
            if(debug){ns.tprint("DEBUG: AutoScanner() target_servers: " + target_servers)}
        } else {
            if(debug){ns.tprint("DEBUG: scanner_task==" + scanner_task)}
        }
        **/
        if(debug){ns.tprint("DEBUG: scanner_task==0, run AutoScanner()")}
        target_servers = await AutoScanner();
        if(debug){ns.tprint("DEBUG: AutoScanner() target_servers: " + target_servers)}
        if(debug){ns.tprint("DEBUG: starting TargetPhatServer()")}
		targets_value = await TargetPhatServer(target_servers);
        if(debug){ns.tprint("DEBUG: targets_value index[0][servername] " + targets_value[0]["servername"])}
        await ns.sleep(100);
        if (ns.getPurchasedServers() >= 1) {
            if(debug){ns.tprint("DEBUG: starting PlayerServerCopies()")}
            await PlayerServerCopies();
        }
        if(debug){ns.tprint("DEBUG: starting AutoHack()")}
        await AutoHack(targets_value);
        //Will not execute if too much RAM is in use (due to other processes)
        if (ns.getServerUsedRam("home") < (ns.getServerMaxRam("home") * ram_homereserve)) {
            if(debug){ns.tprint("DEBUG: starting homeTarget()")}
            homeTarget(targets_value);
        }
        await ns.sleep(150);
        if(debug){ns.tprint("DEBUG: starting botnetTarget()")}
        await botnetTarget(targets_value);
        await ns.sleep(150);
        if (ns.getPurchasedServers().length > 0) {
            if(debug){ns.tprint("DEBUG: starting AutoTarget()")}
            await AutoTarget(target_servers);
        }
        await ns.sleep(150);
        scanner_task++;
        if (scanner_task==5) {
            let scanner_task = 0;
        }
	}
}