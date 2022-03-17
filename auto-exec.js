/** @param {import(".").NS } ns */
export async function main(ns) {
    //Executes auto-control.js
    ns.disableLog('ALL');
    var timeStamp;
    while (true) {
        if (!ns.isRunning('auto-control.js','home')) {
            ns.exec('auto-control.js', 'home');
            await ns.sleep(100);
            timeStamp = localeHHMMSS();
            ns.print(timeStamp + ': auto-control.js executing');
        }
        await ns.sleep(60000);
    }

}

function localeHHMMSS(ms = 0) {
    if (!ms) {
        ms = new Date().getTime()
    }

    return new Date(ms).toLocaleTimeString()
}