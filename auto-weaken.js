/** @param {import(".").NS } ns */
export async function main(ns) {
    //Passes argument to servername
    var servername = ns.args[0];
    //Runs weaken... simple
    await ns.weaken(servername);

}
