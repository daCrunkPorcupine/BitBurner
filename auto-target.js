/** @param {import(".").NS } ns */
export async function main(ns) {
    var checkDataFile = ns.args[0];

    //Reads target list backwards
    async function AutoTarget() {
        var player_servers = ns.getPurchasedServers();
        var targets = ns.read(checkDataFile).split("\n");
        //Gets array count -1
        var targets_array = targets.length - 1;
        var numThreads = 1;


        ns.print("Player Servers: " + player_servers);
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
            if (ns.getServerSecurityLevel(targets[i]) > securityCheck && player_hacking_lvl > server_hacking_lvl) {
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
                        if (numThreads >= 5) {
                            //Checks for maximum threads required. Security lowered 0.05 per 1 thread
                            var req_security_threads = Math.floor((ns.getServerSecurityLevel(targets[i]) - (ns.getServerMinSecurityLevel(targets[i]) + 10)) / 0.05);
                            req_security_threads++;
                            if (numThreads > req_security_threads) {
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
                            await ns.sleep(60000);
                            var player_servers = ns.getPurchasedServers();
                            ia = 0;
                        }
                        await ns.sleep(250);
                    }

                    await ns.sleep(1000);
                } else {
                    //Executes locally if no player servers have been purchased, reserving 20% of free RAM for other scripts
                    //ns.tprint(Math.floor(((ns.getServerMaxRam("home") - ns.getServerUsedRam("home")) * 0.8)) + " RAM Free (80% of available)");
                    numThreads = Math.floor(((ns.getServerMaxRam("home") - ns.getServerUsedRam("home")) * 0.8) / ns.getScriptRam("auto-weaken.js"));
                    //Checks for maximum threads required. Security lowered 0.05 per 1 thread
                    var req_security_threads = Math.floor((ns.getServerSecurityLevel - (ns.getServerMinSecurityLevel(targets[i]) + 10)) * 0.05);
                    if (numThreads > req_security_threads) {
                        if (req_security_threads < 0){
                            numThreads = 1;
                        } else {numThreads = req_security_threads + 10}
                    }
                    ns.exec("auto-weaken.js", "home", numThreads, targets[i]);
                    //ns.print("Checking if script is running:"+ns.isRunning("auto-weaken.js","home",server_target));
                    while (ns.isRunning("auto-weaken.js", "home", targets[i]) == true) {
                        ns.print("auto-weaken.js is running on " + targets[i] + "sleep");
                        await ns.sleep(60000);
                    }
                }
            }
            else if (ns.getServerMoneyAvailable(targets[i]) < moneyCheck && player_hacking_lvl > server_hacking_lvl) {
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
                        if (numThreads >= 4) {
                            ns.exec("auto-grow.js", player_servers[ia], numThreads, targets[i]);
                            chk_loop = 0;
                        }
                        ia++;
                        if (ia == player_servers.length) {
                            ns.print("No available servers, wait...");
                            await ns.sleep(60000);
                            ia = 0;
                        }
                        await ns.sleep(250);
                    }

                    await ns.sleep(1000);
                } else {
                    //Executes locally if no player servers have been purchased, reserving 20% of free RAM for other scripts
                    //ns.tprint(Math.floor(((ns.getServerMaxRam("home") - ns.getServerUsedRam("home")) * 0.8)) + " RAM Free (80% of available)");
                    numThreads = Math.floor(((ns.getServerMaxRam("home") - ns.getServerUsedRam("home")) * 0.8) / ns.getScriptRam("auto-grow.js"));
                    ns.exec("auto-grow.js", "home", numThreads, targets[i]);
                    //ns.print("Checking if script is running:"+ns.isRunning("auto-grow.js","home",server_target));
                    while (ns.isRunning("auto-grow.js", "home", targets[i]) == true) {
                        ns.print("auto-grow.js is running on " + targets[i] + "sleep");
                        await ns.sleep(60000);
                    }
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
        await AutoTarget();
        await ns.sleep(6000);
    }

}