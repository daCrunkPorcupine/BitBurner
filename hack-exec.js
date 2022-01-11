/** @param {import(".").NS } ns */
export async function main(ns) {
    //Passes argument to servername
	var servername = ns.args[0];
	//Checks for max memory of 'servername'
	var serverMemMax = ns.getServerMaxRam(servername);

	//BruteSSH.exe
    if (ns.fileExists("BruteSSH.exe", "home")) {
        ns.brutessh(servername);
    }
	//FTPCrack.exe
	if (ns.fileExists("FTPCrack.exe", "home")) {
        ns.ftpcrack(servername);
    }
	//relaySMTP.exe
	if (ns.fileExists("relaySMTP.exe", "home")) {
        ns.relaysmtp(servername);
    }
	//HTTPWorm.exe
	if (ns.fileExists("HTTPWorm.exe", "home")) {
        ns.httpworm(servername);
    }
	//SQLInject.exe
	if (ns.fileExists("SQLInject.exe", "home")) {
        ns.sqlinject(servername);
    }
	//Attempts to run Nuke.exe
    ns.nuke(servername);
	//Kills all scripts on var 'servername'
	await ns.killall(servername);
	await ns.sleep(100);
	//Checks possible threads available. Max Ram - Used Ram / RAM COST of 'hack-server.js'
	var numThreads = Math.floor((ns.getServerMaxRam(servername) - ns.getServerUsedRam(servername)) / 2.45);

	//Copies & Executes Script on var 'servername'
	await ns.scp("hack-server.js", "home", servername);
	await ns.exec("hack-server.js", servername, numThreads);


}
