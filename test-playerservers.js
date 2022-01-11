/** @param {import(".").NS } ns */
export async function main(ns) {
    var numThreads = 1;
    var player_servers = ns.getPurchasedServers();
    var chk_loop = 1;

    /**
    if (player_servers != 0) {
        var ia = 0;
        while (chk_loop == 1) {
            numThreads = Math.floor((ns.getServerMaxRam(player_servers[ia]) - ns.getServerUsedRam(player_servers[ia])) / ns.getScriptRam("auto-weaken.js"));
            if(numThreads > 50) {
                ns.exec("auto-weaken.js", player_servers[ia], numThreads, server_target);
                chk_loop = 0;
            }
            ia++;
            ns.sleep(1000);
        }
        // if money < max * 0.5 then grow (pushed to player servers if exist)
    } // end if player_servers
    **/

    if (ns.getServerSecurityLevel(server_target) > securityCheck) {
        //If security level is higher than 'securityCheck' threashold, weaken
        if (player_servers != 0) {
            var ia = 0;
            while (chk_loop == 1) {
                numThreads = Math.floor((ns.getServerMaxRam(player_servers[ia]) - ns.getServerUsedRam(player_servers[ia])) / ns.getScriptRam("auto-weaken.js"));
                if(numThreads > 50) {
                    ns.exec("auto-weaken.js", player_servers[ia], numThreads, server_target);
                    chk_loop = 0;
                }
                ia++;
                ns.sleep(1000);
            }
            // if money < max * 0.5 then grow (pushed to player servers if exist)
        } else {
            numThreads = Math.floor((ns.getServerMaxRam("home") - ns.getServerUsedRam("home")) / ns.getScriptRam("auto-weaken.js"));
            ns.exec("auto-weaken.js", "home", numThreads, server_target);
            await ns.sleep(60000);
            //ns.print("Checking if script is running:"+ns.isRunning("auto-weaken.js","home",server_target));
            while (ns.isRunning("auto-weaken.js", "home", server_target) == true) {
                //ns.print("auto-weaken.js is running, sleep")
                await ns.sleep(60000);
            }
        }


    } else if (ns.getServerMoneyAvailable(server_target) < moneyCheck) {
        //If money is lower than 'moneyCheck' threashold, grow
        if (player_servers != 0) {
            var ia = 0;
            while (chk_loop == 1) {
                numThreads = Math.floor((ns.getServerMaxRam(player_servers[ia]) - ns.getServerUsedRam(player_servers[ia])) / ns.getScriptRam("auto-grow.js"));
                if(numThreads > 50) {
                    ns.exec("auto-grow.js", player_servers[ia], numThreads, server_target);
                    chk_loop = 0;
                }
                ia++;
                ns.sleep(1000);
            }
            // if money < max * 0.5 then grow (pushed to player servers if exist)
        } else {
            numThreads = Math.floor((ns.getServerMaxRam("home") - ns.getServerUsedRam("home")) / ns.getScriptRam("auto-grow.js"));
            ns.exec("auto-grow.js", "home", numThreads, server_target);
            await ns.sleep(60000);
            //ns.print("Checking if script is running:"+ns.isRunning("auto-grow.js","home",server_target));
            while (ns.isRunning("auto-grow.js", "home", server_target) == true) {
                //ns.print("auto-grow.js is running, sleep")
                await ns.sleep(60000);
            }
        }

    } else {
        //Else, hack server
        var numThreads = Math.floor((ns.getServerMaxRam("home") - ns.getServerUsedRam("home")) / ns.getScriptRam("auto-hack.js"));
        
        //Not even RAM to run enough threads, run a sleep until other hack tasks complete
        while (numThreads < 5) {
            //Recheck threads
            var numThreads = Math.floor((ns.getServerMaxRam("home") - ns.getServerUsedRam("home")) / ns.getScriptRam("auto-hack.js"));
            ns.print("Not enough RAM to run hack, waiting")
            ns.sleep(60000);
        }
        //If threads is higher than 100, set a flat 100
        if (numThreads > 100) { numThreads = 100; }
        //ns.tprint("Executing auto-hack.js with # threads:" + numThreads);
        ns.exec("auto-hack.js", "home", numThreads, server_target);
        await ns.sleep(10000);

    }

}






/**
Working Block
             if (player_servers.length != 0) {
                ns.tprint("Player Server Count: " + player_servers.length)
                var ia = 0;
                while (chk_loop == 1 && ia != player_servers.length) {
                    ns.tprint("Checking Available RAM on " + player_servers[ia]);
                    var ps_MaxRam = ns.getServerMaxRam(player_servers[ia]);
                    var ps_UsedRam = ns.getServerUsedRam(player_servers[ia]);
                    var ps_ScriptRam = ns.getScriptRam("auto-weaken.js");

                    numThreads = Math.floor((ps_MaxRam - ps_UsedRam) / ps_ScriptRam);
                    ns.tprint("Possible Threads: " + numThreads);
                    if (numThreads > 3) {
                        ns.exec("auto-weaken.js", player_servers[ia], numThreads, targets[i]);
                        chk_loop = 0;
                    }
                    ia++;
                    await ns.sleep(1000);
                }
                // else hack from home

                await ns.sleep(1000);
            } 
 */