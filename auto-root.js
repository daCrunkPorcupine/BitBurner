/** @param {import(".").NS } ns */
export async function main(ns) {
    //Passes argument to target
	var target = ns.args[0];

    var ports = 0;
    //Checks for each file, runs & adds to var ports
    if (ns.fileExists("BruteSSH.exe", "home")) { ns.brutessh(target); ports++; }
    if (ns.fileExists("FTPCrack.exe", "home")) { ns.ftpcrack(target); ports++; }
    if (ns.fileExists("relaySMTP.exe", "home")) { ns.relaysmtp(target); ports++; }
    if (ns.fileExists("HTTPWorm.exe", "home")) { ns.httpworm(target); ports++; }
    if (ns.fileExists("SQLInject.exe", "home")) { ns.sqlinject(target); ports++; }
    
    if (ports >= ns.getServerNumPortsRequired(target)) {
        ns.nuke(target);
        var numThreads = Math.floor((ns.getServerMaxRam(target) - ns.getServerUsedRam(target)) / ns.getScriptRam("hack-server.js"));
        if (numThreads > 0) {
            await ns.scp("hack-server.js", "home", target);
            ns.exec("hack-server.js", target, numThreads);
        }
    } else {
        ns.print("Can't Nuke! " + target);
    }

}
