/** @param {import(".").NS } ns */
export async function main(ns) {
    //Gets servername from local host
    var servername = ns.getHostname();
    //Checks servername Minimum Security level + value
    var securityCheck = ns.getServerMinSecurityLevel(servername) + 10;

    while(true) {
        if (ns.getServerSecurityLevel(servername) > securityCheck) {
            //If security level is higher than 'securityCheck' threashold, weaken
            await ns.weaken(servername);
        } else {
            //Else, grow server
            await ns.grow(servername);
        }
    }

}
