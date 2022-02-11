/** @param {import(".").NS } ns */
//Connects to host, runs installBackdoor();
export async function main(ns) {
    const s_target = ns.args[0];
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
	server_list.forEach(hop => ns.connect(hop));
	await ns.sleep(100);
	await ns.installBackdoor();
	ns.connect('home');
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
