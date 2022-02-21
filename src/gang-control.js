/** @param {import(".").NS } ns */
//CONSTANTS
//IDEA: Query player for BN
//ns.getPlayer() - "bitNodeN"
const in_BN2 = false;
//Maximum rep to grind with gang faction. IDEA: Query most expensive augment dynamically
const factionRepThreshold = 1875000
//Debug Flag
const debug = false;
// create list of names
const memberNames = [
	"cliffo", //1
	"the raccoon", //2
	"steak sauce", //3
	"the jackhammer", //4
	"the bulldozer", //5
	"the dumptruck", //6
	"the crane", //7
	"cleveland steamer", //8
	"kentucky klondike bar", //9
	"alabama hot pocket", //10
	"flying camel", //11
	"kennebunkport surprise", //12
	"ballcuzi", //13
	"miles dyson", //14
	"sarah connor", //15
	"john connor", //16
	"T-800", //17
	"T-1000", //18
	"hunter killer", //19
	"mongo", //20
	"8=D", //21
	"peenis8=D", //22
	"goldfeesh", //23
	"goldfith", //24
];
export async function main(ns) {
	
	while (true) {
		let gang_valid = ns.gang.inGang();
		if(!gang_valid) {
			//Attempts to create gang
			await checkGang();
		} else {
			//Runs gang functions
			await gangManager();
			await ns.sleep(100);
		}
		await ns.sleep(60000);
	}
	
	async function checkGang() {
		//if(debug){ns.tprint("DEBUG: Starting checkGang()")}
		if (!in_BN2) {
			var karma_level = ns.heart.break();
			if (karma_level > -54000) {
				ns.exec("src/gang-crime.js", "home");
				await ns.sleep(100);
				//ns.tail("src/gang-crime.js");
			}
		} else {
			var karma_level = -54001;
			//if(debug){ns.tprint("DEBUG: var karma_level = " + karma_level)}
		}
		
		if (!ns.gang.inGang() && karma_level < -54000) {
			if(debug){ns.tprint("DEBUG: No gang detected, creating gang")}
			ns.gang.createGang('NiteSec');
			await ns.sleep(100);
			ns.gang.createGang('Slum Snakes');
			return true;
		} else {
			return false;
		}
	}

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
            var member_random = possibleNames[getRandomInt(possibleNames.length)];
            ns.gang.recruitMember(member_random);
			if(debug){ns.tprint("DEBUG: Recruit Member: " + member_random)}
            await ns.sleep(300);
        }
		
		//Manages individual members
		var members = ns.gang.getMemberNames();
		let training_threshold = 75;
		let rep_grind = [];
		let territoryWarfare = [];
		for(let i = 0; i < members.length; i++) {
			if(debug){ns.tprint("DEBUG: Processing Member: " + members[i])}
			var task = null;
			let ascend_result = null;
			let memberStats = ns.gang.getMemberInformation(members[i]);
			//Resets task to prevent loops from assigning too many incorrect jobs
			ns.gang.setMemberTask(members[i], "Unassigned");
			//Checks for possible Ascend
			ascend_result = ns.gang.getAscensionResult(members[i]);
			if(ascend_result != null) {
				//Ascend
				let statMult = 1.5;
				//ns.gang.ascendMember(members[i]);
				//ns.tprint("Ascend_Result: " + ascend_result.hack + "; Member Stat: " + memberStats.hack_asc_mult);
				if (gangInfo.isHacking && ascend_result.hack > statMult) {
					if(debug){ns.tprint("DEBUG: Ascend Member: " + members[i])}
					ns.gang.ascendMember(members[i]);
				} else if (!gangInfo.isHacking && ascend_result.str > statMult && ascend_result.def > statMult && ascend_result.dex > statMult && ascend_result.agi > statMult) {
					if(debug){ns.tprint("DEBUG: Ascend Member: " + members[i])}
					ns.gang.ascendMember(members[i]);
				}
			}

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
				} else if (memberStats.str > 400 && members.length > 11 && rep_grind.length < 4 && factionRep < factionRepThreshold) {
					task = 'Terrorism';
					rep_grind.push(members[i]);
				} else if (memberStats.str > 400) {
					task = 'Human Trafficking';
				} else if (memberStats.str > 200) {
					task = 'Traffick Illegal Arms';
				} else if (memberStats.str > 85) {
					task = 'Strongarm Civilians';
				} else if (memberStats.str >= training_threshold) {
					task = 'Mug People';
				}
			}
		
			//Sets last member to Vigilante Justice if wantedPenalty is high
			if (gangInfo.isHacking && gangInfo.wantedLevel > 1 && gangInfo.wantedPenalty < 0.65 && i == members.length - 1) {
				task = 'Ethical Hacking';
			} else if (!gangInfo.isHacking && gangInfo.wantedPenalty < 0.65) {
				if (members.length >= 12 && i == members.length - 4) {
					task = 'Vigilante Justice';
				} else if (i == members.length - 1) {
					task = 'Vigilante Justice';
				}
			} else if (gangInfo.wantedPenalty < 0.1) {
				//Sets all members to lower wanted
				if (gangInfo.isHacking) {
					task = 'Ethical Hacking';
				} else {
					//Combat Gang
					task = 'Vigilante Justice';
				}
			}
			//At max gang, start setting territory warfare
			if (!gangInfo.isHacking && members.length >= 12 && memberStats.str > 85) {
				if (i == members.length - 1 || i == members.length - 2 || i == members.length - 3) {
					territoryWarfare.push(members[i]);
					task = 'Territory Warfare';
				}
				
			}
			//Sets member task
			ns.gang.setMemberTask(members[i], task);

			await ns.sleep(6000);
		}

	}
	
}
//Random INT generator
function getRandomInt(max) {
	return Math.floor(Math.random() * Math.floor(max));
  }