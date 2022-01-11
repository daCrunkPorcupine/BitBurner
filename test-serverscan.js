/** @param {import(".").NS } ns */
export async function main(ns) {
    var playerServers = ['home', 'Server1'];
    var serverChecked = [];
    var checkList = [];

    async function ServersScan(ns, target) {
        var servers1 = await ns.scan(target);
        for (var server in servers1) {
            if (!checkList.includes(servers1[server])) {
                checkList.push(servers1[server]);
            }
        }
        serverChecked.push(target);
        var flag = true;
        while (flag) {
            flag = false;
            for (var i = 0; i < checkList.length; i++) {
                var servers = await ns.scan(checkList);
                if (!serverChecked.includes(checkList)) {
                    serverChecked.push(checkList);
                }
                for (var server in servers) {
                    if (!checkList.includes(servers[server])) {
                        checkList.push(servers[server]);
                    }
                }
            }
        }
        // remove player servers from serverChecked
        for (var server in playerServers) {
            for (var i = 0; i < serverChecked.length; i++) {
                if (serverChecked == playerServers[server]) {
                    serverChecked.splice(i, 1);
                    i--;
                }
            }
        }
    }

    async function printArray(ns, serverList) {
        for (var server in serverList) {
            ns.print(serverList[server] + "\n");
            ns.tprint(serverList[server] + "\n");
        }
    }

    await ServersScan(ns, 'home');
    await printArray(ns, serverChecked);
}