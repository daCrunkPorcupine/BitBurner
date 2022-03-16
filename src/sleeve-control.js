/** @param {import("..").NS } ns */
const shockLimit = 90;
const combatStatLimit = 50;
export async function main(ns) {
    const useGang = ns.args[0];
    let sleeveCount = ns.sleeve.getNumSleeves();
    for (let i = 0; i < sleeveCount; i++) {
        let sleeveStat = ns.sleeve.getSleeveStats(i);
        if (useGang && ns.heart.break() > -54001) {
            await sleeveGangPrep(ns,i);
        }
        await ns.sleep(100);
    }
}

async function sleeveGangPrep(ns,sleeveIndex) {
    let sleeveStat = ns.sleeve.getSleeveStats(sleeveIndex);
    await ns.sleep(50);
    if (sleeveStat.shock > shockLimit) {
        ns.sleeve.setToShockRecovery(sleeveIndex);
    } else if (sleeveStat.strength < combatStatLimit) {
        ns.sleeve.setToGymWorkout(sleeveIndex,'Powerhouse Gym','Train Strength');
    } else if (sleeveStat.defense < combatStatLimit) {
        ns.sleeve.setToGymWorkout(sleeveIndex,'Powerhouse Gym','Train Defense');
    } else if (sleeveStat.dexterity < combatStatLimit) {
        ns.sleeve.setToGymWorkout(sleeveIndex,'Powerhouse Gym','Train Dexerity');
    } else if (sleeveStat.agility < combatStatLimit) {
        ns.sleeve.setToGymWorkout(sleeveIndex,'Powerhouse Gym','Train Agility');
    } else {
        ns.sleeve.setToCommitCrime(sleeveIndex,'Homicide');
        /**
        let sleeveTask = ns.sleeve.getTask(sleeveIndex);
        if (sleeveTask.task == 'Crime' && sleeveTask.crime == 'Homicide') {
            ns.tprint('match!')
        }
        */
    }
}