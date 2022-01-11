/** @param {import(".").NS } ns */
export async function main(ns) {

	//Set RAM Size
	var new_server_ram = 1024;
	//var new_server_count = Math.floor((ns.getServerMoneyAvailable("home")/2)/ns.getPurchasedServerCost(new_server_ram));
	//Edit prefix text
	var server_prefix = "jus"
	var player_server_count = ns.getPurchasedServers().length;
	//var server_costs = ((25 - player_server_count) * ns.getPurchasedServerCost(new_server_ram));
	while (true) {
		
		if (ns.getServerMoneyAvailable("home") > ns.getPurchasedServerCost(new_server_ram)) {
			var player_server_count = ns.getPurchasedServers().length;
			for (var i = player_server_count; i < 25; i++) {
				//ns.tprint(server_prefix + (i + player_server_count));
				var server_name = server_prefix + i;
				ns.purchaseServer((server_name), new_server_ram);
				await ns.sleep(100);
			}
		} else {
			await ns.sleep(60000);
		}
		await ns.sleep(100);
	}

	//ns.tprint("Price per server: " + ns.getPurchasedServerCost(new_server_ram));
	//ns.tprint("At " + new_server_ram + " RAM per server, can buy " + new_server_count);
	/**
	if (ns.getServerMoneyAvailable("home") > server_costs) {
		for (var i = 0; i < (25 - player_server_count); i++) {
			//ns.tprint(server_prefix + (i + player_server_count));
			ns.purchaseServer((server_prefix + (i + player_server_count)), new_server_ram);
			await ns.sleep(100);
		}
	}
	**/
	
	//Unused code atm. Don't touch Cliff. GFY
	/**
	for (var i = 0; i < new_server_count; i++) {
		
		if (player_server_count < 1) {
            player_server_count = 0;
        }

		//ns.purchaseServer((server_prefix + (i + player_server_count)),new_server_ram);
		ns.tprint(server_prefix + (i + player_server_count));
	}
	**/


}