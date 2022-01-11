/** @param {import(".").NS } ns */
export async function main(ns) {
    var serverdata = "data_serverphat.txt";
    var checkDataFile = ns.args[0];
    var targets = ns.read(checkDataFile).split("\n");
    //Gets array count -1
    var targets_array = targets.length - 1;
    var toptarget = 0;
    var server_value = 0;
    ns.rm(serverdata);
    await ns.write(serverdata, "server,value\n", "w");

    for (var i = targets_array; i >= 0; i--) {
        var player_hacking_lvl = ns.getHackingLevel();
        var server_hacking_lvl = ns.getServerRequiredHackingLevel(targets[i]);
        //Calculate a value (maxmoney * hackchance / weakentime)
        server_value = ns.getServerMaxMoney(targets[i]) * ns.hackAnalyzeChance(targets[i]) / ns.getWeakenTime(targets[i]);
        ns.tprint("Server: " + targets[i] + "; Value: " + server_value);
        await ns.write(serverdata, targets[i] + "," + server_value + "\n", "a");
        if (server_value > toptarget && player_hacking_lvl > server_hacking_lvl) {
            var bestserver = targets[i];
            toptarget = server_value;
        }
        await ns.sleep(100);
    }
    await ns.sleep(6000);
    ns.tprint("Best server: " + bestserver + "; with $: " + toptarget);
}