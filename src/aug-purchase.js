/** @param {import(".").NS } ns */
const augRepGain = [
    'ADR-V1 Pheromone Gene',
    'ADR-V2 Pheromone Gene',
    "The Shadow's Simulacrum",
    'Social Negotiation Assistant (S.N.A)',
]
const augHacknet = [
    'Hacknet Node Core Direct-Neural Interface',
    'Hacknet Node Kernel Direct-Neural Interface',
    'Hacknet Node NIC Architecture Neural-Upload',
    'Hacknet Node NIC Architecture Neural-Upload',
    'Hacknet Node Cache Architecture Neural-Upload',
]
const augHacking = [
    'Neurotrainer I',
    'Neurotrainer II',
    'Neurotrainer III',
    'BitWire',
    'Synaptic Enhancement Implant',
    'Artificial Synaptic Potentiation',
    'Cranial Signal Processors - Gen I',
    'Cranial Signal Processors - Gen II',
    'Cranial Signal Processors - Gen III',
    'The Black Hand',
    'FocusWire',
    'Power Recirculation Core',
    'Unstable Circadian Modulator',
    'CRTX42-AA Gene Modification',
    'Neural-Retention Enhancement',
    'Neuregen Gene Modification',
    'Enhanced Myelin Sheathing',
    'Neuronal Densification',
    'Neural Accelerator',
    'nextSENS Gene Modification',
    'Embedded Netburner Module Core Implant',
    'SmartJaw',
    'OmniTek InfoLoad',
    'Artificial Bio-neural Network Implant',
    'Neuralstimulator',
    'PC Direct-Neural Interface',
    'Xanipher',
    'BitRunners Neurolink',
    'PC Direct-Neural Interface',
    'PC Direct-Neural Interface Optimization Submodule',
    'PC Direct-Neural Interface NeuroNet Injector',
    'Cranial Signal Processors - Gen IV',
    'Cranial Signal Processors - Gen V',
    'Embedded Netburner Module',
    'Embedded Netburner Module Core V2 Upgrade',
    'Embedded Netburner Module Core V3 Upgrade',
    'Embedded Netburner Module Analyze Engine',
    'Embedded Netburner Module Direct Memory Access Upgrade',
    'HyperSight Corneal Implant',
    'Unstable Circadian Modulator',
    'SPTN-97 Gene Modification',
    'ECorp HVMind Implant',
    'DataJack',
    'Embedded Netburner Module Direct Memory Access Upgrade',
    'CashRoot Starter Kit',
]
var augPendingInstall = [];
var augPlayerOwned = [];
var augAvailable = [];
var augSorted = [];
var augCost;
var augRep;
var augLoop = 1;

export async function main(ns) {
    const port = ns.args[0];
    const augTask = ns.args[1];
    ns.disableLog('ALL');
    augPlayerOwned = ns.getOwnedAugmentations();
    ns.tail('/src/aug-purchase.js', 'home', port, augTask);
    
    //Check for augments available first
    //If augSorted == 0, there are no augments left to install, return data to port for auto-control.js to stop calling
    if (augTask != 'neuroflux') {
        await augSorting(ns,augTask);
    } else {
        augLoop = 0;
        await augNeuroflux(ns);
    }
    if (augSorted.length == 0) {
        await ns.writePort(port,'AugsComplete');
        augLoop = 0;
    }
    while (augLoop == 1) {
        //Clears variables for loop
        augSorted = [];
        await augSorting(ns,augTask);
        await augPurchase(ns,augTask);
        if (augSorted.length == 0) {
            let timeStamp = localeHHMMSS();
            ns.tprint(timeStamp + ': aug-purchase.js completed')
            await ns.sleep(100);
            await augNeuroflux(ns);
            ns.installAugmentations('auto-exec.js');
        } else if (augSorted[0]['augCost'] > (ns.getServerMoneyAvailable('home') * 1.6) && augPendingInstall.length > 5) {
            //Dumps any remaining money into NeuroFlux
            await augNeuroflux(ns);
            ns.installAugmentations('auto-exec.js');
        }
        ns.print('augSorted: ');
        ns.print(augSorted);
        ns.print('augPendingInstall: ');
        ns.print(augPendingInstall);
        await ns.sleep(60000);
    }
}

async function augSorting(ns,augTask) {
    augPlayerOwned = ns.getOwnedAugmentations();
    augAvailable = ns.getAugmentationsFromFaction(ns.gang.getGangInformation().faction);
    if (augTask == 'hacking') {
        for (let i = 0; i < augAvailable.length; i++) {
            augCost = ns.getAugmentationPrice(augAvailable[i]);
            augRep = ns.getAugmentationRepReq(augAvailable[i]);
            //phat_targets.push({"servername":targets[i],"value":server_value});
            if (augHacking.includes(augAvailable[i]) && !augPlayerOwned.includes(augAvailable[i]) && !augPendingInstall.includes(augAvailable[i])) {
                augSorted.push({'aug':augAvailable[i],'augCost':augCost,'augRep':augRep});
            }
            await ns.sleep(50);
        }            
    }
    augSorted.sort(function(a, b){return a.augCost-b.augCost});
}

async function augPurchase(ns,augTask) {
    if (augTask == 'hacking') {
        for (let i = 0; i < augSorted.length; i++) {
            if (ns.getServerMoneyAvailable('home') > ns.getAugmentationPrice(augSorted[i]['aug'])) {
                try {
                    ns.purchaseAugmentation(ns.gang.getGangInformation().faction,augSorted[i]['aug']);
                    augPendingInstall.push(augSorted[i]['aug'])
                    ns.print('Purchasing Augmentation: ' + augSorted[i]['aug']);
                } catch {

                }
            }
            await ns.sleep(50);
        }
    }
}

async function augNeuroflux(ns) {
    //Checks rep with CyberSec/Daedalus
    //NeuroFlux Governor
    var topFac;
    if (ns.getPlayer().currentWorkFactionName == 'CyberSec' || ns.getPlayer().currentWorkFactionName == 'Daedalus') ns.stopAction();
    await ns.sleep(50);
    if (ns.getFactionRep('Daedalus') >= ns.getFactionRep('CyberSec')) {
        topFac = 'Daedalus';
    } else {
        topFac = 'CyberSec';
    }
    
    while(ns.getAugmentationPrice('NeuroFlux Governor') <= ns.getServerMoneyAvailable('home') && ns.getAugmentationRepReq('NeuroFlux Governor') <= ns.getFactionRep(topFac)) {
        try {
            ns.purchaseAugmentation(topFac,'NeuroFlux Governor');
            ns.print('Purchasing Augmentation: NeuroFlux Governor');
        } catch {

        }
        await ns.sleep(100);
    }
}

function localeHHMMSS(ms = 0) {
    if (!ms) {
        ms = new Date().getTime()
    }

    return new Date(ms).toLocaleTimeString()
}