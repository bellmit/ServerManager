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
import { Dictionary, Subject } from "acts-util-core";
import { Group } from "srvmgr-api";
import { Injectable } from "acts-util-node";
import { CommandExecutor } from "./CommandExecutor";
import { POSIXAuthority } from "./POSIXAuthority";
import { UserDataProviderService } from "./UserDataProviderService";

@Injectable
export class UsersGroupsManager
{
    constructor(userDataProviderService: UserDataProviderService, private commandExecutor: CommandExecutor)
    {
        userDataProviderService.groups.Subscribe( { next: this.OnGroupsChanged.bind(this) });

        this.changedSubject = new Subject<void>();
    }

    //Public methods
    public async AddUserToGroup(userName: string, groupName: string, session: POSIXAuthority)
    {
        if(userName.trim().length === 0)
            return false;
        if(groupName.trim().length === 0)
            return false;

        await this.commandExecutor.ExecuteCommand(["sudo", "usermod", "-a", "-G", groupName, userName], session);
        this.Reset();
    }

    public async CreateGroup(name: string, session: POSIXAuthority)
    {
        if(name.trim().length === 0)
            return false;
        const cmd = ["sudo", "groupadd"];

        cmd.push("-r");

        cmd.push(name);
        await this.commandExecutor.ExecuteCommand(cmd, session);
        this.Reset();
    }

    public async DeleteGroup(name: string, session: POSIXAuthority)
    {
        await this.commandExecutor.ExecuteCommand(["groupdel", name], session);
        this.Reset();
    }

    public async GetGroup(name: string)
    {
        await this.EnsureHasData();
        return this.groupNameMap![name];
    }

    public async GetGroups()
    {
        await this.EnsureHasData();
        return this._groups!;
    }

    public async RemoveUserFromGroup(userName: string, groupName: string, session: POSIXAuthority)
    {
        if(userName.trim().length === 0)
            return false;
        if(groupName.trim().length === 0)
            return false;

        await this.commandExecutor.ExecuteCommand(["sudo", "deluser", userName, groupName], session);
    }

    //Private members
    private _groups?: Group[];
    private groupNameMap?: Dictionary<Group>;
    private changedSubject: Subject<void>;

    //Private methods
    private async EnsureHasData()
    {
        while(this.groupNameMap === undefined)
            await this.changedSubject.First();
    }

    private Reset()
    {
        this.groupNameMap = undefined;
    }

    //Event handlers
    private OnGroupsChanged(newGroups: Group[])
    {
        const groupNameMap: Dictionary<Group> = {};

        for (const group of newGroups)
        {
            groupNameMap[group.name] = group;
        }

        this._groups = newGroups;
        this.groupNameMap = groupNameMap;
        this.changedSubject.Next();
    }
}