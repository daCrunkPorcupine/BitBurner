/** @param {import(".").NS } ns */
export async function main(ns) {

    var host_prefix = "jus-"
    var target_servers = ["ecorp","megacorp","blade","b-and-a","nwo","clarkinc","4sigma","kuai-gong","omnitek"]
    var player_server_count = ns.getPurchasedServers().length;
    //each 1PB server = 57.7Bn
    
    ns.tprint("Target Server Count: " + target_servers.length);
    ns.tprint("Player Server Count: " + player_server_count);
    ns.tprint("First Player Server:" + host_prefix + player_server_count);

    for (var i = 0; i < target_servers.length; i++) {
        
        if (player_server_count < 1) {
            player_server_count = 0;
        }

        ns.tprint("Buying Servername: " + host_prefix + (i + player_server_count));
        //ns.tprint("Target Server: " + target_servers[i]);

        await ns.purchaseServer((host_prefix + (i + player_server_count)),1048576);
        await ns.scp("hack-target.js","home",host_prefix + (i + player_server_count));
        await ns.scp("auto-weaken.js","home",host_prefix + (i + player_server_count));
        await ns.scp("auto-grow.js","home",host_prefix + (i + player_server_count));
        await ns.scp("auto-hack.js","home",host_prefix + (i + player_server_count));
        await ns.exec("hack-target.js",host_prefix + (i + player_server_count),1,target_servers[i]);        
        
        await ns.sleep(6000);
    }

}