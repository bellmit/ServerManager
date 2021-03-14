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
import * as os from "os";

import { Injectable } from "acts-util-node";
import { JDownloader } from "srvmgr-api";
import { CommandExecutor, CommandOptions } from "../../services/CommandExecutor";
import { UsersManager } from "../../services/UsersManager";
import { UsersGroupsManager } from "../../services/UserGroupsManager";
import { FileSystemService } from "../../services/FileSystemService";
import { POSIXAuthority } from "../../services/POSIXAuthority";
import { jdDir, userAndGroupName } from "./shared";

const configPath = "/srv/jdownloader/cfg/org.jdownloader.api.myjdownloader.MyJDownloaderSettings.json";

@Injectable
export class JDownloaderManager
{
    constructor(private fileSystemService: FileSystemService, private commandExecutor: CommandExecutor,
        private usersManager: UsersManager, private groupsManager: UsersGroupsManager)
    {
    }

    //Public methods
    public async QuerySettings(session: POSIXAuthority): Promise<JDownloader.MyJDownloaderCredentials>
    {
        const myjd = await this.QueryMyJDownloaderSettings(session);
        
        return {
            userName: myjd.email,
            password: myjd.password,
        };
    }

    public async SetSettings(settings: JDownloader.MyJDownloaderCredentials, session: POSIXAuthority)
    {
        const myjd = await this.QueryMyJDownloaderSettings(session);
        myjd.email = settings.userName;
        myjd.password = settings.password;
        await this.fileSystemService.WriteTextFile(configPath, JSON.stringify(myjd), session);

        const uid = (await this.usersManager.GetUser(userAndGroupName))!.uid;
        const gid = (await this.groupsManager.GetGroup(userAndGroupName))!.gid;
        await this.fileSystemService.ChangeOwner(configPath, { uid, gid }, session);
    }

    //Private methods
    private async Login(session: POSIXAuthority)
    {
        const uid = (await this.usersManager.GetUser(userAndGroupName))!.uid;
        const gid = (await this.groupsManager.GetGroup(userAndGroupName))!.gid;

        const settings = await this.QuerySettings(session);

        const cmdOptions: CommandOptions = { gid, uid, workingDirectory: jdDir };
        const childProcess = this.commandExecutor.CreateChildProcess(["java", "-Djava.awt.headless=true", "-jar", "JDownloader.jar", "-norestart", "-myjd"], cmdOptions);
        childProcess.stdin.write("y\n");
        childProcess.stdin.write(settings.userName + "\n");
        childProcess.stdin.write(settings.password + "\n");

        setTimeout(() => childProcess.kill("SIGINT"), 60 * 1000);
    }
    
    private async QueryMyJDownloaderSettings(session: POSIXAuthority)
    {
        const exists = await this.fileSystemService.Exists(configPath, session);
        if(exists)
        {
            const data = await this.fileSystemService.ReadTextFile(configPath, session);
            const json = JSON.parse(data);

            return json;
        }

        return {
            email: "",
            password: "",
            autoconnectenabledv2: true,
            devicename: os.hostname(),
        };
    }
}