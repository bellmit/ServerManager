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
import { Injectable } from "acts-util-node";
import { CommandExecutor, CommandOptions } from "../../services/CommandExecutor";
import { PermissionsManager } from "../../services/PermissionsManager";
import { POSIXAuthority } from "../../services/POSIXAuthority";
import { SystemServicesManager } from "../../services/SystemServicesManager";
import { FileSystemService } from "../../services/FileSystemService";
import { CertKeyFiles, OpenVPNServerConfig } from "srvmgr-api/dist/Model/OpenVPN";
import { ConfigParser, KeyValueEntry } from "../../core/ConfigParser";
import { ConfigModel } from "../../core/ConfigModel";
import { ConfigWriter } from "../../core/ConfigWriter";

@Injectable
export class OpenVPNManager
{
    constructor(private commandExecutor: CommandExecutor, private permissionsManager: PermissionsManager,
        private systemServicesManager: SystemServicesManager, private fsService: FileSystemService)
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

        await this.systemServicesManager.Reload(session);
    }

    public async DeleteConfig(configName: string, session: POSIXAuthority)
    {
        const serverDir = "/etc/openvpn/server/" + configName;
        await this.fsService.RemoveDirectoryRecursive(serverDir, session);
        await this.fsService.DeleteFile("/etc/openvpn/" + configName + ".conf", session);
        await this.systemServicesManager.Reload(session);
    }

    public async GenerateClientConfig(configName: string, remoteAddress: string, clientCertKeyPaths: CertKeyFiles, dnsRedirectAddress: string | undefined, session: POSIXAuthority)
    {
        const cfg = await this.ReadServerConfig(configName, session);

        const caCertData = await this.fsService.ReadTextFile(clientCertKeyPaths.caCertPath, session);
        const certData = await this.fsService.ReadTextFile(clientCertKeyPaths.certPath, session);
        const keyData = await this.fsService.ReadTextFile(clientCertKeyPaths.keyPath, session);
        const taData = await this.fsService.ReadTextFile("/etc/openvpn/server/" + configName + "/ta.key", session);

        const dns = dnsRedirectAddress === undefined ? "" : 
`
redirect-gateway def1
script-security 2
dhcp-option DNS ${dnsRedirectAddress}
`;

return `
client
dev tun
resolv-retry infinite
nobind
persist-key
persist-tun
remote-cert-tls server
key-direction 1

proto ${cfg.protocol}
remote ${remoteAddress} ${cfg.port}
cipher ${cfg.cipher}
verb ${cfg.verbosity}
auth ${cfg.authenticationAlgorithm}
auth-nocache
key-direction 1

${dns}

<ca>
${caCertData}
</ca>
<cert>
${certData}
</cert>
<key>
${keyData}
</key>
<tls-auth>
${taData}
</tls-auth>
`;
    }

    public async ListConfigs(session: POSIXAuthority)
    {
        const children = await this.fsService.ListDirectoryContents("/etc/openvpn", session);
        return children.Values().Filter(child => child.endsWith(".conf")).Map(child => child.substr(0, child.length - 5));
    }

    public async QueryCADirName(configName: string, session: POSIXAuthority)
    {
        function ExtractCADirName(path: string)
        {
            const prefix = "/etc/easy-rsa/";
            if(path.startsWith(prefix))
            {
                const part = path.substring(prefix.length);
                const idx = part.indexOf("/");
                return part.substr(0, idx);
            }
            return undefined;
        }

        const cfg = await this.ReadServerConfig(configName, session);
        for (const key in cfg.certKeyFiles)
        {
            if (Object.prototype.hasOwnProperty.call(cfg.certKeyFiles, key))
            {
                const path = (cfg.certKeyFiles as any)[key];
                const ex = ExtractCADirName(path);
                if(ex)
                    return ex;
            }
        }

        throw new Error("Couldn't find ca dir name");
    }

    public async ReadServerConfig(configName: string, session: POSIXAuthority): Promise<OpenVPNServerConfig>
    {
        const parsed = await this.ParseConfig(configName);
        const mdl = new ConfigModel(parsed);

        const data = mdl.WithoutSectionAsDictionary() as any;
        const server = data.server.split(" ");

        return {
            authenticationAlgorithm: data.auth,
            certKeyFiles: {
                caCertPath: data.ca,
                certPath: data.cert,
                dhPath: data.dh,
                keyPath: data.key,
            },
            cipher: data.cipher,
            name: configName,
            port: data.port,
            protocol: data.proto,
            verbosity: data.verb,
            virtualServerAddress: server[0],
            virtualServerSubnetMask: server[1],
        };
    }

    public async UpdateConfig(configName: string, config: OpenVPNServerConfig)
    {
        const parsed = await this.ParseConfig(configName);
        const mdl = new ConfigModel(parsed);
        mdl.SetProperties("", {
            auth: config.authenticationAlgorithm,
            cipher: config.cipher,
            port: config.port,
            proto: config.protocol,
            verb: config.verbosity,
            server: config.virtualServerAddress + " " + config.virtualServerSubnetMask,

            ca: config.certKeyFiles.caCertPath,
            cert: config.certKeyFiles.certPath,
            dh: config.certKeyFiles.dhPath,
            key: config.certKeyFiles.keyPath
        });

        class OpenVPNConfigWriter extends ConfigWriter
        {
            protected KeyValueEntryToString(entry: KeyValueEntry)
            {
                return entry.key + " " + entry.value;
            }
        }

        const writer = new OpenVPNConfigWriter(x => x, "", "");
        await writer.Write("/etc/openvpn/" + configName + ".conf", parsed);
    }

    //Private methods
    private ParseConfig(configName: string)
    {
        class OpenVPNConfigParser extends ConfigParser
        {
            constructor()
            {
                super(["#"], {})
            }

            protected FileNameMatchesIncludeDir(fileName: string): boolean
            {
                throw new Error("Method not implemented.");
            }

            protected ParseIncludeDir(line: string): string | undefined
            {
                return undefined;
            }

            protected ParseKeyValue(line: string): KeyValueEntry
            {
                const parts = line.split(" ");
                if(parts.length === 1)
                    return {
                        type: "KeyValue",
                        key: parts[0],
                        value: null
                    };
                if(parts.length === 2)
                    return {
                        type: "KeyValue",
                        key: parts[0],
                        value: parts[1],
                    };
                else if(parts.length === 3)
                    return {
                        type: "KeyValue",
                        key: parts[0],
                        value: parts[1] + " " + parts[2]
                    }
                throw new Error("Can't parse line: " + line);
            }
        }

        const cfgParser = new OpenVPNConfigParser();
        return cfgParser.Parse("/etc/openvpn/" + configName + ".conf");
    }
}