/**
 * ServerManager
 * Copyright (C) 2020-2021 Amir Czwink (amir130@hotmail.de)
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * 
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 * 
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 * */
import { promises as fs } from "fs";

import { OpenVPNApi } from "srvmgr-api";
import { Injectable } from "../../Injector";
import { CommandExecutor, CommandOptions } from "../../services/CommandExecutor";
import { PermissionsManager } from "../../services/PermissionsManager";
import { POSIXAuthority } from "../../services/POSIXAuthority";

@Injectable
export class OpenVPNManager
{
    constructor(private commandExecutor: CommandExecutor, private permissionsManager: PermissionsManager)
    {
    }
    
    //Public methods
    public async AddConfig(data: OpenVPNApi.AddConfig.RequestData, session: POSIXAuthority)
    {
        const sudo = this.permissionsManager.Sudo(session.uid);

        const serverDir = "/etc/openvpn/server/" + data.name;
        await fs.mkdir(serverDir);

        const commandOptions: CommandOptions = {
            gid: sudo.gid,
            uid: sudo.uid,
            workingDirectory: serverDir,
        };
        await this.commandExecutor.ExecuteCommand(["openvpn", "--genkey", "--secret", serverDir + "/ta.key"], commandOptions);

        const config = `
dev tun
topology subnet
keepalive 10 120
user nobody
group nogroup
persist-key
persist-tun
remote-cert-tls client

ifconfig-pool-persist ./server/${data.name}/ipp.txt
tls-auth ./server/${data.name}/ta.key 0
status ./server/${data.name}/openvpn-status.log
log /var/log/openvpn.log

server ${data.virtualServerAddress} ${data.virtualServerSubnetMask}
port ${data.port}
proto ${data.protocol}
cipher ${data.cipher}
auth ${data.authenticationAlgorithm}
verb ${data.verbosity}

ca ${data.certKeyFiles.caCertPath}
cert ${data.certKeyFiles.certPath}
key ${data.certKeyFiles.keyPath}
dh ${data.certKeyFiles.dhPath}
        `;
        //push "route dnsserveraddr dnsserversubnetmask"

        await fs.writeFile("/etc/openvpn/" + data.name + ".conf", config, "utf-8");
    }
}