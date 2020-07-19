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

import { Injectable } from "../../Injector";
import { ConfigManager } from "../../services/ConfigManager";
import { JDownloader } from "srvmgr-api";
import { CommandExecutor, CommandOptions } from "../../services/CommandExecutor";
import { UsersService } from "../../services/UsersService";
import { jdDir, userAndGroupName } from "./shared";

const CONFIG_KEY = "jdownloader";

@Injectable
export class JDownloaderManager
{
    constructor(private configManager: ConfigManager, private commandExecutor: CommandExecutor, private usersService: UsersService)
    {
    }

    //Public methods
    public async Login()
    {
        const uid = this.usersService.GetUserByName(userAndGroupName)!.uid;
        const gid = this.usersService.GetGroupByName(userAndGroupName)!.gid;

        const settings = this.QuerySettings();

        const cmdOptions: CommandOptions = { gid, uid, workingDirectory: jdDir };
        const childProcess = this.commandExecutor.ExecuteAsyncCommand(["java", "-Djava.awt.headless=true", "-jar", "JDownloader.jar", "-norestart", "-myjd"], cmdOptions);
        childProcess.stdin.write("y\n");
        childProcess.stdin.write(settings.userName + "\n");
        childProcess.stdin.write(settings.password + "\n");

        setTimeout(() => childProcess.kill("SIGINT"), 60 * 1000);
    }

    public QuerySettings()
    {
        let settings = this.configManager.Get<JDownloader.MyJDownloaderCredentials>(CONFIG_KEY);
        if(settings === undefined)
        {
            settings = {
                userName: "",
                password: "",
            };
        }

        return settings;
    }

    public SetSettings(settings: JDownloader.MyJDownloaderCredentials)
    {
        this.configManager.Set(CONFIG_KEY, settings);

        this.Login();
    }
}