/**
 * ServerManager
 * Copyright (C) 2019-2020 Amir Czwink (amir130@hotmail.de)
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
import { FileSystemWatcher } from "./FileSystemWatcher";
import { Dictionary } from "acts-util-core";
import { UsersService } from "./UsersService";

export interface POSIXAuthority
{
    gid: number;
    uid: number;
}

interface GroupRule
{
}

interface UserRule
{
}

@Injectable
export class PermissionsManager
{
    constructor(private fileSystemWatcher: FileSystemWatcher, private usersService: UsersService)
    {
        this.groupRules = {};
        this.userRules = {};

        this.ObserveSudoersFile();
    }

    //Properties
    public get root(): POSIXAuthority
    {
        return { gid: 0, uid: 0 };
    }

    //Public methods
    public CanSudo(uid: number)
    {
        const user = this.usersService.GetUserById(uid);
        if(user === undefined)
            return false;
        const userRule = this.userRules[user.name];
        if(userRule !== undefined)
            return true;

        const groups = this.usersService.GetGroupsOf(user.uid);
        if(groups === undefined)
            return false;

        for (const group of groups)
        {            
            const gr = this.groupRules[group.name];
            if(gr !== undefined)
                return true;
        }

        return false;
    }

    public Sudo(uid: number): POSIXAuthority
    {
        if(!this.CanSudo(uid))
            throw new Error("Permission denied");
            
        return { uid: 0, gid: 0};
    }

    //Private members
    private groupRules: Dictionary<GroupRule>;
    private userRules: Dictionary<UserRule>;

    //Private methods
    private ObserveSudoersFile()
    {
        return this.fileSystemWatcher.ObserveTextFile("/etc/sudoers", (data: string) => this.ParseSudoersFile(data) );
    }

    private ParseSudoersFile(data: string)
    {
        const groupRules: Dictionary<GroupRule> = {};
        const userRules: Dictionary<UserRule> = {};

        const lines = data.split("\n");
        for (let line of lines)
        {
            line = line.trim();
            if(!line)
                continue;
            if(line.startsWith("#includedir "))
                continue; //TODO: this should also be read
            if(line.startsWith("#"))
                continue;
            if(line.match(/^Defaults[ \t]/))
                continue;

            const parts = line.match(/^(%?[a-z]+)[ \t]+([a-zA-Z]+)=\(([a-zA-Z]+)(:[a-zA-Z]+)?\)[ ]+([a-zA-Z]+)/);
            if(parts === null)
                continue;

            const userNameOrGroup = parts[1];
            const host = parts[2];
            const asUser = parts[3];
            const asGroup = parts[4];
            const commands = parts[5];

            //TODO: DO THIS CORRECTLY
            if(host !== "ALL")
                continue;
            if(asUser !== "ALL")
                continue;
            if(asGroup !== ":ALL")
                continue;
            if(commands !== "ALL")
                continue;

            if(userNameOrGroup.startsWith("%"))
                groupRules[userNameOrGroup.substr(1)] = {};
            else
                userRules[userNameOrGroup] = {};
        }

        this.groupRules = groupRules;
        this.userRules = userRules;
    } 
}