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
import { POSIXAuthority } from "./POSIXAuthority";
import { UsersGroupsManager } from "./UserGroupsManager";
import { UsersManager } from "./UsersManager";
import { ConfigModel } from "../core/ConfigModel";
import { ConfigParser, KeyValueEntry } from "../core/ConfigParser";
import { TimeUtil } from "acts-util-core";

class LoginDefsParser extends ConfigParser
{
    constructor()
    {
        super(["#"], {"no": false, "yes": true});
    }

    //Protected methods
    protected FileNameMatchesIncludeDir(fileName: string): boolean
    {
        return false;
    }

    protected ParseIncludeDir(line: string): string | undefined
    {
        return undefined;
    }

    protected ParseKeyValue(line: string): KeyValueEntry
    {
        const parts = line.split(/[ \t]+/);
        if(parts.length == 2)
            return {
                type: "KeyValue",
                key: parts[0],
                value: parts[1],
            };
        throw new Error("Unable to parse line: " + line);
    }
}

/**
 * This service is there for convenience and handles the coupling of users to its primary group.
 * When USERGROUPS_ENAB enabled in /etc/login.defs, then automatically a group is created (and deleted) when the user is.
 */
@Injectable
export class UserAndPrimaryGroupService
{
    constructor(private usersManager: UsersManager, private groupsManager: UsersGroupsManager)
    {
    }
    
    //Public methods
    public async CreateUserAndGroup(name: string, session: POSIXAuthority)
    {
        await this.usersManager.CreateSystemUser(name, session);

        const hasGroup = await this.IsUserAndGroupsEnabled();
        if(!hasGroup)
        {
            await this.groupsManager.CreateGroup(name, session);
        }

        const user = await this.usersManager.GetUser(name);

        return { uid: user!.uid, gid: await this.WaitForGroupAndExtractId(name) };
    }

    public async DeleteUserAndGroup(name: string, session: POSIXAuthority)
    {
        await this.usersManager.DeleteUser(name, session);
        const hasGroup = await this.IsUserAndGroupsEnabled();
        if(!hasGroup)
        {
            await this.groupsManager.DeleteGroup(name, session);
        }
    }

    //Private methods
    private async ParseLoginDefs()
    {
        const cfgParser = new LoginDefsParser();
        const entries = await cfgParser.Parse("/etc/login.defs");
        const model = new ConfigModel(entries);

        return model.AsDictionary();
    }

    private async IsUserAndGroupsEnabled()
    {
        const mdl = await this.ParseLoginDefs();
        return mdl[""]!["USERGROUPS_ENAB"] as boolean;
    }

    private async WaitForGroupAndExtractId(name: string)
    {
        while(true)
        {
            const group = await this.groupsManager.GetGroup(name);
            if(group === undefined)
            {
                await TimeUtil.Delay(500);
                continue;
            }

            return group.gid;
        }
    }
}