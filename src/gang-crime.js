/** @param {import("..").NS } ns */
export async function main(ns) {
    //var crime = ns.args[0];
    ns.disableLog('ALL');
    var crime = 'homicide';
    var scriptStart = localeHHMMSS();
    while (ns.heart.break() > -54010) {
        
        if(!ns.isBusy()) {
            ns.commitCrime(crime);
            ns.print("Karma: " + ns.heart.break());
        }
        await ns.sleep(10);
    
    }
    var scriptFinish = localeHHMMSS();
    ns.print('Script Start: ' + scriptStart);
    ns.print('Script Finish: ' + scriptFinish);
}
function localeHHMMSS(ms = 0) {
    if (!ms) {
        ms = new Date().getTime()
    }

    return new Date(ms).toLocaleTimeString()
}