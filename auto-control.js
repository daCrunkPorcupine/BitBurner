/** @param {import(".").NS } ns */
//CONSTANTS
//These values trigger specific modules
const useGang = true;
const useHacknet = true;
const useBladerunner = false;
const useHacking = true;
const useServerBuy = true;
const useSleeve = true;
const focusRepGain = true;
//Hacking variables
const weakenThreadPower = 0.05;
const growthThreadIncrease = 0.004;
const hackThreadIncrease = 0.002;
//Hacknet variables
const hacknetCostMax = 35000000;

var all_exes = false;
var port;
//IDEA: Query player for BN
const inBN2 = false;
var karma_level;
const use_share = false;
const fileDir = 'src/txt/'
const checkDataFile = "auto_serverscan_data.txt";
//Debug Flag
const debug = false;

//Player Servers
const servername_prefix = 'jus';
//IDEA: Pull max from ns.getBitNodeMultipliers()
var player_server_max;

export async function main(ns) {
    //Executes all automation scripts
    var targets = [];
    var targets_value = [];
    var target_servers = [];
    var botnet_list = [];
    player_server_max = ns.getPurchasedServerLimit();
	ns.rm(checkDataFile);
	await ns.write(checkDataFile, "n00dles", "w");
    //RAM usage limit % for calling individual targets
    var ram_homereserve = 0.6;
    //scanner_task used to delay AutoScanner()
    var scanner_task = 0;

	//AutoScanner() Begin
	async function AutoScanner() {
        //Scanner for all servers
		var hosts = ["home"];
		var seen = ["darkweb"].concat(ns.getPurchasedServers());
        for(let i = 0; i < 25; i++) {
            let hacknetName = 'hacknet-node-' + i;
            seen.push(hacknetName);
            await ns.sleep(100)
        }
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
					if(debug){ns.tprint("DEBUG: AutoScanner() auto-root.js: " + h)}
                    //ns.tprint("NO ROOT! Executing auto-root.js")
					ns.exec("auto-root.js", "home", 1, h);
				}
				await ns.sleep(100);
				if (h != "home" && ns.hasRootAccess(h) == true) {
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

        await ns.sleep(100);
        return phat_targets;
        
    }
    //TargetPhatServer() END

    //AutoHack() Begin
    async function AutoHack(targets_value) {
		//var targets = ns.read(checkDataFile).split("\n");
		//ns.tprint("targets_value length: " + targets_value.length);
		//ns.tprint(targets_value);
		if(use_share) {
            ns.kill('src/auto-share.js','home');
        }
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
                var numThreads = Math.floor((ns.getServerMaxRam("home") - ns.getServerUsedRam("home")) * ram_homereserve / ns.getScriptRam("auto-hack.js"));
                if (numThreads > 0) {
                    ns.exec("auto-hack.js", "home", numThreads, hack_target);
                    if(debug){ns.tprint("DEBUG: AutoHack() PHAT TARGET MAX THREADS auto-hack.js on: " + hack_target + " " + numThreads + " threads")}
                }
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
			} else if (botnet_list.length >= 1 && srv_moneypct > 70 && ns.getServerMaxRam("home") < 1024) {
                //Checks for available RAM on botnet list, pushes hacks to available servers
                for (var ia = botnet_list.length - 1; ia >= 0; ia--) {
                    await ns.scp("auto-hack.js", "home", botnet_list[ia]);
                    let numThreads = Math.floor((ns.getServerMaxRam(botnet_list[ia]) - ns.getServerUsedRam(botnet_list[ia])) / ns.getScriptRam("auto-hack.js"));
                    if (numThreads > 0) {
                        ns.exec("auto-hack.js", botnet_list[ia], numThreads, hack_target);
                    }
                }
            } else {
                ns.print("Not enough RAM OR not enough money... skipping " + hack_target)
            }

			await ns.sleep(250);
		}
        //Use free RAM for ns.share() if enabled

        if (use_share) {
            var numThreads = Math.floor(((ns.getServerMaxRam("home") - ns.getServerUsedRam("home")) * ram_homereserve) / ns.getScriptRam("src/auto-share.js"));
            if (numThreads >= 1) {
                ns.exec('src/auto-share.js','home',numThreads);
            }
        }

	}
    //AutoHack() END

    //homeTarget() Begin
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
    //homeTarget() END

    //botnetTarget() Begin
    //Pushes attacks from BOTNET lists
    async function botnetTarget(targets_value) {
        let bestserver = targets_value[0]["servername"];
        var targets = ns.read(checkDataFile).split("\n");
        var debug_botnet_server_prepped = 0;
        var botnet_list = [];
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
            //Adds to botnet_list if target RAM > 8gb
            if (player_hacking_lvl >= server_hacking_lvl && ns.getServerMaxRam(targets[i]) >= 8) {
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
    
    //AutoTarget() Begin
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
                    //IDEA: add servers with full RAM to array, to start the thread scan where it left off instead of returning to 0
                    var ia = 0;
                    var loop_thread_ct = 0;
                    // && ia != player_servers.length
                    //Checks for maximum threads required. Security lowered 0.05 per 1 thread
                    if(debug){ns.tprint("DEBUG: AutoTarget() checking security on " + targets[i])}
                    var req_security_threads = (Math.floor((ns.getServerSecurityLevel(targets[i]) - (ns.getServerMinSecurityLevel(targets[i]) + 10)) / weakenThreadPower))+1;
                    while (chk_loop == 1) {
                        //ns.print("Checking Available RAM on " + player_servers[ia]);
                        //RAM Check settings
                        var ps_MaxRam = ns.getServerMaxRam(player_servers[ia]);
                        var ps_UsedRam = ns.getServerUsedRam(player_servers[ia]);
                        var ps_ScriptRam = ns.getScriptRam("auto-weaken.js");
                        //Checks available number of threads on remote server
                        numThreads = Math.floor((ps_MaxRam - ps_UsedRam) / ps_ScriptRam);
                        if (numThreads != 0) {
                            if (numThreads >= req_security_threads) {
                                numThreads = req_security_threads;
                                ns.exec("auto-weaken.js", player_servers[ia], numThreads, targets[i]);
                                if(debug){ns.tprint("DEBUG: AutoTarget() starting WEAKEN: " + player_servers[ia] + "," + targets[i] + " threads " + numThreads)}
                                chk_loop = 0;
                            } else if (loop_thread_ct==0 && numThreads < req_security_threads) {
                                loop_thread_ct = req_security_threads - numThreads;
                                ns.exec("auto-weaken.js", player_servers[ia], numThreads, targets[i]);
                                if(debug){ns.tprint("DEBUG: AutoTarget() starting WEAKEN: " + player_servers[ia] + "," + targets[i] + " threads " + numThreads)}
                            } else if (loop_thread_ct > 0 && loop_thread_ct < numThreads) {
                                numThreads = loop_thread_ct;
                                ns.exec("auto-weaken.js", player_servers[ia], numThreads, targets[i]);
                                if(debug){ns.tprint("DEBUG: AutoTarget() starting WEAKEN: " + player_servers[ia] + "," + targets[i] + " threads " + numThreads)}
                                chk_loop = 0;
                            } else if (loop_thread_ct > 0 && loop_thread_ct >= numThreads) {
                                loop_thread_ct = loop_thread_ct - numThreads;
                                if(debug){ns.tprint("DEBUG: AutoTarget() starting WEAKEN: " + player_servers[ia] + "," + targets[i] + " threads " + numThreads)}
                            }
                        } else {
                            if(debug){ns.tprint("DEBUG: AutoTarget() threads on " + player_servers[ia] + " is 0!")}
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
            if (ns.getServerMoneyAvailable(targets[i]) < moneyCheck && player_hacking_lvl >= server_hacking_lvl) {
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
    //AutoTarget() END

    //PlayerServerCopies() Begin
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
    //PlayerServerCopies() END
    
    //reserveMoney() Begin
    async function reserveMoney() {
        let player_money = ns.getServerMoneyAvailable('home');
        if (!doesFileExist("SQLInject.exe","home")) {
            if (player_money >= 200000000) return true;
        }
        return false;
    }
    //reserveMoney() END

    //runBackdoor() Begin
    async function runBackdoor() {
        //let player = ns.getPlayer();
        //IDEA: Add RAM check for src/server-search.js prior to execution
        // Add query to player if 'factions' contains faction names then skip
        if(debug){ns.tprint('DEBUG: Start runBackdoor()')}
        if (ns.hasRootAccess('CSEC') == true && (ns.getServer('CSEC')).backdoorInstalled == false) {
            await ns.exec('src/server-search.js','home',1,'CSEC');
            await ns.sleep(150);
        }
        if (ns.hasRootAccess('avmnite-02h') == true && (ns.getServer('avmnite-02h')).backdoorInstalled == false) {
            await ns.exec('src/server-search.js','home',1,'avmnite-02h');
            await ns.sleep(150);
        }
        if (ns.hasRootAccess('I.I.I.I') == true && (ns.getServer('I.I.I.I')).backdoorInstalled == false) {
            await ns.exec('src/server-search.js','home',1,'I.I.I.I');
            await ns.sleep(150);
        }
        if (ns.hasRootAccess('run4theh111z') == true && (ns.getServer('run4theh111z')).backdoorInstalled == false) {
            await ns.exec('src/server-search.js','home',1,'run4theh111z');
            await ns.sleep(150);
        }
        if (ns.hasRootAccess('w0r1d_d43m0n') == true) {
            await ns.exec('src/server-search.js','home',1,'w0r1d_d43m0n');
            await ns.sleep(150);
        }
        
    }
    //runBackdoor() END

    //buyEXEs() Begin
    async function buyEXEs() {
        let ports = 0;
        let player_money = ns.getServerMoneyAvailable("home");
        let player_hacking_lvl = ns.getHackingLevel();
        if(debug){ns.tprint("DEBUG: buyEXEs() starting")}
        if (ns.getServerMaxRam("home") - ns.getServerUsedRam("home") < ns.getScriptRam("/src/singularity-tor.js")) {
            if(debug){ns.tprint("DEBUG: buyEXEs() not enough RAM to execute /src/singularity-tor.js")}
            return false;
        }
        else {
            await ns.exec("src/singularity-tor.js", "home", 1);
            await ns.sleep(150);
        }
        if (!ns.fileExists("BruteSSH.exe","home")) {
            if (player_money >= 500000) {
                if(debug){ns.tprint("DEBUG: buyEXEs() buying BruteSSH.exe")}
                await ns.exec("src/singularity-exes.js", "home", 1, "BruteSSH.exe");
                await ns.sleep(100);
            }
        } else if (ns.fileExists("BruteSSH.exe","home")) {
            ports++
            await ns.sleep(100);
        }
        if (!ns.fileExists("FTPCrack.exe","home") && player_hacking_lvl > 100) {
            if (player_money >= 1500000) {
                if(debug){ns.tprint("DEBUG: buyEXEs() buying FTPCrack.exe")}
                await ns.exec("/src/singularity-exes.js", "home", 1, "FTPCrack.exe");
                await ns.sleep(100);
            }
        } else if (ns.fileExists("FTPCrack.exe","home")) {
            ports++
            await ns.sleep(100);
        }
        if (!ns.fileExists("relaySMTP.exe","home") && player_hacking_lvl > 310) {
            if (player_money >= 5000000) {
                if(debug){ns.tprint("DEBUG: buyEXEs() buying relaySMTP.exe")}
                await ns.exec("/src/singularity-exes.js", "home", 1, "relaySMTP.exe");
                await ns.sleep(100);
            }
        } else if (ns.fileExists("relaySMTP.exe","home")) {
            ports++
            await ns.sleep(100);
        }
        if (!ns.fileExists("HTTPWorm.exe","home") && player_hacking_lvl > 440) {
            if (player_money >= 30000000) {
                if(debug){ns.tprint("DEBUG: buyEXEs() buying HTTPWorm.exe")}
                await ns.exec("/src/singularity-exes.js", "home", 1, "HTTPWorm.exe");
                await ns.sleep(100);
            }
        } else if (ns.fileExists("HTTPWorm.exe","home")) {
            ports++
            await ns.sleep(100);
        }
        if (!ns.fileExists("SQLInject.exe","home") && player_hacking_lvl > 700) {
            if (player_money >= 250000000) {
                if(debug){ns.tprint("DEBUG: buyEXEs() buying SQLInject.exe")}
                await ns.exec("/src/singularity-exes.js", "home", 1, "SQLInject.exe");
                await ns.sleep(100);
            }
        } else if (ns.fileExists("SQLInject.exe","home")) {
            ports++
            await ns.sleep(100);
        }
        if (ports==5) {
            if(debug){ns.tprint("DEBUG: buyEXEs() finished - ALL EXES PURCHASED")}
            return true;
        }
        if(debug){ns.tprint("DEBUG: buyEXEs() total EXEs: " + ports)}
        return false;
    }
    //buyEXEs() END

    //sellHash() Begin
    async function sellHash() {
        let upgradeName = "Sell for Money";
        if ((ns.getServerMaxRam('home') - ns.getServerUsedRam('home')) > ns.getScriptRam('src/hacknet-sellhash.js')) {
            if(debug){ns.tprint('DEBUG: sellHash() executing src/hacknet-sellhash.js')}
            ns.exec('src/hacknet-sellhash.js','home',1,upgradeName);
        }
    }
    //sellHash() END

    //focusRep() Begin
    async function focusRep(facName) {
        karma_level = ns.heart.break();
        if(useGang && karma_level > -54001) {
            //Do nothing
        } else if(!ns.getPlayer().isWorking) {
            ns.workForFaction(facName,'Hacking Contracts');
        }
    }
    //focusRep() END

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
        //Control script calls
        if (useGang) {
            if (!inBN2) {
                karma_level = ns.heart.break();
                if (karma_level > -54001) {
                    if (ns.isRunning('/src/gang-crime.js','home') == false) {
                        ns.exec('src/gang-crime.js', 'home');
                        await ns.sleep(100);
                        ns.tail('/src/gang-crime.js');
                        await ns.sleep(100);
                    }
                    ns.tail('auto-control.js');
                }
            } else {
                karma_level = -54001;
            }
            if (karma_level <= -54000) {
                if(debug){ns.tprint("DEBUG: starting /src/gang-control.js")}
                await ns.exec('/src/gang-control.js','home',1);
            }
        }
        //Sleeve Management
        if (useSleeve) {
            if ((ns.getServerMaxRam('home') - ns.getServerUsedRam('home')) > ns.getScriptRam('/src/sleeve-control.js')) {
                await ns.exec('/src/sleeve-control.js', 'home', 1, useGang);
                await ns.sleep(100);
            }
        }
        if (!all_exes) {
            if(debug){ns.tprint("DEBUG: starting buyEXEs()")}
            all_exes = await buyEXEs();
        } else {
            if(debug){ns.tprint("DEBUG: skipping buyEXEs() - ALL EXES PURCHASED")}
        }
        if(debug){ns.tprint("DEBUG: scanner_task==0, run AutoScanner()")}
        target_servers = await AutoScanner();
        if(debug){ns.tprint("DEBUG: AutoScanner() target_servers: " + target_servers)}
        if(debug){ns.tprint("DEBUG: starting TargetPhatServer()")}
		targets_value = await TargetPhatServer(target_servers);
        if(debug){ns.tprint("DEBUG: targets_value index[0][servername] " + targets_value[0]["servername"])}
        await ns.sleep(100);
        if (ns.getPurchasedServers().length > 0) {
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

        if (useHacknet) {
            if(debug){ns.tprint("DEBUG: starting /src/hacknet-upgrade.js")}
            await ns.exec('/src/hacknet-upgrade.js','home',1,hacknetCostMax);
        }
        if (useServerBuy && ns.getPurchasedServers().length != player_server_max) {
            if(debug){ns.tprint("DEBUG: starting buyServers()")}
            if (ns.getServerMaxRam('home') >= 16384) {
                var ram_size = 'MAX';
            } else {
                var ram_size = ns.getServerMaxRam('home') / 2;
            }
            ns.exec('/src/buy-servers.js','home',1,servername_prefix,ram_size);
        }
        await runBackdoor();
        await sellHash();
        await ns.sleep(100);
        //IDEA: Query factions via ns.checkFactionInvitations() method
        await ns.joinFaction('CyberSec');
        await ns.sleep(100);
        await ns.joinFaction('NiteSec');
        await ns.sleep(100);
        await ns.joinFaction('BitRunners');
        await ns.sleep(100);
        await ns.joinFaction('The Black Hand');
        await ns.sleep(100);
        await ns.joinFaction('Daedalus');
        await ns.sleep(100);
        await ns.joinFaction('Netburners');
        await ns.sleep(100);
        await ns.joinFaction('Slum Snakes');
        if (ns.getServerMaxRam('home') < 2048 && ns.getServerMoneyAvailable('home') > ns.getUpgradeHomeRamCost()) {
            ns.upgradeHomeRam();
        }
        if (focusRepGain) {
            if(debug){ns.tprint("DEBUG: starting focusRep()")}
            await focusRep('CyberSec');
        }
        //Appends increment to scanner task if we skip scan on every pass                
        await ns.sleep(150);
        scanner_task++;
        if (scanner_task==5) {
            scanner_task = 0;
        }
	}
}