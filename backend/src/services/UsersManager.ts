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
import { Group, User } from "srvmgr-api";

import { Injectable } from "../Injector";
import { CommandExecutor } from "./CommandExecutor";
import { POSIXAuthority } from "./POSIXAuthority";
import { UserDataProviderService } from "./UserDataProviderService";
import { UsersGroupsManager } from "./UserGroupsManager";

@Injectable
export class UsersManager
{
    constructor(userDataProviderService: UserDataProviderService, private commandExecutor: CommandExecutor, private groupsManager: UsersGroupsManager)
    {
        userDataProviderService.users.Subscribe({ next: this.OnUsersChanged.bind(this) });
        userDataProviderService.groups.Subscribe({ next: this.UpdateDictionaries.bind(this) });

        this.changedSubject = new Subject<void>();
    }

    //Public methods
    public async CreateSystemUser(userName: string, session: POSIXAuthority)
    {
        return this.AddUser(userName, ["-r"], session);
    }

    public CreateUser(userName: string, createHomeDir: boolean, session: POSIXAuthority)
    {
        return this.AddUser(userName, createHomeDir ? ["-m"] : [], session);
    }

    public async DeleteUser(userName: string, session: POSIXAuthority)
    {
        if(userName.trim().length === 0)
            throw new Error("Illegal user name");
        await this.commandExecutor.ExecuteCommand(["sudo", "userdel", "-r", userName], session);
        this.Reset();
    }

    public async GetGroupsOf(name: string)
    {
        await this.EnsureHasData();
        return this.groupMemberMap![name];
    }

    public async GetUser(name: string)
    {
        await this.EnsureHasData();
        return this.userNameMap![name];
    }

    public async GetUserById(uid: number)
    {
        await this.EnsureHasData();
        return this.userIdMap![uid];
    }

    //Private members
    private users?: User[];
    private userIdMap?: Dictionary<User>;
    private userNameMap?: Dictionary<User>;
    private groupMemberMap?: Dictionary<Group[]>;
    private changedSubject: Subject<void>;

    //Private methods
    private async AddUser(userName: string, options: string[], session: POSIXAuthority)
    {
        if(userName.trim().length === 0)
            return false;
        const cmd = ["sudo", "useradd"];

        cmd.push(...options);

        cmd.push(userName);
        await this.commandExecutor.ExecuteCommand(cmd, session);
        this.Reset();
    }

    private async EnsureHasData()
    {
        while(this.userIdMap === undefined)
            await this.changedSubject.First();
    }

    private Reset()
    {
        this.users = undefined;
        this.userIdMap = undefined;
        this.userNameMap = undefined;
        this.groupMemberMap = undefined;
    }

    private async UpdateDictionaries()
    {
        if(this.users === undefined)
        {
            this.Reset();
            return;
        }

        const userIdMap: Dictionary<User> = {};
        const userNameMap: Dictionary<User> = {};

        for (const user of this.users)
        {
            userIdMap[user.uid] = user;
            userNameMap[user.name] = user;
        }

        const groups = await this.groupsManager.GetGroups();

        this.userIdMap = userIdMap;
        this.userNameMap = userNameMap;
        this.groupMemberMap = UserDataProviderService.CreateUserToGroupMap(groups);
        this.changedSubject.Next();
    }

    //Event handlers
    private OnUsersChanged(newUsers: User[])
    {
        this.users = newUsers;
        this.UpdateDictionaries();
    }
}