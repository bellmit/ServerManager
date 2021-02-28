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

import { Component, JSX_CreateElement, ProgressSpinner, Injectable, MatIcon, Anchor } from "acfrontend";
import { FileSystemService } from "./FileSystemService";
import { FileSystemApi, Group, User } from "srvmgr-api";
import { UsersService } from "../Users/UsersService";
import { Dictionary } from "acts-util-core";

@Injectable
export class DirectoryViewComponent extends Component
{
    constructor(private fileSystemService: FileSystemService, private usersService: UsersService)
    {
        super();

        this.dirPath = "~";
        this.entries = null;
        this.groups = null;
        this.users = null;
    }

    protected Render(): RenderValue
    {
        if( (this.entries === null) || (this.groups === null) || (this.users === null) )
            return <ProgressSpinner />;

        return <fragment>
            <h2>{this.dirPath}</h2>
            <table>
                <tr>
                    <th> </th>
                    <th>Name</th>
                    <th>Size</th>
                    <th>Owner</th>
                    <th>Group</th>
                    <th>Others</th>
                </tr>
                {this.entries.map(this.RenderEntry.bind(this))}
            </table>
        </fragment>;
    }

    //Private methods
    private dirPath: string;
    private entries: FileSystemApi.ListDirectoryContents.FileSystemNode[] | null;
    private groups: Dictionary<Group> | null;
    private users: Dictionary<User> | null;

    //Private methods
    private async QueryEntries(path: string)
    {
        const result = await this.fileSystemService.ListDirectoryContents(path);
        this.dirPath = result.resolvedDirectory;
        this.entries = result.nodes;

        if(result.resolvedDirectory.length > 1)
        {
            this.entries.unshift({
                name: "..",
                type: "directory",
                //TODO:
                mode: 0,
                size: 0,
                gid: 0,
                uid: 0,
            });
        }
    }

    private RenderEntry(entry: FileSystemApi.ListDirectoryContents.FileSystemNode)
    {
        return <tr>
            <td><MatIcon>{entry.type === "directory" ? "folder" : "note"}</MatIcon></td>
            <td>{this.RenderTitle(entry)}</td>
            <td>{entry.size.FormatBinaryPrefixed("B")}</td>
            <td>{this.RenderUser(entry.uid) + " (" + this.RenderPermissions( (entry.mode >> 6) & 7, entry.type === "directory" ) + ")"}</td>
            <td>{this.RenderGroup(entry.gid) + " (" + this.RenderPermissions( (entry.mode >> 3) & 7, entry.type === "directory" ) + ")"}</td>
            <td>{this.RenderPermissions(entry.mode & 7, entry.type === "directory")}</td>
        </tr>;
    }

    private RenderGroup(gid: number)
    {
        return this.groups![gid]?.name;
    }
    
    private RenderPermissions(permissions: number, isDir: boolean)
    {
        if(permissions == 0)
            return "no access";

        const parts = [];

        if(isDir)
        {
            if(permissions & 4)
                parts.push("list");
            if(permissions & 2)
                parts.push("modify");
            if(permissions & 1)
                parts.push("access");
        }
        else
        {
            if(permissions & 4)
                parts.push("read");
            if(permissions & 2)
                parts.push("write");
            if(permissions & 1)
                parts.push("execute");
        }

        return parts.join("-");
    }

    private RenderTitle(entry: FileSystemApi.ListDirectoryContents.FileSystemNode)
    {
        switch(entry.type)
        {
            case "directory":
                return <a onclick={ this.OnDirChanged.bind(this, this.dirPath + "/" + entry.name) }>{entry.name}</a>;
            case "file":
                return <Anchor route={"/filemanager/editfile?filePath=" + this.dirPath + "/" + entry.name}>{entry.name}</Anchor>;
        }
        return entry.name;
    }

    private RenderUser(uid: number)
    {
        return this.users![uid]?.name;
    }

    //Event handlers
    private OnDirChanged(path: string)
    {
        this.entries = null;
        this.QueryEntries(path);
    }

    public OnInitiated()
    {
        this.QueryEntries(this.dirPath);

        this.usersService.users.Subscribe( newUsers => this.users = newUsers.Values().ToDictionary(user => user.uid, user => user) );
        this.usersService.groups.Subscribe( newGroups => this.groups = newGroups.Values().ToDictionary(group => group.gid, group => group) );
    }
}