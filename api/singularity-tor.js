/** @param {import(".").NS } ns */
export async function main(ns) {
    var exe = ns.args[0];
    ns.tprint("/api/singularity-tor.js executing to " + exe);
    ns.purchaseTor();
    await ns.sleep(100);
    ns.purchaseProgram(exe);
    await ns.sleep(100);

}