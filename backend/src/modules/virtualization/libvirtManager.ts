/**
 * ServerManager
 * Copyright (C) 2021 Amir Czwink (amir130@hotmail.de)
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

import { Injectable } from "acts-util-node";
import { VMs } from "srvmgr-api";
import { CommandExecutor } from "../../services/CommandExecutor";
import { POSIXAuthority } from "../../services/POSIXAuthority";

@Injectable
export class libvirtManager
{
    constructor(private commandExecutor: CommandExecutor)
    {
    }

    //Public methods
    public async ExecuteAction(vmName: string, action: "start" | "shutdown", session: POSIXAuthority)
    {
        await this.commandExecutor.ExecuteCommand(["sudo", "virsh", action, vmName], session);
    }

    public async ListVMs(session: POSIXAuthority)
    {
        const commands = ["sudo", "virsh", "list", "--all"];
        const result = await this.commandExecutor.ExecuteCommand(commands, session);
        const lines = result.stdout.split("\n");
        lines.splice(0, 2);
        lines.splice(lines.length - 2, 2);

        return lines.map(line => {
            const parts = line.split(/[ \t]+/);
            parts.Remove(0);
            const state = parts.slice(2).join(" ");
            const result: VMs.VMInfo = {
                name: parts[1],
                state: state as any
            };

            return result;
        });
    }
}