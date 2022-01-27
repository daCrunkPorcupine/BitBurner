/** @param {import(".").NS } ns */
export async function main(ns) {
    var exe = ns.args[0];
    ns.tprint("/api/singularity-exes.js executing to " + exe);
    ns.purchaseProgram(exe);
}