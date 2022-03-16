/** @param {import("..").NS } ns */
export async function main(ns) {
    var server_prefix = ns.args[0];
    var ram_size = ns.args[1];
	var player_server_count = ns.getPurchasedServers().length;
    var player_server_max = ns.getPurchasedServerLimit();
    
    if (ns.getPurchasedServers().length < player_server_max && ns.getServerMoneyAvailable('home') > ns.getPurchasedServerCost(ram_size)) {
        var player_server_count = ns.getPurchasedServers().length;
        for (var i = player_server_count; i < player_server_max; i++) {
            var server_name = server_prefix + (i + 1);
            ns.purchaseServer((server_name), ram_size);
            await ns.sleep(100);
        }
	}
    /**
    //Reserves last server slot for a larger server for using ns.share();
    if (ns.getPurchasedServers().length < player_server_max) {
        let ram_scaled = ram_size * 2;
        if (ns.getServerMoneyAvailable('home') > ns.getPurchasedServerCost(ram_scaled)) {
            var server_name = server_prefix + 'share';
            ns.purchaseServer((server_name), ram_scaled);
            await ns.sleep(100);

            ns.killall(server_name);
            await ns.sleep(100);
            var numThreads = Math.floor((ns.getServerMaxRam(server_name) - ns.getServerUsedRam(server_name)) / ns.getScriptRam('src/auto-share.js'));
            await ns.scp('src/auto-share.js', 'home', server_name);
            ns.tprint(numThreads);
            //await ns.exec('src/auto-share.js',"home",5);
            ns.exec('src/auto-share.js',server_name,numThreads);



        }
    }
    */
}