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
import { Observer, MulticastObservable, Dictionary } from "acts-util-core";
import { User, Group } from "srvmgr-api";

import { Injectable } from "../Injector";
import { FileSystemWatcher } from "./FileSystemWatcher";

@Injectable
export class UserDataProviderService
{
    constructor(private fileSystemWatcher: FileSystemWatcher)
    {
        this._groups = new MulticastObservable<Group[]>(this.ObserveGroupDatabase.bind(this));
        this._users = new MulticastObservable<User[]>(this.ObserveUserDatabase.bind(this));
    }

    //Class functions
    public static CreateUserToGroupMap(groups: Group[])
    {
        const groupMemberMap: Dictionary<Group[]> = {};
        for (const group of groups)
        {
            for (const userName of group.memberNames)
            {
                if(groupMemberMap[userName] === undefined)
                    groupMemberMap[userName] = [group];
                else
                    groupMemberMap[userName]!.push(group);
            }
        }

        return groupMemberMap;
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

    //Private members
    private _groups: MulticastObservable<Group[]>;
    private _users: MulticastObservable<User[]>;

    //Private methods
    private ObserveGroupDatabase(observer: Observer<Group[]>)
    {
        return this.fileSystemWatcher.ObserveTextFile("/etc/group", (data: string) => this.ParseGroups(data).then( groups => observer.next(groups) ) );
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
                homeDirectory: parts[5],
                isSystemUser: (uid < 1000) || (uid > 60000), //TODO: specific ranges are defined in /etc/login.defs who is a system user and who is a real one,
                //on most systems, real users start with uid 1000 and end with 60000. However, these should be read from file
            });
        }

        return result;
    }
}