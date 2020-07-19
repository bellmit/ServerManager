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
import { POSIXAuthority } from "../../services/PermissionsManager";
import { CommandExecutor, CommandOptions } from "../../services/CommandExecutor";
import { UsersService } from "../../services/UsersService";
import { jdDir, userAndGroupName } from "./shared";

@Injectable
class JDownloaderInstaller implements ModuleInstaller
{
    constructor(private commandExecutor: CommandExecutor, private usersService: UsersService)
    {
    }

    public async Install(session: POSIXAuthority): Promise<boolean>
    {
        const uid = await this.CreateUser(session);
        const gid = await this.CreateGroup(session);

        fs.mkdirSync(jdDir);
        fs.chownSync(jdDir, uid, gid);
        
        const cmdOptions: CommandOptions = { gid, uid, workingDirectory: jdDir };
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

    //Private methods
    private async CreateGroup(session: POSIXAuthority)
    {
        await this.usersService.CreateGroup(userAndGroupName, session);

        let subscription: any = null;
        const userWaitPromise = new Promise<number>( resolve => {
            subscription = this.usersService.groups.Subscribe({next: () => {
                const result = this.usersService.GetGroupByName(userAndGroupName);

                if(result !== undefined)
                    resolve(result.gid);
            }});
        });

        const result = await userWaitPromise;
        subscription!.Unsubscribe();

        return result;
    }

    private async CreateUser(session: POSIXAuthority)
    {
        await this.usersService.CreateSystemUser(userAndGroupName, session);

        let subscription: any = null;
        const userWaitPromise = new Promise<number>( resolve => {
            subscription = this.usersService.users.Subscribe({next: () => {
                const result = this.usersService.GetUserByName(userAndGroupName);

                if(result !== undefined)
                    resolve(result.uid);
            }});
        });

        const result = await userWaitPromise;
        subscription!.Unsubscribe();

        return result;
    }
}

export default JDownloaderInstaller;