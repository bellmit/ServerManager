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
import { POSIXAuthority } from "../../services/PermissionsManager";
import { BashVarsParser, KeyValuePair } from "../../Model/BashVarsParser";
import { Key } from "readline";

@Injectable
export class CertificateManager
{
    constructor(private commandExecutor: CommandExecutor)
    {
    }

    //Public methods
    public async CreateCa(name: string, session: POSIXAuthority)
    {
        const cadir = "/etc/openvpn/" + name;

        await this.commandExecutor.ExecuteCommand(["make-cadir", cadir], session);

        const commandOptions: CommandOptions = {
            gid: session.gid,
            uid: session.uid,
            workingDirectory: cadir,
        };

        const children = fs.readdirSync(cadir, "utf-8").filter(child => child.endsWith(".cnf"));
        children.sort();

        await this.commandExecutor.ExecuteCommand(["ln", "-s", children[children.length - 1], "openssl.cnf"], commandOptions);

        const commandOptionsWithEnv: CommandOptions = {
            gid: session.gid,
            uid: session.uid,
            workingDirectory: cadir,
            environmentVariables: await this.ReadVars(name, commandOptions),
        };

        await this.commandExecutor.ExecuteCommand(["./clean-all"], commandOptionsWithEnv);
        await this.commandExecutor.ExecuteCommand(["./build-ca"], commandOptionsWithEnv);
        await this.commandExecutor.ExecuteCommand(["./build-key-server", "server"], commandOptionsWithEnv);

        await this.commandExecutor.ExecuteCommand(["./build-dh"], commandOptionsWithEnv);
    }

    //Private methods
    private async ReadVars(caName: string, commandOptionsWithWorkingDir: CommandOptions)
    {
        const subCommand = ["source", "/etc/openvpn/" + caName + "/vars", "&&", "env"];
        const result = await this.commandExecutor.ExecuteCommand(["env", "-i", "bash", "-c", "'" + subCommand.join(" ") + "'"], commandOptionsWithWorkingDir);
        return result.stdout.split("\n").Values()
            .Map(x => x.split("="))
            .Filter(x => x.length === 2)
            .ToDictionary(x => x[0], x => x[1]);
    }
}