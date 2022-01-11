/** @param {import(".").NS } ns */
export async function main(ns) {
    //Pushed from VSC
    //Passes argument to server_target
    var server_target = ns.args[0];
    var server_host = ns.getHostname();
    //Checks server_target MaxMoney * value
    var moneyCheck = ns.getServerMaxMoney(server_target) * 0.4;
    //Checks server_target Minimum Security level + value
    var securityCheck = ns.getServerMinSecurityLevel(server_target) + 10;

    while (true) {
        if (ns.getServerSecurityLevel(server_target) > securityCheck) {
            //If security level is higher than 'securityCheck' threashold, weaken
            var numThreads = Math.floor((ns.getServerMaxRam(server_host) - ns.getServerUsedRam(server_host)) / ns.getScriptRam("auto-weaken.js"));
            if (server_host == "home") {
                numThreads = numThreads - 10
            }
            //ns.tprint("Executing auto-weaken.js with # threads:" + numThreads);
            ns.exec("auto-weaken.js", server_host, numThreads, server_target);
            await ns.sleep(60000);
            //ns.print("Checking if script is running:"+ns.isRunning("auto-weaken.js",server_host,server_target));
            while (ns.isRunning("auto-weaken.js", server_host, server_target) == true) {
                //ns.print("auto-weaken.js is running, sleep")
                await ns.sleep(60000);
            }
        } else if (ns.getServerMoneyAvailable(server_target) < moneyCheck) {
            //If money is lower than 'moneyCheck' threashold, grow
            var numThreads = Math.floor((ns.getServerMaxRam(server_host) - ns.getServerUsedRam(server_host)) / ns.getScriptRam("auto-grow.js"));
            if (server_host == "home") {
                numThreads = numThreads - 10
            }
            //ns.tprint("Executing auto-grow.js with # threads:" + numThreads);
            ns.exec("auto-grow.js", server_host, numThreads, server_target);
            await ns.sleep(60000);
            //ns.print("Checking if script is running:"+ns.isRunning("auto-grow.js",server_host,server_target));
            while (ns.isRunning("auto-grow.js", server_host, server_target) == true) {
                //ns.print("auto-grow.js is running, sleep")
                await ns.sleep(60000);
            }
        } else {
            //Else, hack server
            var numThreads = Math.floor((ns.getServerMaxRam(server_host) - ns.getServerUsedRam(server_host)) / ns.getScriptRam("auto-hack.js"));
            if (server_host == "home") {
                numThreads = numThreads - 10
            }
            //ns.tprint("Executing auto-hack.js with # threads:" + numThreads);
            ns.exec("auto-hack.js", server_host, numThreads, server_target);
            await ns.sleep(60000);
            //ns.print("Checking if script is running:"+ns.isRunning("auto-hack.js",server_host,server_target));
            while (ns.isRunning("auto-hack.js", server_host, server_target) == true) {
                //ns.print("auto-hack.js is running, sleep")
                await ns.sleep(60000);
            }
        }
        //ns.print("Reached end of main loop, restarting...");
        await ns.sleep(1000);
    }
}