/**
 * ServerManager
 * Copyright (C) 2020-2022 Amir Czwink (amir130@hotmail.de)
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
import * as fs from "fs";
import * as path from "path";

import { Injectable } from "acts-util-node";
import { WebSocketAPIEndpoint, ApiRequest } from "../Api";
import { FileSystemApi } from "srvmgr-api";
import { UsersManager } from "../services/UsersManager";
import { FileSystemService } from "../services/FileSystemService";
import { POSIXAuthority } from "../services/POSIXAuthority";

@Injectable
class Api
{
    constructor(private usersManager: UsersManager, private fileSystemService: FileSystemService)
    {
    }

    @WebSocketAPIEndpoint({ route: FileSystemApi.ChangeMode.message })
    public async ChangeMode(request: ApiRequest, data: FileSystemApi.ChangeMode.RequestData): Promise<FileSystemApi.ChangeMode.ResultData>
    {
        await this.fileSystemService.ChangeMode(data.path, data.mode, request.session);
        if(data.recursive)
            await this.ChangeModeOfDir(data.path, data.mode, request.session);
        return {};
    }

    @WebSocketAPIEndpoint({ route: FileSystemApi.ListDirectoryContents.message })
    public async ListDirectoryContents(request: ApiRequest, data: FileSystemApi.ListDirectoryContents.RequestData): Promise<FileSystemApi.ListDirectoryContents.ResultData>
    {
        let dirPath: string;
        if(data === "~")
            dirPath = (await this.usersManager.GetUserById(request.session.uid))!.homeDirectory;
        else
            dirPath = data;
        dirPath = path.normalize(dirPath);

        const children = fs.readdirSync(dirPath, "utf-8");

        const nodes = await children.Values().Map(async child => {
            const stat = await fs.promises.lstat(path.join(dirPath, child));

            const result: FileSystemApi.ListDirectoryContents.FileSystemNode = {
                type: stat.isDirectory() ? "directory" : "file",
                name: child,
                mode: stat.mode,
                size: stat.size,
                uid: stat.uid,
                gid: stat.gid,
            };
            return result;
        }).PromiseAll();

        return {
            resolvedDirectory: dirPath,
            nodes: nodes
        };
    }

    @WebSocketAPIEndpoint({ route: FileSystemApi.QueryFileContent.message })
    public async QueryFileContent(request: ApiRequest, data: FileSystemApi.QueryFileContent.RequestData): Promise<FileSystemApi.QueryFileContent.ResultData>
    {
        return fs.promises.readFile(data, "utf-8");
    }

    @WebSocketAPIEndpoint({ route: FileSystemApi.SetFileContent.message })
    public async SetFileContent(request: ApiRequest, data: FileSystemApi.SetFileContent.RequestData)
    {
        return fs.promises.writeFile(data.path, data.content, "utf-8");
    }

    //Private methods
    private async ChangeModeOfDir(dirPath: string, mode: number, session: POSIXAuthority)
    {
        const children = await this.fileSystemService.ListDirectoryContents(dirPath, session);
        for (const child of children)
        {
            const childPath = path.join(dirPath, child);
            await this.fileSystemService.ChangeMode(childPath, mode, session);
            const stats = await this.fileSystemService.QueryFileInfo(childPath, session);
            
            if(stats.isDirectory())
                await this.ChangeModeOfDir(childPath, mode, session);
        }
    }
}

export default Api;