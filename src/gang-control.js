/** @param {import(".").NS } ns */
//CONSTANTS
//IDEA: Query player for BN
//ns.getPlayer() - "bitNodeN"
const in_BN2 = false;
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
			if (karma_level < 54000) {
				ns.exec("src/gang-crime.js", "home");
				await ns.sleep(100);
				ns.tail("src/gang-crime.js");
			}
		} else {
			var karma_level = 54001;
			//if(debug){ns.tprint("DEBUG: var karma_level = " + karma_level)}
		}
		
		if (!ns.gang.inGang() && karma_level > 54000) {
			if(debug){ns.tprint("DEBUG: No gang detected, creating gang")}
			ns.gang.createGang('NiteSec');
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
		//ns.tprint(gangInfo);
		//Checks if any member recruitment is open
		while(ns.gang.canRecruitMember()) {
            var possibleNames = memberNames.filter(name => !members.includes(name));
            var member_random = possibleNames[getRandomInt(possibleNames.length)];
            ns.gang.recruitMember(member_random);
			if(debug){ns.tprint("DEBUG: Recruit Member: " + member_random)}
            await ns.sleep(1500);
        }

		//Manages individual members
		var members = ns.gang.getMemberNames();
		let training_threshold = 125;
		let rep_grind = [];
		for(let i = 0; i < members.length; i++) {
			if(debug){ns.tprint("DEBUG: Processing Member: " + members[i])}
			var task = null;
			let memberStats = ns.gang.getMemberInformation(members[i]);
			//Resets task to prevent loops from assigning too many incorrect jobs
			ns.gang.setMemberTask(members[i], "Unassigned");
			//Checks for possible Ascend
			let ascend_result = ns.gang.getAscensionResult(members[i]);
			if(gangInfo.isHacking && ascend_result.hack > 1.29) {
				//Ascend
				//ns.gang.ascendMember(members[i]);
				//ns.tprint("Ascend_Result: " + ascend_result.hack + "; Member Stat: " + memberStats.hack_asc_mult);
				if (memberStats.hack > 50 && ascend_result.hack > 1.29) {
					if(debug){ns.tprint("DEBUG: Ascend Member: " + members[i])}
					ns.gang.ascendMember(members[i]);
				}
			}

			//ns.tprint(memberStats);
			if (memberStats.hack < training_threshold) {
				task = "Train Hacking";
			} else if (memberStats.hack > 400 && members.length > 10 && rep_grind.length < 3) {
				task = "Cyberterrorism";
				rep_grind.push(members[i]);
			} else if (memberStats.hack > 400) {
				task = "Money Laundering";
			} else if (memberStats.hack > 160) {
				task = "Plant Virus";
			} else if (memberStats.hack >= training_threshold) {
				task = "Identity Theft";
			}
			
			//Sets last member to Vigilante Justice if wantedPenalty is high
			if (gangInfo.wantedLevel > 1 && gangInfo.wantedPenalty < 0.65 && i == members.length - 1) {
				task = "Ethical Hacking";
			} else if (gangInfo.wantedPenalty < 0.1) {
				//Sets all members to lower wanted
				task = "Ethical Hacking";
			}
			//Sets member task
			ns.gang.setMemberTask(members[i], task);

			//ns.tprint(ns.gang.getAscensionResult(members[i]));
			await ns.sleep(100);
		}

	}
	
}
//Random INT generator
function getRandomInt(max) {
	return Math.floor(Math.random() * Math.floor(max));
  }