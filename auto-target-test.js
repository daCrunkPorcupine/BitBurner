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
            var chk_loop = 1;
            //ns.print("alpha-ent");
            /**
            var srv_moneyavailable = (ns.getServerMoneyAvailable("alpha-ent") / 1000000000).toFixed(2);
            var srv_moneymax = (ns.getServerMaxMoney("alpha-ent") / 1000000000).toFixed(2);
            var srv_moneypct = (srv_moneyavailable / srv_moneymax * 100).toFixed(0);
            ns.print("Money (Bn): " + srv_moneyavailable + "; Max Money (Bn): " + srv_moneymax + "; % Available: " + srv_moneypct);
            ns.print("Security Minimum: " + ns.getServerMinSecurityLevel("alpha-ent") + "; Security Current: " + ns.getServerSecurityLevel("alpha-ent").toFixed(2));
            **/
            
            //Checks servername Minimum Security level + value
            var securityCheck = ns.getServerMinSecurityLevel("alpha-ent") + 5;
            //Checks servername MaxMoney * value
            var moneyCheck = ns.getServerMaxMoney("alpha-ent") * 0.8;
            //Checks player hacking level
            var player_hacking_lvl = ns.getHackingLevel();
            var server_hacking_lvl = ns.getServerRequiredHackingLevel("alpha-ent");


            // if security > minimum + 10 then weaken (pushed to player servers if exist)
            if (ns.getServerSecurityLevel("alpha-ent") > securityCheck && player_hacking_lvl > server_hacking_lvl) {
                //If security level is higher than 'securityCheck' threashold, weaken
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
                        if (numThreads >= 4) {
                            ns.exec("auto-weaken.js", player_servers[ia], numThreads, "alpha-ent");
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
                    ns.exec("auto-weaken.js", "home", numThreads, "alpha-ent");
                    //ns.print("Checking if script is running:"+ns.isRunning("auto-weaken.js","home",server_target));
                    while (ns.isRunning("auto-weaken.js", "home", "alpha-ent") == true) {
                        ns.print("auto-weaken.js is running on " + "alpha-ent" + "sleep");
                        await ns.sleep(60000);
                    }
                }
            }
            else if (ns.getServerMoneyAvailable("alpha-ent") < moneyCheck && player_hacking_lvl > server_hacking_lvl) {
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
                            ns.exec("auto-grow.js", player_servers[ia], numThreads, "alpha-ent");
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
                    ns.exec("auto-grow.js", "home", numThreads, "alpha-ent");
                    //ns.print("Checking if script is running:"+ns.isRunning("auto-grow.js","home",server_target));
                    while (ns.isRunning("auto-grow.js", "home", "alpha-ent") == true) {
                        ns.print("auto-grow.js is running on " + "alpha-ent" + "sleep");
                        await ns.sleep(60000);
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
        await ns.sleep(600);
    }

}