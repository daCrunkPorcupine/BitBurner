/** @param {import(".").NS } ns */
export async function main(ns) {
    var target = ns.args[0];
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
            //Checks numThreads based on Free RAM * 80%
            numThreads = Math.floor((ns.getServerMaxRam("home") - ns.getServerUsedRam("home")) * 0.8) / ns.getScriptRam("auto-weaken.js");
            if (numThreads >= 1) {
                ns.exec("auto-weaken.js", "home", numThreads, target);
            }
            await ns.sleep(1000);
            //ns.print("Checking if script is running:"+ns.isRunning("auto-weaken.js","home",server_target));
            while (ns.isRunning("auto-weaken.js", "home", target) == true) {
                ns.print("auto-weaken.js is running on " + target + "sleep");
                await ns.sleep(1000);
            }
        }
        else if (ns.getServerMoneyAvailable(target) < moneyCheck) {
            //Checks numThreads based on Free RAM * 80%
            numThreads = Math.floor((ns.getServerMaxRam("home") - ns.getServerUsedRam("home")) * 0.8) / ns.getScriptRam("auto-grow.js");
            if (numThreads >= 1) {
                ns.exec("auto-grow.js", "home", numThreads, target);
            }
            await ns.sleep(1000);
            //ns.print("Checking if script is running:"+ns.isRunning("auto-grow.js","home",server_target));
            while (ns.isRunning("auto-grow.js", "home", target) == true) {
                ns.print("auto-grow.js is running on " + target + "sleep");
                await ns.sleep(1000);
            }
        await ns.sleep(1000);
        }
    }
    
    await ns.sleep(150);
    
}