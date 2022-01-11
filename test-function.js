/** @param {import(".").NS } ns */
export async function main(ns) {

    async function testprint() {
        ns.tprint("This is called from a function!");
    }

    testprint();
    
}