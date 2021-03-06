/** @param {import(".").NS } ns */
//Downloads all necessary files from GITHUB
//https://github.com/daCrunkPorcupine/BitBurner
//FU Cliff

//MASTER BRANCH
const baseUrl = 'https://raw.githubusercontent.com/daCrunkPorcupine/BitBurner/master/';
//DEV BRANCH
//const baseUrl = 'https://raw.githubusercontent.com/daCrunkPorcupine/BitBurner/dev/';

const filesroot = [
  'auto-control.js',
  'auto-root.js',
  'auto-grow.js',
  'auto-weaken.js',
  'auto-hack.js',
  'auto-phattarget.js',
  'auto-exec.js',
]
const filessource = [
  'singularity-tor.js',
  'singularity-exes.js',
  'aug-purchase.js',
  'auto-share.js',
  'buy-servers.js',
  'gang-control.js',
  'gang-crime.js',
  'gang-territory.js',
  'server-search.js',
  'hacknet-sellhash.js',
  'hacknet-upgrade.js',
  'sleeve-control.js',
]
const oldfiles = [
  'auto-target.js',
  'auto-scan.js',
]
export async function main(ns) {

  if (ns.getHostname() !== 'home') {
        throw new Exception('Run the script from home');
    }
    //Copies primary scripts in / root
    for (let i = 0; i < filesroot.length; i++) {
      let filename = filesroot[i];
      let path = baseUrl + filename;
      await ns.scriptKill(filename, 'home');
      await ns.rm(filename);
      await ns.sleep(200);
      ns.tprint(`[${localeHHMMSS()}] Trying to download ${path}`);
      await ns.wget(path + '?ts=' + new Date().getTime(), filename);
    }
    //Copies / moves specific API scripts
    for (let i = 0; i < filessource.length; i++) {
      let filename = filessource[i];
      let path = baseUrl + 'src/' + filename;
      await ns.scriptKill(filename, 'home');
      await ns.rm(filename);
      await ns.sleep(200);
      ns.tprint(`[${localeHHMMSS()}] Trying to download ${path}`);
      await ns.wget(path + '?ts=' + new Date().getTime(), filename);
      await ns.sleep(200);
      let srcpath = '/src/' + filename;
      await ns.mv('home',filename,srcpath);
      

    }
    //Cleans up old files
    for (let i = 0; i < oldfiles.length; i++) {
      let filename = oldfiles[i];
      await ns.rm(filename);
      await ns.sleep(200);
    }
    await ns.sleep(100);
    await ns.rm('api/singularity-tor.js');
    await ns.sleep(100);
    await ns.rm('api/singularity-exes.js');
    await ns.sleep(100);
    ns.tprint('Calling auto-exec.js...');
    ns.tprint('In auto-control.js - modify sub-modules from executing by altering constants under the //CONSTANTS section');
    ns.exec('auto-exec.js', 'home', 1);

}

function localeHHMMSS(ms = 0) {
  if (!ms) {
    ms = new Date().getTime()
  }

  return new Date(ms).toLocaleTimeString()
}