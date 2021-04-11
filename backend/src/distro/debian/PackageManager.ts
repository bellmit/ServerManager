/**
 * ServerManager
 * Copyright (C) 2019-2021 Amir Czwink (amir130@hotmail.de)
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
import { Module } from "srvmgr-api";

import { Injectable } from "acts-util-node";

import { DistroPackageManager } from "../../Model/DistroPackageManager";
import { CommandExecutor } from "../../services/CommandExecutor";
import { PermissionsManager } from "../../services/PermissionsManager";
import { POSIXAuthority } from "../../services/POSIXAuthority";

@Injectable
class DebianPackageManager implements DistroPackageManager
{
    constructor(private commandExecutor: CommandExecutor, private permissionsManager: PermissionsManager)
    {
    }

    //Public methods
    public async Install(moduleName: Module.ModuleName, session: POSIXAuthority): Promise<boolean>
    {
        const sudo = this.permissionsManager.Sudo(session.uid);
        await this.DoDebConfig(moduleName, sudo);

        await this.commandExecutor.ExecuteCommand(["apt", "-y", "install", this.MapModuleToPackageList(moduleName).join(" ")], sudo);
        return true;
    }

    public async IsModuleInstalled(moduleName: Module.ModuleName, session: POSIXAuthority): Promise<boolean>
    {
        const packages = this.MapModuleToPackageList(moduleName);
        const allPackages = await this.FetchInstalledPackages(session);
        for (let index = 0; index < packages.length; index++)
        {
            const packageName = packages[index];
            if(allPackages.indexOf(packageName) === -1)
                return false;
        }
        return true;
    }

    public async Uninstall(moduleName: Module.ModuleName, session: POSIXAuthority): Promise<boolean>
    {
        const sudo = this.permissionsManager.Sudo(session.uid);
        await this.commandExecutor.ExecuteCommand(["apt", "-y", "purge", this.MapModuleToPackageList(moduleName).join(" ")], sudo);
        await this.commandExecutor.ExecuteCommand(["apt", "-y", "autoremove"], sudo);
        return true;
    }

    //Private methods
    private async DoDebConfig(moduleName: Module.ModuleName, sudo: POSIXAuthority)
    {
        switch(moduleName)
        {
            case "samba":
                await this.SetDebConfValue("samba-common", "samba-common/dhcp", false, sudo);
                break;
        }
    }
    
    private async FetchInstalledPackages(session: POSIXAuthority)
    {
        const aptResult = await this.commandExecutor.ExecuteCommand(["apt", "list", "--installed"], session);
        const lines = aptResult.stdout.split("\n");

        const result = [];
        for (let index = 0; index < lines.length; index++)
        {
            const line = lines[index];
            const parts = line.split("/");
            if(parts.length > 0)
                result.push(parts[0].trim());
        }
        return result;
    }

    private MapModuleToPackageList(moduleName: Module.ModuleName)
    {
        switch(moduleName)
        {
            case "apache":
                return ["apache2"];
            case "jdownloader":
                return ["openjdk-11-jre-headless"];
            case "letsencrypt":
                return ["certbot"];
            case "mariadb":
                return ["mariadb-server"];
            case "nextcloud":
                return ["php", "php-mysql", "php-zip", "php-xml", "php-mbstring", "php-gd", "php-curl"];
            case "openvpn":
                return ["openvpn", "easy-rsa"];
            case "phpmyadmin":
                return ["phpmyadmin"];
            case "samba":
                return ["samba"];
        }
    }

    private async SetDebConfValue(packageName: string, key: string, value: boolean, sudo: POSIXAuthority)
    {
        const input = packageName + " " + key + " boolean " + value.toString();
        await this.commandExecutor.ExecuteCommand(["echo", '"' + input + '"', "|", "debconf-set-selections"], sudo);
    }
}

export default DebianPackageManager;