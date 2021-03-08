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
import { Injectable } from "../Injector";
import { CommandExecutor } from "./CommandExecutor";
import { PermissionsManager } from "./PermissionsManager";
import { POSIXAuthority } from "./POSIXAuthority";
import { SystemService, SystemServiceAction } from "srvmgr-api";
import { Dictionary } from "acts-util-core";

@Injectable
export class SystemServicesManager
{
    constructor(private commandExecutor: CommandExecutor, private permissionsManager: PermissionsManager)
    {
    }

    //Public methods
    public DisableService(serviceName: string, session: POSIXAuthority)
    {
        return this.ExecuteServiceAction(serviceName, "disable", session);
    }

    public EnableService(serviceName: string, session: POSIXAuthority)
    {
        return this.ExecuteServiceAction(serviceName, "enable", session);
    }

    public async FetchServicesSnapshot(session: POSIXAuthority)
    {
        const unitFiles = await this.ListUnitFiles(session);
        const units = await this.ListUnits(session);

        const result: SystemService[] = [];
        const dict: Dictionary<SystemService> = {};
        for (const unitFile of unitFiles)
        {
            const service = {
                name: unitFile.name,
                enabled: unitFile.enabled,
                running: false,
                loaded: false,
            };
            result.push(service);
            dict[unitFile.name] = service;
        }

        for (const unit of units)
        {
            const service = dict[unit.name];
            if(service === undefined)
            {
                result.push({
                    name: unit.name,
                    enabled: await this.IsServiceEnabled(unit.name, session),
                    running: unit.running,
                    loaded: true,
                });
            }
            else
            {
                service.running = unit.running;
                service.loaded = unit.loaded;
            }
        }
        return result;
    }

    public async QueryServiceInfo(serviceName: string, session: POSIXAuthority): Promise<SystemService | undefined>
    {
        return {
            name: serviceName,
            enabled: await this.IsServiceEnabled(serviceName, session),
            running: await this.IsServiceActive(serviceName, session),
            loaded: true, //TODO: not correct
        };
    }

    public async QueryStatus(serviceName: string, session: POSIXAuthority)
    {
        const result = await this.commandExecutor.ExecuteCommandWithExitCode(["systemctl", "status", serviceName + ".service", "--lines", "100"], this.permissionsManager.Sudo(session.uid));
        return result.stdout;
    }

    public RestartService(serviceName: string, session: POSIXAuthority)
    {
        return this.ExecuteServiceAction(serviceName, "restart", session);
    }

    public StartService(serviceName: string, session: POSIXAuthority)
    {
        return this.ExecuteServiceAction(serviceName, "start", session);
    }

    public StopService(serviceName: string, session: POSIXAuthority)
    {
        return this.ExecuteServiceAction(serviceName, "stop", session);
    }

    //Private methods
    private async ExecuteServiceAction(serviceName: string, action: SystemServiceAction, session: POSIXAuthority)
    {
        await this.commandExecutor.ExecuteCommand(["systemctl", action, serviceName + ".service"], this.permissionsManager.Sudo(session.uid));
    }

    private async ListUnitFiles(session: POSIXAuthority)
    {
        const result = await this.commandExecutor.ExecuteCommand(["systemctl", "list-unit-files", "--all", "--type", "service"], session);
        const lines = result.stdout.split("\n");

        lines.Remove(0); //column names only
        while(!lines[lines.length -1]) //remove empty lines
            lines.Remove(lines.length-1);
        lines.Remove(lines.length-1); //remove sum of found unit files

        return lines.Values().Filter(line => !!line).Map(line => {
            const parts = line.trim().split(/[ \t]+/);
            if(parts.length === 3)
            {
                const name = parts[0];
                return {
                    name: name.substr(0, name.length - ".service".length),
                    enabled: parts[1] === "enabled"
                };
            }

            throw new Error("Couldn't parse line: " + line);
        });
    }

    private async ListUnits(session: POSIXAuthority)
    {
        const result = await this.commandExecutor.ExecuteCommand(["systemctl", "list-units", "--all", "--type", "service", "--no-legend"], session);
        const lines = result.stdout.split("\n");

        return lines.Values().Filter(line => !!line).Map(line => {
            const parts = line.trim().match(/^([a-zA-Z0-9\-_@.\\]+)\.service[ \t]+(loaded|not-found|masked)[ \t]+(active|inactive|failed|activating)[ \t]+[a-z]+.*$/);
            if(parts !== null)
            {
                const serviceName = parts[1];
                const active = !(parts[3] === "inactive");

                return {
                    name: serviceName,
                    loaded: parts[2] === "loaded",
                    running: active
                };
            }
            
            throw new Error("Couldn't parse line: " + line);
        });
    }

    private async IsServiceEnabled(serviceName: string, session: POSIXAuthority)
    {
        const enabled = await this.commandExecutor.ExecuteCommandWithExitCode(["systemctl", "is-enabled", serviceName + ".service"], session);
        return enabled.exitCode === 0;
    }

    private async IsServiceActive(serviceName: string, session: POSIXAuthority)
    {
        const enabled = await this.commandExecutor.ExecuteCommandWithExitCode(["systemctl", "is-active", serviceName + ".service"], session);
        return enabled.exitCode === 0;
    }
}