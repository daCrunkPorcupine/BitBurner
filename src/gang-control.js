/** @param {import(".").NS } ns */
//CONSTANTS
//IDEA: Query player for BN
//ns.getPlayer() - "bitNodeN"
const inBN2 = false;
//Debug Flag
const debug = false;
//Maximum rep to grind with gang faction. IDEA: Query most expensive augment dynamically
const factionRepThreshold = 1875000
// create list of names
const memberNames = [
	'cliffo', //1
	'the raccoon', //2
	'steak sauce', //3
	'the jackhammer', //4
	'the bulldozer', //5
	'the dumptruck', //6
	'the crane', //7
	'cleveland steamer', //8
	'kentucky klondike bar', //9
	'alabama hot pocket', //10
	'flying camel', //11
	'kennebunkport surprise', //12
	'ballcuzi', //13
	'miles dyson', //14
	'sarah connor', //15
	'john connor', //16
	'T-800', //17
	'T-1000', //18
	'hunter killer', //19
	'mongo', //20
	'8=D', //21
	'peenis8=D', //22
	'goldfeesh', //23
	'goldfith', //24
	'peetypeet', //25
	'phil mccrackin', //26
	'phil atio', //27
	'sue shi', //28
];
const fileDir = 'src/txt/'
const moneyReserveRatio = 10;
var statMult = 2;
const territoryTarget = 0.95;
var gangWep = [];
var gangArmor = [];
var gangVehicle = [];
var gangRootkit = [];
var gangAugs = [];
var port = 2;
var karma_level;
export async function main(ns) {
	while (true) {
		let gang_valid = ns.gang.inGang();
		if(!gang_valid) {
			//Attempts to create gang
			await checkGang();
		} else {
			//Runs gang functions
			await getEquipNames();
			await ns.sleep(100);
			await gangManager();
			await ns.sleep(100);
		}
		await ns.sleep(60000);
	}
	//checkGang() Begin
	async function checkGang() {
		karma_level = ns.heart.break();
		if (!ns.gang.inGang() && karma_level <= -54000) {
			if(debug){ns.tprint("DEBUG: No gang detected, creating gang")}
			ns.gang.createGang('Slum Snakes');
			await ns.sleep(100);
			ns.gang.createGang('NiteSec');
			return true;
		} else {
			return false;
		}
	}
	//checkGang() END
	//gangManager() Begin
	async function gangManager() {
		if(debug){ns.tprint("DEBUG: Starting gangManager()")}
		var gangInfo = ns.gang.getGangInformation();
        var otherGangs = ns.gang.getOtherGangInformation();
		var members = ns.gang.getMemberNames();
		var factionRep = ns.getFactionRep(gangInfo.faction);
		//ns.tprint(gangInfo);
		//Checks if any member recruitment is open
		while(ns.gang.canRecruitMember()) {
            var possibleNames = memberNames.filter(name => !members.includes(name));
			await ns.sleep(100);
            var member_random = possibleNames[getRandomInt(possibleNames.length)];
			await ns.sleep(100);
            ns.gang.recruitMember(member_random);
			if(debug){ns.tprint("DEBUG: Recruit Member: " + member_random)}
            await ns.sleep(100);
        }
		if (gangInfo.territory > 0.98) statMult = 1.4;
		//Manages individual members
		members = ns.gang.getMemberNames();
		let training_threshold = 100;
		let rep_grind = [];
		//let territoryWarfare = [];
		for(let i = 0; i < members.length; i++) {
			if(debug){ns.tprint("DEBUG: Processing Member: " + members[i])}
			var task = null;
			let ascend_result = null;
			let memberStats = ns.gang.getMemberInformation(members[i]);
			//Resets task to prevent loops from assigning too many incorrect jobs
			//ns.gang.setMemberTask(members[i], "Unassigned");
			//Checks for possible Ascend
			ascend_result = ns.gang.getAscensionResult(members[i]);
			if(ascend_result != null) {
				//Ascend
				if (gangInfo.isHacking && ascend_result.hack > statMult) {
					if(debug){ns.tprint("DEBUG: Ascend Member: " + members[i])}
					ns.gang.ascendMember(members[i]);
					await ns.sleep(100);
					//Refresh stats after ascend
					memberStats = ns.gang.getMemberInformation(members[i]);
				} else if (!gangInfo.isHacking) {
					let ascendCt = 0;
					if(ascend_result.str > statMult) ascendCt++
					if(ascend_result.def > statMult) ascendCt++
					if(ascend_result.dex > statMult) ascendCt++
					if(ascend_result.agi > statMult) ascendCt++
					if(ascend_result.hack > statMult) ascendCt++
					if(ascend_result.cha > statMult) ascendCt++
					if(ascendCt >= 2) {
						if(debug){ns.tprint("DEBUG: Ascend Member: " + members[i])}
						ns.gang.ascendMember(members[i]);
						await ns.sleep(100);
						//Refresh stats after ascend
						memberStats = ns.gang.getMemberInformation(members[i]);
					}
				}
			}
			await ns.sleep(100);
			await equipUpgrade(members[i]);
			await ns.sleep(100);
			//ns.tprint(memberStats);
			if (gangInfo.isHacking) {
				if (memberStats.hack < training_threshold) {
					task = 'Train Hacking';
				} else if (memberStats.hack > 400 && members.length > 11 && rep_grind.length < 4 && factionRep < factionRepThreshold) {
					task = 'Cyberterrorism';
					rep_grind.push(members[i]);
				} else if (memberStats.hack > 400) {
					task = 'Money Laundering';
				} else if (memberStats.hack > 160) {
					task = 'Plant Virus';
				} else if (memberStats.hack >= training_threshold) {
					task = 'Identity Theft';
				}
			} else {
				//Combat Tasks
				//IDEA: average stats for threshold check
				if (memberStats.str < training_threshold) {
					task = 'Train Combat';
				} else if (memberStats.str > 450 && members.length < 12) {
					task = 'Terrorism';
					rep_grind.push(members[i]);
				} /**else if (memberStats.str > 450 && members.length > 11 && rep_grind.length < 2 && factionRep < factionRepThreshold) {
					task = 'Terrorism';
					rep_grind.push(members[i]);
				}**/ else if (memberStats.str > 450) {
					task = 'Human Trafficking';
				} else if (memberStats.str > 200) {
					task = 'Traffick Illegal Arms';
				} else if (memberStats.str >= training_threshold) {
					task = 'Strongarm Civilians';
				}
			}
		
			//Sets last member to Vigilante Justice if wantedPenalty is high
			if (gangInfo.isHacking && gangInfo.wantedLevel > 1 && gangInfo.wantedPenalty < 0.40 && i == members.length - 1) {
				task = 'Ethical Hacking';
			} else if (!gangInfo.isHacking && gangInfo.wantedPenalty < 0.40) {
				if (members.length >= 12 && i == members.length - 4) {
					task = 'Vigilante Justice';
				} else if (i == members.length - 1) {
					task = 'Vigilante Justice';
				}
			}
			if (gangInfo.wantedPenalty < 0.1) {
				//Sets all members to lower wanted
				if (gangInfo.isHacking) {
					task = 'Ethical Hacking';
				} else {
					//Combat Gang
					task = 'Vigilante Justice';
				}
			}
			//At max gang, start setting territory warfare
			if (!gangInfo.isHacking && members.length >= 12 && memberStats.str >= 650) {
				//let chk_task = await terWarfare(members[i],i);
				if ((ns.getServerMaxRam('home') - ns.getServerUsedRam('home')) > ns.getScriptRam('/src/gang-territory.js')) {
					await ns.exec('/src/gang-territory.js', 'home', 1, members[i], i);
					//Waits until data is available in port
					let portStatus = ns.getPortHandle(port);
					while(portStatus.empty()) {
						await ns.sleep(1000);
					}
				}
				let chk_task = await ns.readPort(port);
				if (chk_task != null || chk_task != 'null') task = chk_task;
			}
			//Sets member task
			ns.gang.setMemberTask(members[i], task);

			await ns.sleep(1000);
		}

	}
	//gangManager() END
	//getEquipNames() Begin
	async function getEquipNames() {
        var gangEquip = ns.gang.getEquipmentNames();
		let gangInfo = ns.gang.getGangInformation();
        for(let i = 0; i < gangEquip.length; i++) {
            //ns.tprint(gangEquip[i]);
            //ns.tprint(ns.gang.getEquipmentType(gangEquip[i]));
            if(ns.gang.getEquipmentType(gangEquip[i]) == 'Weapon') gangWep.push(gangEquip[i]);
            if(ns.gang.getEquipmentType(gangEquip[i]) == 'Armor') gangArmor.push(gangEquip[i]);
            if(ns.gang.getEquipmentType(gangEquip[i]) == 'Vehicle') gangVehicle.push(gangEquip[i]);
            if(ns.gang.getEquipmentType(gangEquip[i]) == 'Rootkit') gangRootkit.push(gangEquip[i]);
            await ns.sleep(100);
        }
		if(gangInfo.isHacking) {
			gangAugs.push("BitWire");
			gangAugs.push("Neuralstimulator");
			gangAugs.push("DataJack");
		} else {
			gangAugs.push("Bionic Arms");
			gangAugs.push("Bionic Legs");
			gangAugs.push("Bionic Spine");
			gangAugs.push("BrachiBlades");
			gangAugs.push("Nanofiber Weave");
			gangAugs.push("Synthetic Heart");
			gangAugs.push("Synfibril Muscle");
			gangAugs.push("Graphene Bone Lacings");
			gangAugs.push("BitWire");
			gangAugs.push("Neuralstimulator");
			gangAugs.push("DataJack");
		}
    }
	//getEquipNames() END
	//equipUpgrade() Begin
	async function equipUpgrade(memName) {
		if(debug){ns.tprint('DEBUG: equipUpgrade() for : ' + memName)}
		let memInfo = ns.gang.getMemberInformation(memName);
		let gangInfo = ns.gang.getGangInformation();
		if(gangInfo.isHacking) {
			for(let i = gangRootkit.length; i >= 0; i--) {
				if(memInfo.upgrades.includes(gangRootkit[i])) {
					if(debug){ns.tprint(gangRootkit[i] + ' already equipped!')}
				}
				else if(ns.gang.getEquipmentCost(gangRootkit[i]) <= (ns.getServerMoneyAvailable('home') / moneyReserveRatio)) {
					if(debug){ns.tprint('DEBUG: equipUpgrade() buy item/name: '+ gangRootkit[i] + ' ' + memName)}
					ns.gang.purchaseEquipment(memName,gangRootkit[i]);
				}
				await ns.sleep(100);
			}
			await ns.sleep(100);
			for(let i = gangAugs.length; i >= 0; i--) {
				if(memInfo.upgrades.includes(gangAugs[i])) {
					if(debug){ns.tprint(gangAugs[i] + ' already installed!')}
				}
				else if(ns.gang.getEquipmentCost(gangAugs[i]) <= (ns.getServerMoneyAvailable('home') / 4)) {
					if(debug){ns.tprint('DEBUG: equipUpgrade() buy item/name: '+ gangAugs[i] + ' ' + memName)}
					ns.gang.purchaseEquipment(memName,gangAugs[i]);
				}
				await ns.sleep(100);
			}
		} else {
			for(let i = gangWep.length; i >= 0; i--) {
				if(memInfo.upgrades.includes(gangWep[i])) {
					if(debug){ns.tprint(gangWep[i] + ' already equipped!')}
				}
				else if(ns.gang.getEquipmentCost(gangWep[i]) <= (ns.getServerMoneyAvailable('home') / moneyReserveRatio)) {
					if(debug){ns.tprint('DEBUG: equipUpgrade() buy item/name: '+ gangWep[i] + ' ' + memName)}
					ns.gang.purchaseEquipment(memName,gangWep[i]);
				}
				await ns.sleep(100);
			}
			await ns.sleep(100);
			for(let i = gangArmor.length; i >= 0; i--) {
				if(memInfo.upgrades.includes(gangArmor[i])) {
					if(debug){ns.tprint(gangArmor[i] + ' already equipped!')}
				}
				else if(ns.gang.getEquipmentCost(gangArmor[i]) <= (ns.getServerMoneyAvailable('home') / moneyReserveRatio)) {
					if(debug){ns.tprint('DEBUG: equipUpgrade() buy item/name: '+ gangArmor[i] + ' ' + memName)}
					ns.gang.purchaseEquipment(memName,gangArmor[i]);
				}
				await ns.sleep(100);
			}
			await ns.sleep(100);
			for(let i = gangVehicle.length; i >= 0; i--) {
				if(memInfo.upgrades.includes(gangVehicle[i])) {
					if(debug){ns.tprint(gangVehicle[i] + ' already equipped!')}
				}
				else if(ns.gang.getEquipmentCost(gangVehicle[i]) <= (ns.getServerMoneyAvailable('home') / moneyReserveRatio)) {
					if(debug){ns.tprint('DEBUG: equipUpgrade() buy item/name: '+ gangVehicle[i] + ' ' + memName)}
					ns.gang.purchaseEquipment(memName,gangVehicle[i]);
				}
				await ns.sleep(100);
			}
			await ns.sleep(100);
			for(let i = gangAugs.length; i >= 0; i--) {
				if(memInfo.upgrades.includes(gangAugs[i])) {
					if(debug){ns.tprint(gangAugs[i] + ' already installed!')}
				}
				else if(ns.gang.getEquipmentCost(gangAugs[i]) <= (ns.getServerMoneyAvailable('home') / 4)) {
					if(debug){ns.tprint('DEBUG: equipUpgrade() buy item/name: '+ gangAugs[i] + ' ' + memName)}
					ns.gang.purchaseEquipment(memName,gangAugs[i]);
				}
				await ns.sleep(100);
			}
			await ns.sleep(100);
			if(memInfo.str > 400) {
				//Only installs Rootkits if set to HTraff jobs
				for(let i = gangRootkit.length; i >= 0; i--) {
					if(memInfo.upgrades.includes(gangRootkit[i])) {
						if(debug){ns.tprint(gangRootkit[i] + ' already equipped!')}
					}
					else if(ns.gang.getEquipmentCost(gangRootkit[i]) <= (ns.getServerMoneyAvailable('home') / moneyReserveRatio)) {
						if(debug){ns.tprint('DEBUG: equipUpgrade() buy item/name: '+ gangRootkit[i] + ' ' + memName)}
						ns.gang.purchaseEquipment(memName,gangRootkit[i]);
					}
					await ns.sleep(100);
				}
			}
		}
		await ns.sleep(100);
	}
	//equipUpgrade() END
	/**
	//terWarfare() Begin
	async function terWarfare(memName,memIndex) {
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
				return 'Territory Warfare';
			}
		} else {
			ns.gang.setTerritoryWarfare(false);
			await ns.sleep(100);
			//At max gang, start setting territory warfare
			if (members.length >= 12 && memberStats.str >= 650 && gangInfo.territory < territoryTarget) {
				return 'Territory Warfare';
			}
		}

		await ns.sleep(100);
	}
	//terWarfare() END
	*/
	
}
//Random INT generator
function getRandomInt(max) {
	return Math.floor(Math.random() * Math.floor(max));
  }