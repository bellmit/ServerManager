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

import { Component, JSX_CreateElement, ProgressSpinner, Injectable, MatIcon } from "acfrontend";
import { FileSystemService } from "./FileSystemService";
import { FileSystemApi } from "srvmgr-api";

@Injectable
export class DirectoryViewComponent extends Component
{
    constructor(private fileSystemService: FileSystemService)
    {
        super();

        this.dirPath = "~";
        this.entries = null;
    }

    protected Render(): RenderValue
    {
        if(this.entries === null)
            return <ProgressSpinner />;

        return <fragment>
            <h2>{this.dirPath}</h2>
            <ul>{this.entries.map(this.RenderEntry.bind(this))}</ul>
        </fragment>;
    }

    //Private methods
    private dirPath: string;
    private entries: FileSystemApi.ListDirectoryContents.FileSystemNode[] | null;

    //Private methods
    private RenderEntry(entry: FileSystemApi.ListDirectoryContents.FileSystemNode)
    {
        if(entry.type === "directory")
        {
            return <li>
                <a onclick={ this.OnDirChanged.bind(this, this.dirPath + "/" + entry.name) }>
                    <MatIcon>folder</MatIcon>
                    {entry.name}
                </a>
            </li>;
        }
        return <li>
            <MatIcon>note</MatIcon>
            {entry.name}
        </li>;
    }

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
            });
        }
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
    }
}