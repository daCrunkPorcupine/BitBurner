/** @param {import("..").NS } ns */
export async function main(ns) {
    //var crime = ns.args[0];
    ns.disableLog('ALL');
    var crime = 'homicide';
    
    while (ns.heart.break() < 54000) {
        
        if(!ns.isBusy()) {
            ns.commitCrime(crime);
            ns.print("Karma: " + ns.heart.break());
        }
        await ns.sleep(10);
    
    }  
}