/** @param {import(".").NS } ns */
export async function main(ns) {
	const port = ns.args[0];
	const memName = ns.args[1];
	const memIndex = ns.args[2];
	const territoryTarget = ns.args[3];
	//Maximum rep to grind with gang faction. IDEA: Query most expensive augment dynamically
	const factionRepThreshold = 1875000
	var jobTask = 'null';

	let gangInfo = ns.gang.getGangInformation();
	let otherGangs = ns.gang.getOtherGangInformation();
	let members = ns.gang.getMemberNames();
	let memberStats = ns.gang.getMemberInformation(memName);
	let avgWinChance = 0;
	let totWinChance = 0;
	let totalActiveGangs = 0;
	for(let otherGang in otherGangs) {
		if(otherGangs[otherGang].territory == 0 || otherGang == gangInfo.faction) continue;
		let winChance = gangInfo.power / (gangInfo.power + otherGangs[otherGang].power);
		totWinChance += winChance;
		totalActiveGangs++;
	}
	avgWinChance = totWinChance / totalActiveGangs;
	if(avgWinChance >= 0.65 && gangInfo.territory < territoryTarget) {
		//Enable Warfare
		ns.gang.setTerritoryWarfare(true);
		if (memIndex == members.length - 1 || memIndex == members.length - 2 || memIndex == members.length - 3) {
			jobTask = 'Territory Warfare';
		} else {
			jobTask = 'null';
		}
	} else {
		ns.gang.setTerritoryWarfare(false);
		await ns.sleep(100);
		//At max gang, start setting territory warfare
		if (members.length >= 12 && memberStats.str >= 650 && gangInfo.territory < territoryTarget) {
			jobTask = 'Territory Warfare';
		} else {
			jobTask = 'null';
		}
	}
	await ns.writePort(port,jobTask);
	await ns.sleep(100);
}