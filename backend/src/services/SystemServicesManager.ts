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
import { Injectable } from "../Injector";
import { CommandExecutor } from "./CommandExecutor";
import { POSIXAuthority, PermissionsManager } from "./PermissionsManager";
import { SystemService, SystemServiceAction } from "srvmgr-api";

@Injectable
export class SystemServicesManager
{
    constructor(private commandExecutor: CommandExecutor, private permissionsManager: PermissionsManager)
    {
    }

    //Public methods
    public async FetchServicesSnapshot(session: POSIXAuthority)
    {
        const result = await this.commandExecutor.ExecuteCommand(["systemctl", "list-unit-files", "--all", "--type", "service"], session);
        const lines = result.stdout.split("\n");

        const services: SystemService[] = [];

        lines.Remove(0); //column names only
        for (let line of lines)
        {
            if(!line)
                break;
            const parts = line.trim().match(/^([a-z]+)\.service[ \t]+([a-z]+)$/);
            if(parts !== null)
            {
                const serviceName = parts[1];
                const active = await this.commandExecutor.ExecuteCommandWithExitCode(["systemctl", "is-active", serviceName], session);
                services.push({ name: parts[1], running: active.exitCode === 0});
            }
        }

        return services;
    }

    public StartService(serviceName: string, session: POSIXAuthority)
    {
        return this.ExecuteServiceAction(serviceName, "start", session);
    }

    public StopService(serviceName: string, session: POSIXAuthority)
    {
        return this.ExecuteServiceAction(serviceName, "stop", session);
    }

    public RestartService(serviceName: string, session: POSIXAuthority)
    {
        return this.ExecuteServiceAction(serviceName, "restart", session);
    }

    //Private methods
    private async ExecuteServiceAction(serviceName: string, action: SystemServiceAction, session: POSIXAuthority)
    {
        const res = await this.commandExecutor.ExecuteCommand(["service", serviceName, action], this.permissionsManager.Sudo(session.uid));
    }
}