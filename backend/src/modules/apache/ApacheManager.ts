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

import { Apache } from "srvmgr-api";
import { Injectable } from "../../Injector";
import { CommandExecutor } from "../../services/CommandExecutor";
import { PermissionsManager, POSIXAuthority } from "../../services/PermissionsManager";
import { VirtualHost } from "./VirtualHost";
import { ConfigParser } from "./ConfigParser";

@Injectable
export class ApacheManager
{
    constructor(private commandExecutor: CommandExecutor, private permissionsManager: PermissionsManager)
    {
    }

    //Public methods
    public CreateSite(name: string, vHost: VirtualHost)
    {
        this.SetSite(name, vHost);
    }

    public async DisableModule(name: string, session: POSIXAuthority)
    {
        await this.commandExecutor.ExecuteCommand(["a2dismod", name], this.permissionsManager.Sudo(session.uid));
    }

    public async DisableSite(name: string, session: POSIXAuthority)
    {
        await this.commandExecutor.ExecuteCommand(["a2dissite", name], this.permissionsManager.Sudo(session.uid));
    }

    public async EnableModule(name: string, session: POSIXAuthority)
    {
        await this.commandExecutor.ExecuteCommand(["a2enmod", name], this.permissionsManager.Sudo(session.uid));
    }

    public async EnableSite(name: string, session: POSIXAuthority)
    {
        await this.commandExecutor.ExecuteCommand(["a2ensite", name], this.permissionsManager.Sudo(session.uid));
    }

    public async QueryModules(session: POSIXAuthority)
    {
        return this.QueryEntities("mods-available", "-m", session);
    }

    public QueryPorts(session: POSIXAuthority)
    {
        return fs.readFileSync("/etc/apache2/ports.conf", "utf-8");
    }

    public QuerySite(siteName: string, session: POSIXAuthority)
    {
        const data = fs.readFileSync("/etc/apache2/sites-available/" + siteName + ".conf", "utf-8");

        const cp = new ConfigParser(data);

        return cp.Parse();
    }

    public async QuerySites(session: POSIXAuthority)
    {
        return this.QueryEntities("sites-available", "-s", session);
    }

    public SetSite(siteName: string, vHost: VirtualHost)
    {
        fs.writeFileSync("/etc/apache2/sites-available/" + siteName + ".conf", vHost.ToConfigString(), "utf-8");
    }

    //Private methods
    private async QueryEntities(dir: string, argSwitch: string, session: POSIXAuthority)
    {
        const files = fs.readdirSync("/etc/apache2/" + dir + "/");
        const entities: Apache.EntityOverviewInfo[] = [];
        for (const fileName of files)
        {
            if(!fileName.endsWith(".conf"))
                continue;

            const modName = fileName.substring(0, fileName.lastIndexOf("."));
            const res = await this.commandExecutor.ExecuteCommandWithExitCode(["a2query", argSwitch, fileName], session);

            let enabled = res.exitCode === 0; //0 if enabled, 1 if not
            entities.push({ name: modName, enabled });
        }
        return entities;
    }
}