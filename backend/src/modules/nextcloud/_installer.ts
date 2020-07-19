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
import { ModuleInstaller } from "../../Model/ModuleInstaller";
import { POSIXAuthority, PermissionsManager } from "../../services/PermissionsManager";
import { CommandExecutor, CommandOptions } from "../../services/CommandExecutor";
import { SystemServicesManager } from "../../services/SystemServicesManager";
import { ApacheManager } from "../apache/ApacheManager";
import { VirtualHost } from "../apache/VirtualHost";
import { NotificationsManager } from "../../services/NotificationsManager";

@Injectable
class NextcloudInstaller implements ModuleInstaller
{
    constructor(private commandExecutor: CommandExecutor, private permissionsManager: PermissionsManager, private apacheManager: ApacheManager,
        private systemServicesManager: SystemServicesManager, private notificationsManager: NotificationsManager)
    {
    }

    public async Install(session: POSIXAuthority): Promise<boolean>
    {
        const sudo = this.permissionsManager.Sudo(session.uid);
        const commandArgs: CommandOptions = { uid: sudo.uid, gid: sudo.gid, workingDirectory: "/var/www" };
        const commands = [
            "wget https://download.nextcloud.com/server/releases/latest.zip",
            "unzip latest.zip",
            "rm latest.zip",
            "chown -R www-data:www-data /var/www/nextcloud"
        ];
        for (const command of commands)
        {
            await this.commandExecutor.ExecuteCommand(command.split(" "), commandArgs);
        }

        const vh = VirtualHost.Default("*:80", this.notificationsManager.QuerySettings().email);
        vh.properties.documentRoot = "/var/www/nextcloud";
        
        await this.apacheManager.CreateSite("nextcloud", vh);
        await this.apacheManager.EnableSite("nextcloud", sudo);

        await this.systemServicesManager.RestartService("apache2", sudo);

        console.log("NEXTCLOUD INSTALL finished");

        return true;
    }

    public async IsModuleInstalled(session: POSIXAuthority): Promise<boolean>
    {
        return fs.existsSync("/var/www/nextcloud");
    }
}

export default NextcloudInstaller;