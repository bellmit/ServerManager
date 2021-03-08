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
import { Processes } from "srvmgr-api";

import { Injectable } from "../Injector";
import { CommandExecutor } from "./CommandExecutor";
import { POSIXAuthority } from "./POSIXAuthority";

@Injectable
export class ProcessesManager
{
    constructor(private commandExecutor: CommandExecutor)
    {
    }

    //Public methods
    public async QueryProcessesSnapshot(session: POSIXAuthority)
    {
        const matchRegEx = /^[ \t]*(\d+)[ \t]+(\d+)[ \t]+(\d+)[ \t]+(\d+\.\d+)[ \t]+(\d+)[ \t]+/;
        const result = await this.commandExecutor.ExecuteCommand(["ps", "awwxo", "pid,ppid,uid,%cpu,rss,comm,args"], session);

        const lines = result.stdout.split("\n");

        const headerLine = lines[0];
        lines.Remove(0);
        const namePos = headerLine.indexOf("COMMAND");
        const argsPos = headerLine.lastIndexOf("COMMAND");

        const processes = [];
        for (const line of lines)
        {
            const match = line.match(matchRegEx);
            if(match === null)
                continue;

            const process: Processes.ProcessInfo = {
                pid: parseInt(match[1]),
                parent_pid: parseInt(match[2]),
                uid: parseInt(match[3]),
                cpuUsage: parseFloat(match[4]),
                memUsageKb: parseInt(match[5]),
                name: line.substring(namePos, argsPos).TrimRight(" \t"),
                commandLine: line.substr(argsPos),
            };
            processes.push(process);
        }

        return processes;
    }
}