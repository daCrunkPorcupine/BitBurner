/** @param {import(".").NS } ns */
export async function main(ns) {
    var target = "megacorp";
    
    ns.tprint(ns.getServerMinSecurityLevel(target) + 10);
    ns.tprint(ns.getServerSecurityLevel(target));
    /**
    //ns.getServerMoneyAvailable(target);
    //ns.getServerMaxMoney(target);
    //ns.tprint("Growth Rate: " + ns.growthAnalyze(target,45));
    ns.tprint(ns.weakenAnalyze(100));
    ns.tprint(ns.weakenAnalyze(10));
    //var req_security_threads = (ns.getServerSecurityLevel - (ns.getServerMinSecurityLevel(target) + 10));
    //ns.tprint("Required Threads: " + req_security_threads);
    **/
    var numThreads = 150;
    var req_security_threads = Math.floor((ns.getServerSecurityLevel(target) - (ns.getServerMinSecurityLevel(target) + 10)) / 0.05);
    ns.tprint("Calc threads: " + req_security_threads);
    req_security_threads++;
    if (numThreads > req_security_threads) {
        if (req_security_threads < 0){
            numThreads = 1;
        } else {numThreads = req_security_threads + 10}
    }
    ns.tprint("Threads: " + numThreads);
}
