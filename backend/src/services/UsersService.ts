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
import { Observer, Dictionary, MulticastObservable } from "acts-util-core";
import { User, Group } from "srvmgr-api";

import { Injectable } from "../Injector";
import { FileSystemWatcher } from "./FileSystemWatcher";
import { CommandExecutor } from "./CommandExecutor";
import { POSIXAuthority, PermissionsManager } from "./PermissionsManager";

interface ShadowData
{
    cryptData: string;
}

@Injectable
export class UsersService
{
    constructor(private fileSystemWatcher: FileSystemWatcher, private commandExecutor: CommandExecutor, private permissionsManager: PermissionsManager)
    {
        this._groups = new MulticastObservable<Group[]>(this.ObserveGroupDatabase.bind(this));
        this.shadow = new MulticastObservable<Dictionary<ShadowData>>( this.ObserveShadowFile.bind(this) );
        this._users = new MulticastObservable<User[]>(this.ObserveUserDatabase.bind(this));

        this._groups.Subscribe( { next: this.OnGroupsChanged.bind(this) });
        this.shadow.Subscribe( { next: shadowData => this.currentShadowData = shadowData } );
        this._users.Subscribe( { next: this.OnUsersChanged.bind(this) });
    }

    //Properties
    public get groups()
    {
        return this._groups;
    }

    public get users()
    {
        return this._users;
    }

    //Public methods
    public async AddUserToGroup(userName: string, groupName: string, session: POSIXAuthority)
    {
        if(userName.trim().length === 0)
            return false;
        if(groupName.trim().length === 0)
            return false;

        const result = await this.commandExecutor.ExecuteCommand(["usermod", "-a", "-G", groupName, userName], this.permissionsManager.Sudo(session.uid));
        if(result.exitCode !== 0)
            return false;
        return true;
    }

    public async Authenticate(userName: string, password: string)
    {
        if(this.currentShadowData === undefined)
            return false;
        const cryptBlock = this.currentShadowData[userName];
        if(cryptBlock === undefined)
            return false;
        const cryptValue = cryptBlock.cryptData;

        const crypt = require('../../../build/Release/crypt.node').crypt;
        const newCryptValue = crypt(password, cryptValue);

        return newCryptValue === cryptValue;
    }

    public async ChangePassword(userName: string, oldPassword: string, newPassword: string, session: POSIXAuthority)
    {
        if(userName.trim().length === 0)
            return false;
        const childProcess = this.commandExecutor.ExecuteAsyncCommand(["passwd", userName], this.permissionsManager.Sudo(session.uid))
        if(oldPassword.trim().length !== 0) //it is possible, that the user does not have a password before. In that case it should be blank
            childProcess.stdin.write(oldPassword + "\n");
        childProcess.stdin.write(newPassword + "\n");
        childProcess.stdin.write(newPassword + "\n");
        childProcess.stdin.write("\n"); //in case the user had a password but oldPassword.length == 0, this will terminate passwd

        return new Promise<boolean>( (resolve, reject) => {
            childProcess.on("close", (code, _) => resolve(code === 0));
            childProcess.on("error", reject);
        });
    }

    public async CreateGroup(name: string, session: POSIXAuthority)
    {
        if(name.trim().length === 0)
            return false;
        const cmd = ["groupadd"];

        cmd.push("-r");

        cmd.push(name);
        const exitCode = await this.commandExecutor.ExecuteWaitableAsyncCommand(cmd, this.permissionsManager.Sudo(session.uid));
        return exitCode === 0;
    }

    public CreateUser(userName: string, createHomeDir: boolean, session: POSIXAuthority)
    {
        return this.AddUser(userName, createHomeDir ? ["-m"] : [], session);
    }

    public async CreateSystemUser(userName: string, session: POSIXAuthority)
    {
        return this.AddUser(userName, ["-r"], session);
    }

    public async DeleteUser(userName: string, session: POSIXAuthority)
    {
        if(userName.trim().length === 0)
        throw new Error("Illegal user name");
        const result = await this.commandExecutor.ExecuteCommand(["userdel", "-r", userName], this.permissionsManager.Sudo(session.uid));
        if(result.exitCode !== 0)
            throw new Error(result.stderr);
    }

    public GetGroupByName(name: string)
    {
        for (const key in this.groupIdMap)
        {
            if (this.groupIdMap.hasOwnProperty(key))
            {
                const value = this.groupIdMap[key]!;
                if(value.name === name)
                    return value;
            }
        }
        return undefined;
    }

    public GetGroupsOf(uid: number)
    {
        const user = this.GetUserById(uid);
        if(user === undefined)
            return undefined;
        if(this.groupMemberMap === undefined)
            return undefined;

        return this.groupMemberMap[user.name];
    }

    public GetUserById(uid: number)
    {
        if(this.userIdMap !== undefined)
            return this.userIdMap[uid];
        return undefined;
    }

    public GetUserByName(name: string)
    {
        if(this.userIdMap === undefined)
            return undefined;
        for (const key in this.userIdMap)
        {
            if (this.userIdMap.hasOwnProperty(key))
            {
                const value = this.userIdMap[key]!;
                if(value.name === name)
                    return value;
            }
        }
        return undefined;
    }

    public async RemoveUserFromGroup(userName: string, groupName: string, session: POSIXAuthority)
    {
        if(userName.trim().length === 0)
            return false;
        if(groupName.trim().length === 0)
            return false;

        const result = await this.commandExecutor.ExecuteCommand(["deluser", userName, groupName], this.permissionsManager.Sudo(session.uid));
        if(result.exitCode !== 0)
            return false;
        return true;
    }

    //Private members
    private groupIdMap?: Dictionary<Group>;
    private groupMemberMap?: Dictionary<Group[]>;
    private currentShadowData?: Dictionary<ShadowData>;
    private userIdMap?: Dictionary<User>;
    private _groups: MulticastObservable<Group[]>;
    private shadow : MulticastObservable<Dictionary<ShadowData>>;
    private _users: MulticastObservable<User[]>;

    //Private methods
    private async AddUser(userName: string, options: string[], session: POSIXAuthority)
    {
        if(userName.trim().length === 0)
            return false;
        const cmd = ["useradd"];

        cmd.push(...options);

        cmd.push(userName);
        const exitCode = await this.commandExecutor.ExecuteWaitableAsyncCommand(cmd, this.permissionsManager.Sudo(session.uid));
        return exitCode === 0;
    }

    private ObserveGroupDatabase(observer: Observer<Group[]>)
    {
        return this.fileSystemWatcher.ObserveTextFile("/etc/group", (data: string) => this.ParseGroups(data).then( groups => observer.next(groups) ) );
    }

    private ObserveShadowFile(observer: Observer<Dictionary<ShadowData>>)
    {
        return this.fileSystemWatcher.ObserveTextFile("/etc/shadow", (data: string) => this.ParseShadow(data).then( shadowData => observer.next(shadowData) ) );
    }

    private ObserveUserDatabase(observer: Observer<User[]>)
    {
        return this.fileSystemWatcher.ObserveTextFile("/etc/passwd", (data: string) => this.ParseUsers(data).then( users => observer.next(users) ) );
    }

    private async ParseGroups(data: string)
    {
        const result: Group[] = [];

        const lines = data.split("\n");
        for (const line of lines)
        {
            if(!line)
                continue;

            const parts = line.split(":");

            result.push({
                name: parts[0],
                gid: parseInt(parts[2]),
                memberNames: parts[3] ? parts[3].split(",") : []
            });
        }

        return result;
    }

    private async ParseShadow(data: string)
    {
        const result: Dictionary<ShadowData> = {};

        const lines = data.split("\n");
        for (const line of lines)
        {
            if(!line.trim())
                continue;
            const parts = line.split(":");

            const userName = parts[0];
            const protection = parts[1];

            if( (protection === "!") //user is locked
            || (protection === "*") ) //user is also locked but never had an established password
                continue;

            result[userName] = {
                cryptData: protection
            };
        }
        return result;
    }

    private async ParseUsers(data: string)
    {
        const result: User[] = [];

        const lines = data.split("\n");
        for (const line of lines)
        {
            //skip empty lines
            if(line.length === 0)
                continue;
                
            const parts = line.split(":");

            const userName = parts[0];
            const uid = parseInt(parts[2]);

            //check if we need shadow file
            const protection = parts[1];
            if(protection !== "x")
                throw new Error("NOT IMPLEMENTED");

            result.push({
                name: userName,
                uid: uid,
                gid: parseInt(parts[3]),
                displayName: parts[4],
                isSystemUser: (uid < 1000) || (uid > 60000), //TODO: specific ranges are defined in /etc/login.defs who is a system user and who is a real one,
                //on most systems, real users start with uid 1000 and end with 60000. However, these should be read from file
            });
        }

        return result;
    }

    //Event handlers
    private OnGroupsChanged(newGroups: Group[])
    {
        const groupIdMap: Dictionary<Group> = {};
        const groupMemberMap: Dictionary<Group[]> = {};
        for (const group of newGroups)
        {
            for(const memberName of group.memberNames)
            {
                if(groupMemberMap[memberName] === undefined)
                    groupMemberMap[memberName] = [group];
                else
                    groupMemberMap[memberName]!.push(group);
            }
            groupIdMap[group.gid] = group;
        }

        this.groupIdMap = groupIdMap;
        this.groupMemberMap = groupMemberMap;
    }

    private OnUsersChanged(newUsers: User[])
    {
        const userIdMap: Dictionary<User> = {};

        for (const user of newUsers)
        {
            userIdMap[user.uid] = user;
        }

        this.userIdMap = userIdMap;
    }
}