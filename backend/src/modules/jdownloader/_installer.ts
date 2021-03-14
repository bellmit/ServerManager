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
import * as fs from "fs";
import * as path from "path";

import { Injectable } from "acts-util-node";
import { ModuleInstaller } from "../../Model/ModuleInstaller";
import { POSIXAuthority } from "../../services/POSIXAuthority";
import { CommandExecutor, CommandOptions } from "../../services/CommandExecutor";
import { jdDir, userAndGroupName } from "./shared";
import { FileSystemService } from "../../services/FileSystemService";
import { UserAndPrimaryGroupService } from "../../services/UserAndPrimaryGroupService";
import { SystemServicesManager } from "../../services/SystemServicesManager";

@Injectable
class JDownloaderInstaller implements ModuleInstaller
{
    constructor(private commandExecutor: CommandExecutor, private userAndPrimaryGroupService: UserAndPrimaryGroupService, private fsService: FileSystemService, private systemServicesManager: SystemServicesManager)
    {
    }

    //Public methods
    public async Install(session: POSIXAuthority): Promise<boolean>
    {
        const authority = await this.userAndPrimaryGroupService.CreateUserAndGroup(userAndGroupName, session);

        fs.mkdirSync(jdDir);
        fs.chownSync(jdDir, authority.uid, authority.gid);
        
        const cmdOptions: CommandOptions = { gid: authority.gid, uid: authority.uid, workingDirectory: jdDir };
        await this.commandExecutor.ExecuteCommand(["wget", "http://installer.jdownloader.org/JDownloader.jar"], cmdOptions);
        await this.commandExecutor.ExecuteCommand(["java", "-Djava.awt.headless=true", "-jar", "JDownloader.jar", "-norestart"], cmdOptions);

        fs.writeFileSync("/etc/systemd/system/jdownloader.service", `[Unit]
Description=JDownloader Service
Wants=network.target
After=network.target
    
[Service]
Environment=JD_HOME=${jdDir}
Type=simple
RemainAfterExit=yes
ExecStart=/usr/bin/java -Djava.awt.headless=true -jar /srv/jdownloader/JDownloader.jar
User=${userAndGroupName}
Group=${userAndGroupName}
    
[Install]
WantedBy=multi-user.target`
        , "utf-8");

        return true;
    }

    public async IsModuleInstalled(session: POSIXAuthority): Promise<boolean>
    {
        return fs.existsSync(jdDir);
    }

    public async Uninstall(session: POSIXAuthority): Promise<boolean>
    {
        const serviceName = "jdownloader";
        const info = await this.systemServicesManager.QueryServiceInfo(serviceName, session);
        if(info !== undefined)
        {
            if(info.running)
                await this.systemServicesManager.StopService(serviceName, session);
            if(info.enabled)
                await this.systemServicesManager.DisableService(serviceName, session);
            await this.fsService.DeleteFile("/etc/systemd/system/jdownloader.service", session);
        }

        const children = await this.fsService.ListDirectoryContents(jdDir, session);
        await children.Values().Filter(p => p !== "Downloads").Map(p => this.fsService.RemoveDirectoryRecursive(path.join(jdDir, p), session)).PromiseAll();
        if(await this.fsService.Exists(path.join(jdDir, "Downloads"), session))
            await this.fsService.RemoveDirectoryIfEmpty(path.join(jdDir, "Downloads"), session);
        await this.fsService.RemoveDirectoryIfEmpty(jdDir, session);

        await this.userAndPrimaryGroupService.DeleteUserAndGroup(userAndGroupName, session);

        return true;
    }
}

export default JDownloaderInstaller;