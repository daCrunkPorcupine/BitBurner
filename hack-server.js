/** @param {import(".").NS } ns */
export async function main(ns) {
    //Gets servername from local host
    var servername = ns.getHostname();
    //Checks servername MaxMoney * value
    var moneyCheck = ns.getServerMaxMoney(servername) * 0.8;
    //Checks servername Minimum Security level + value
    var securityCheck = ns.getServerMinSecurityLevel(servername) + 10;

    while(true) {
        if (ns.getServerSecurityLevel(servername) > securityCheck) {
            //If security level is higher than 'securityCheck' threashold, weaken
            await ns.weaken(servername);
        } else if (ns.getServerMoneyAvailable(servername) < moneyCheck) {
            //If money is lower than 'moneyCheck' threashold, grow
            await ns.grow(servername);
        }
        else {
            // Do nothing
        }
        await ns.sleep(6000);
    }

}
