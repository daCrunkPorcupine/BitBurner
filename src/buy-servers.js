/** @param {import("..").NS } ns */
export async function main(ns) {
    var server_prefix = ns.args[0];
    var ram_size = ns.args[1];
	var player_server_count = ns.getPurchasedServers().length;
    var player_server_max = ns.getPurchasedServerLimit();
    
    if (ns.getPurchasedServers().length < player_server_max - 1 && ns.getServerMoneyAvailable('home') > ns.getPurchasedServerCost(ram_size)) {
        var player_server_count = ns.getPurchasedServers().length;
        for (var i = player_server_count; i < player_server_max - 1; i++) {
            var server_name = server_prefix + i;
            ns.purchaseServer((server_name), ram_size);
            await ns.sleep(100);
        }
	}
    //Reserves last server slot for a larger server for using ns.share();
    if (ns.getPurchasedServers().length < player_server_max) {
        let ram_scaled = ram_size * 2;
        if (ns.getServerMoneyAvailable('home') > ns.getPurchasedServerCost(ram_scaled)) {
            var server_name = server_prefix + 'share';
            ns.purchaseServer((server_name), ram_scaled);
            await ns.sleep(100);

        }
    }
}