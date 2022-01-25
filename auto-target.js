/** @param {import(".").NS } ns */
export async function main(ns) {
    var checkDataFile = ns.args[0];
    //RAM usage limit for calling individual targets
    var ram_homereserve = 0.7;
    
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

        //Gets array count
        if (targets.length == 1) {
            var targets_array = 1;
        } else {
            var targets_array = targets.length - 1;
        }
        var server_value = 0;

        //ns.tprint("BOTNET BEST TARGET: " + bestserver);
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
                        //ns.tprint("EXECUTING BOTNET ATTACK: " + botnet_list[ia] + "; WITH RAM: " + ns.getServerMaxRam(botnet_list[ia]));
                        await ns.scp("auto-phattarget.js", "home", botnet_list[ia]);
                        await ns.scp("auto-weaken.js", "home", botnet_list[ia]);
                        await ns.scp("auto-grow.js", "home", botnet_list[ia]);
                        ns.killall(botnet_list[ia]);
                        ns.exec("auto-phattarget.js", botnet_list[ia], 1, bestserver);
                    } else {
                        //ns.tprint("BOTNET ATTACK ALREADY RUNNING! " + botnet_list[ia] + " to " + bestserver);
                    }


                } else {
                    //ns.tprint("Skipping Botnet attacks - server is prepped: " + bestserver);
                }
                await ns.sleep(100);
            }
        }
    }
    //botnetTarget() END
    
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
                            if (ns.getServerUsedRam("home") < (ns.getServerMaxRam("home") * ram_homereserve)) { chk_loop = 0 }
                            await ns.sleep(1000);
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
                    var set_break = 0
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
                            if (ns.getServerUsedRam("home") < (ns.getServerMaxRam("home") * ram_homereserve)) { chk_loop = 0 }
                            await ns.sleep(1000);
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
        let targets_value = await TargetPhatServer();
        //Executes locally if no player servers have been purchased, reserving free RAM for other scripts
        //Will not execute if too much RAM is in use (due to other processes)
        if (ns.getServerUsedRam("home") < (ns.getServerMaxRam("home") * ram_homereserve)) {
            homeTarget(targets_value);
        }
        await ns.sleep(150);
        await botnetTarget(targets_value);
        await ns.sleep(150);
        if (ns.getPurchasedServers().length > 0) {
            await AutoTarget();
        }
        await ns.sleep(150);
    }

}