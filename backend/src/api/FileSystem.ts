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
import * as fs from "fs";
import * as path from "path";

import { Injectable } from "../Injector";
import { ApiEndpoint, ApiRequest } from "../Api";
import { FileSystemApi } from "srvmgr-api";
import { UsersService } from "../services/UsersService";

@Injectable
class Api
{
    constructor(private usersService: UsersService)
    {
    }

    @ApiEndpoint({ route: FileSystemApi.ListDirectoryContents.message })
    public async ListDirectoryContents(request: ApiRequest, data: FileSystemApi.ListDirectoryContents.RequestData): Promise<FileSystemApi.ListDirectoryContents.ResultData>
    {
        let dirPath: string;
        if(data === "~")
            dirPath = this.usersService.GetUserById(request.session.uid)!.homeDirectory;
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

    @ApiEndpoint({ route: FileSystemApi.QueryFileContent.message })
    public async QueryFileContent(request: ApiRequest, data: FileSystemApi.QueryFileContent.RequestData): Promise<FileSystemApi.QueryFileContent.ResultData>
    {
        return fs.promises.readFile(data, "utf-8");
    }

    @ApiEndpoint({ route: FileSystemApi.SetFileContent.message })
    public async SetFileContent(request: ApiRequest, data: FileSystemApi.SetFileContent.RequestData)
    {
        return fs.promises.writeFile(data.path, data.content, "utf-8");
    }
}

export default Api;