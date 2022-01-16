/** @param {import(".").NS } ns */
export async function main(ns) {
    var checkDataFile = ns.args[0];
    //RAM usage limit for calling individual targets
    var ram_homereserve = 0.6;
    //Scans for phat servers for priority
    async function TargetPhatServer() {
        var targets = ns.read(checkDataFile).split("\n");
        //Gets array count
        if (targets.length == 1) {
            var targets_array = 1;
        } else {
            var targets_array = targets.length - 1;
        }
        var toptarget = 0;
        var server_value = 0;
    
        for (var i = targets_array; i >= 0; i--) {
            var player_hacking_lvl = ns.getHackingLevel();
            var server_hacking_lvl = ns.getServerRequiredHackingLevel(targets[i]);
            //Calculate a value (maxmoney * hackchance / weakentime)
            server_value = ns.getServerMaxMoney(targets[i]) * ns.hackAnalyzeChance(targets[i]) / ns.getWeakenTime(targets[i]);
            //ns.tprint("Server: " + targets[i] + "; Value: " + server_value);
            //await ns.write(serverdata, targets[i] + "," + server_value + "\n", "a");
            if (server_value > toptarget && player_hacking_lvl >= server_hacking_lvl) {
                var bestserver = targets[i];
                toptarget = server_value;
            }
            await ns.sleep(100);
        }
        //ns.tprint("Best server: " + bestserver + "; with $: " + toptarget);
        //var free_ram = Math.floor((ns.getServerMaxRam("home") - ns.getServerUsedRam("home")) * 0.8);
        ns.exec("auto-phattarget.js", "home", 1,bestserver);
        await ns.sleep(6000);
        
    }
    //Reads target list backwards
    async function AutoTarget() {
        var player_servers = ns.getPurchasedServers();
        var targets = ns.read(checkDataFile).split("\n");
        //Gets array count
        if (targets.length == 1) {
            var targets_array = 1;
        } else {
            var targets_array = targets.length - 1;
        }
        
        var numThreads = 1;


        //ns.print("Player Servers: " + player_servers);
        for (var i = targets_array; i >= 0; i--) {
            var chk_loop = 1;
            //ns.print(targets[i]);
            /**
            var srv_moneyavailable = (ns.getServerMoneyAvailable(targets[i]) / 1000000000).toFixed(2);
            var srv_moneymax = (ns.getServerMaxMoney(targets[i]) / 1000000000).toFixed(2);
            var srv_moneypct = (srv_moneyavailable / srv_moneymax * 100).toFixed(0);
            ns.print("Money (Bn): " + srv_moneyavailable + "; Max Money (Bn): " + srv_moneymax + "; % Available: " + srv_moneypct);
            ns.print("Security Minimum: " + ns.getServerMinSecurityLevel(targets[i]) + "; Security Current: " + ns.getServerSecurityLevel(targets[i]).toFixed(2));
            **/
            
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
                        ns.print("Checking Available RAM on " + player_servers[ia]);
                        var ps_MaxRam = ns.getServerMaxRam(player_servers[ia]);
                        var ps_UsedRam = ns.getServerUsedRam(player_servers[ia]);
                        var ps_ScriptRam = ns.getScriptRam("auto-weaken.js");

                        numThreads = Math.floor((ps_MaxRam - ps_UsedRam) / ps_ScriptRam);
                        ns.print("Possible Threads: " + numThreads);
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
                            chk_loop = 0;
                        }
                        ia++;
                        if (ia == player_servers.length) {
                            ns.print("No available servers, wait...");
                            await ns.sleep(6000);
                            if (ns.getServerUsedRam("home") < (ns.getServerMaxRam("home") * ram_homereserve)) { break }
                            var player_servers = ns.getPurchasedServers();
                            ia = 0;
                        }
                        await ns.sleep(250);
                    }

                    await ns.sleep(1000);
                }
            }
            else if (ns.getServerMoneyAvailable(targets[i]) < moneyCheck && player_hacking_lvl >= server_hacking_lvl) {
                if (player_servers.length != 0) {
                    //ns.print("Player Server Count: " + player_servers.length)
                    var ia = 0;
                    // && ia != player_servers.length
                    while (chk_loop == 1) {
                        ns.print("Checking Available RAM on " + player_servers[ia]);
                        var ps_MaxRam = ns.getServerMaxRam(player_servers[ia]);
                        var ps_UsedRam = ns.getServerUsedRam(player_servers[ia]);
                        var ps_ScriptRam = ns.getScriptRam("auto-grow.js");

                        numThreads = Math.floor((ps_MaxRam - ps_UsedRam) / ps_ScriptRam);
                        ns.print("Possible Threads: " + numThreads);
                        if (numThreads >= 1 && ps_UsedRam < (ps_MaxRam * 0.8)) {
                            ns.exec("auto-grow.js", player_servers[ia], numThreads, targets[i]);
                            chk_loop = 0;
                        }
                        ia++;
                        if (ia == player_servers.length) {
                            ns.print("No available servers, wait...");
                            await ns.sleep(6000);
                            if (ns.getServerUsedRam("home") < (ns.getServerMaxRam("home") * ram_homereserve)) { break }
                            ia = 0;
                        }
                        await ns.sleep(250);
                    }

                    await ns.sleep(1000);
                }
            }

        }

    }
    async function PlayerServerCopies() {
        var player_servers = ns.getPurchasedServers();
        for (var i_ps = 0; i_ps < player_servers.length; i_ps++) {
            //ns.print("Copying scripts to " + player_servers[i_ps]);
            await ns.scp("auto-weaken.js", "home", player_servers[i_ps]);
            await ns.scp("auto-grow.js", "home", player_servers[i_ps]);
            await ns.scp("auto-hack.js", "home", player_servers[i_ps]);
            await ns.sleep(100);
        }
    }


    while (true) {
        await PlayerServerCopies();
        //Executes locally if no player servers have been purchased, reserving free RAM for other scripts
        //Will not execute if too much RAM is in use (due to other processes)
        if (ns.getServerUsedRam("home") < (ns.getServerMaxRam("home") * ram_homereserve)) {
            await TargetPhatServer();
        }
        await ns.sleep(150);
        if (ns.getPurchasedServers().length > 0) {
            await AutoTarget();
        }


        await ns.sleep(150);
    }

}