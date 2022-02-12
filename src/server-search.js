/** @param {import(".").NS } ns */
//Connects to host, runs installBackdoor();
export async function main(ns) {
	await ns.sleep(100);
    const s_target = ns.args[0];
	//const debug = ns.args[1];
	const debug = false;
	
	var server_list = [];
	if (s_target == null) {
	}
	let search_result = await scanAll(ns, 'home', s_target);
	if (search_result !== null) {
		ns.print(search_result.map((el) => {
			server_list.push(el)
			return el + ",";
		}).reduce((prev, curr) => {
			return prev + curr;
		}));
	} else {
		ns.print(`Server "${s_target}" was not found!`);
	}
	if(debug){ns.tprint("DEBUG server-search.js: server_list")}
	if(debug){ns.tprint(server_list)}
	server_list.forEach(hop => ns.connect(hop));
	await ns.sleep(100);
	if(debug){ns.tprint("DEBUG server-search.js: execuring ns.installBackdoor()")}
	await ns.installBackdoor();
	ns.connect('home');
	await ns.sleep(100);
}

async function scanAll(ns, target = 'home', search_target = null, recursionCall = false) {
	const targets = ns.scan(target);
	const match = targets.find((elem) =>  {return RegExp(search_target).test(elem)});
	if (match) {
		return [match]
	} else {
		for (const [idx, target] of targets.entries()) {
			let skip = false;
			if (recursionCall === true && idx === 0) {
				skip = true;
			}
			if (skip === false) {
				let res = await scanAll(ns, target, search_target, true);
				if (res != null) {
					return [target, ...res]
				}
			}
		}
		return null
	}
}
