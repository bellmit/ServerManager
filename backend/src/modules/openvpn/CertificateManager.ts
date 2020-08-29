/**
 * ServerManager
 * Copyright (C) 2020 Amir Czwink (amir130@hotmail.de)
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
import * as fs from "fs";

import { Injectable } from "../../Injector";
import { CommandExecutor, CommandOptions } from "../../services/CommandExecutor";
import { POSIXAuthority, PermissionsManager } from "../../services/PermissionsManager";
import { OpenVPNApi } from "srvmgr-api";
import { BashVarsParser } from "../../Model/BashVarsParser";

@Injectable
export class CertificateManager
{
    constructor(private commandExecutor: CommandExecutor, private permissionsManager: PermissionsManager)
    {
    }

    //Public methods
    public async CreateCa(data: OpenVPNApi.AddCA.RequestData, session: POSIXAuthority)
    {
        const cadir = "/etc/openvpn/" + data.name;

        const sudo = this.permissionsManager.Sudo(session.uid);
        await this.commandExecutor.ExecuteCommand(["make-cadir", cadir], sudo);

        const commandOptions: CommandOptions = {
            gid: sudo.gid,
            uid: sudo.uid,
            workingDirectory: cadir,
        };

        const children = fs.readdirSync(cadir, "utf-8").filter(child => child.endsWith(".cnf"));
        children.sort();

        await this.commandExecutor.ExecuteCommand(["ln", "-s", children[children.length - 1], "openssl.cnf"], commandOptions);

        this.WriteVars(data);

        const commandOptionsWithEnv: CommandOptions = {
            gid: sudo.gid,
            uid: sudo.uid,
            workingDirectory: cadir,
            environmentVariables: await this.ReadVars(data.name, commandOptions),
        };

        await this.commandExecutor.ExecuteCommand(["./clean-all"], commandOptionsWithEnv);
        await this.ExecCertificateCreationCommand(["./build-ca", "--batch"], commandOptionsWithEnv);
        await this.ExecCertificateCreationCommand(["./build-key-server", "--batch", "server"], commandOptionsWithEnv, data.domainName);

        await this.commandExecutor.ExecuteCommand(["openvpn", "--genkey", "--secret", cadir + "/keys/ta.key"], commandOptions);

        return this.commandExecutor.CreateChildProcess(["./build-dh"], commandOptionsWithEnv).pid;
    }

    //Private methods
    private async ExecCertificateCreationCommand(command: string[], options: CommandOptions, commonName?: string)
    {
        const clonedOptions = options.DeepClone();
        if(commonName)
            clonedOptions.environmentVariables!["KEY_CN"] = commonName;

        await this.commandExecutor.ExecuteCommand(command, clonedOptions);
    }

    private async ReadVars(caName: string, commandOptionsWithWorkingDir: CommandOptions)
    {
        const subCommand = ["source", "/etc/openvpn/" + caName + "/vars", "&&", "env"];
        const result = await this.commandExecutor.ExecuteCommand(["env", "-i", "bash", "-c", "'" + subCommand.join(" ") + "'"], commandOptionsWithWorkingDir);
        return result.stdout.split("\n").Values()
            .Map(x => x.split("="))
            .Filter(x => x.length === 2)
            .ToDictionary(x => x[0], x => x[1]);
    }

    private WriteVars(data: OpenVPNApi.AddCA.RequestData)
    {
        const varsPath = "/etc/openvpn/" + data.name + "/vars";
        const input = fs.readFileSync(varsPath, "utf-8");

        const parser = new BashVarsParser();
        const lines = parser.Parse(input);
        for (const line of lines)
        {
            if(typeof line === "string")
                continue;

            switch(line.key)
            {
                case "KEY_SIZE":
                    line.value = data.keySize.toString();
                    break;
                case "KEY_COUNTRY":
                    line.value = data.countryCode;
                    break;
                case "KEY_PROVINCE":
                    line.value = data.province;
                    break;
                case "KEY_CITY":
                    line.value = data.city;
                    break;
                case "KEY_ORG":
                    line.value = data.organization;
                    break;
                case "KEY_EMAIL":
                    line.value = data.email;
                    break;
                case "KEY_OU":
                    line.value = data.organizationalUnit;
                    break;
                case "KEY_NAME":
                    line.value = data.name;
                    break;
            }
        }

        const dataToWrite = parser.ToString(lines);
        fs.writeFileSync(varsPath, dataToWrite, "utf-8");
    }
}