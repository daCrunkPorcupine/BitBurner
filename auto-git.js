/** @param {import(".").NS } ns */
//Downloads all necessary files from GITHUB
//https://github.com/daCrunkPorcupine/BitBurner
//
//FU Cliff

//MASTER BRANCH
const baseUrl = 'https://raw.githubusercontent.com/daCrunkPorcupine/BitBurner/master/';
//DEV BRANCH
const baseUrl = 'https://raw.githubusercontent.com/daCrunkPorcupine/BitBurner/master/';
const filesroot = [
  'auto-downloader.js',
]

export async function main(ns) {

  if (ns.getHostname() !== 'home') {
        throw new Exception('Run the script from home');
    }

    for (let i = 0; i < filesroot.length; i++) {
      let filename = filesroot[i];
      let path = baseUrl + filename;
      await ns.scriptKill(filename, 'home');
      await ns.rm(filename);
      await ns.sleep(200);
      ns.tprint(`[${localeHHMMSS()}] Trying to download ${path}`);
      await ns.wget(path + '?ts=' + new Date().getTime(), filename);
      await ns.sleep(200);
      ns.exec(filename,"home",1);
    }

}

function localeHHMMSS(ms = 0) {
  if (!ms) {
    ms = new Date().getTime()
  }

  return new Date(ms).toLocaleTimeString()
}