/** @param {import(".").NS } ns */
export async function main(ns) {
    var target = ns.args[0];
    var hostname = ns.getHostname();
    var numThreads = 1;
    //Checks target MaxMoney * value
    var moneyCheck = ns.getServerMaxMoney(target) * 0.8;
    //Checks target Minimum Security level + value
    var securityCheck = ns.getServerMinSecurityLevel(target) + 10;

    //Diagnostic Print
    //ns.tprint("Security Level: " + ns.getServerSecurityLevel(target) + "; Threshold: " + securityCheck);
    //ns.tprint("Money: " + ns.getServerMoneyAvailable(target) + "; Threshold: " + moneyCheck);

    //Loops until security is low & money is high - allows the server to be hacked $
    while (ns.getServerSecurityLevel(target) > securityCheck || ns.getServerMoneyAvailable(target) < moneyCheck) {

        if (ns.getServerSecurityLevel(target) > securityCheck) {
            //Checks numThreads based on Free RAM based on home MAX
            if (hostname == "home") {
                if (ns.getServerMaxRam("home") >= 256) {
                    numThreads = Math.floor((ns.getServerMaxRam("home") - ns.getServerUsedRam("home")) * 0.92) / ns.getScriptRam("auto-weaken.js");
                } else if (ns.getServerMaxRam("home") >= 64) {
                    numThreads = Math.floor((ns.getServerMaxRam("home") - ns.getServerUsedRam("home")) * 0.8) / ns.getScriptRam("auto-weaken.js");
                } else if (ns.getServerMaxRam("home") < 64) {
                    numThreads = Math.floor((ns.getServerMaxRam("home") - ns.getServerUsedRam("home")) * 0.6) / ns.getScriptRam("auto-weaken.js");
                }
            } else {
                numThreads = Math.floor((ns.getServerMaxRam(hostname) - ns.getServerUsedRam(hostname))) / ns.getScriptRam("auto-weaken.js");
            }
            
            if (numThreads >= 1) {
                ns.exec("auto-weaken.js", hostname, numThreads, target);
            }
            await ns.sleep(1000);
            while (ns.isRunning("auto-weaken.js", hostname, target) == true) {
                ns.print("auto-weaken.js is running on " + target + " : " + hostname);
                await ns.sleep(1000);
            }
        }
        else if (ns.getServerMoneyAvailable(target) < moneyCheck) {
            //Checks numThreads based on Free RAM based on home MAX
            if (hostname == "home") {
                if (ns.getServerMaxRam("home") >= 256) {
                    numThreads = Math.floor((ns.getServerMaxRam("home") - ns.getServerUsedRam("home")) * 0.92) / ns.getScriptRam("auto-grow.js");
                } else if (ns.getServerMaxRam("home") >= 64) {
                    numThreads = Math.floor((ns.getServerMaxRam("home") - ns.getServerUsedRam("home")) * 0.8) / ns.getScriptRam("auto-grow.js");
                } else if (ns.getServerMaxRam("home") < 64) {
                    numThreads = Math.floor((ns.getServerMaxRam("home") - ns.getServerUsedRam("home")) * 0.6) / ns.getScriptRam("auto-grow.js");
                }
            } else {
                numThreads = Math.floor((ns.getServerMaxRam(hostname) - ns.getServerUsedRam(hostname))) / ns.getScriptRam("auto-grow.js");
            }
            
            if (numThreads >= 1) {
                ns.exec("auto-grow.js", hostname, numThreads, target);
            }
            await ns.sleep(1000);
            while (ns.isRunning("auto-grow.js", hostname, target) == true) {
                ns.print("auto-grow.js is running on " + target + " : " + hostname);
                await ns.sleep(1000);
            }
        await ns.sleep(1000);
        }
    }
    
    await ns.sleep(150);
    
}