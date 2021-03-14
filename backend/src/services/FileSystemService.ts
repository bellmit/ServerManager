/**
 * ServerManager
 * Copyright (C) 2021 Amir Czwink (amir130@hotmail.de)
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
import * as mod_path from "path";

import { Injectable } from "acts-util-node";
import { PermissionsManager } from "./PermissionsManager";
import { POSIXAuthority } from "./POSIXAuthority";

enum FileAccess
{
    Read = 4,
    Write = 2,
    Execute = 1
}

@Injectable
export class FileSystemService
{
    constructor(private permissionsManager: PermissionsManager)
    {
    }

    //Public methods
    public async ChangeOwner(path: string, newOwner: POSIXAuthority, session: POSIXAuthority)
    {
        await this.RequireAccess(path, FileAccess.Write, session);
        return fs.promises.lchown(path, newOwner.uid, newOwner.gid);
    }

    public async DeleteFile(path: string, session: POSIXAuthority)
    {
        await this.RequireAccess(path, FileAccess.Write, session);
        return fs.promises.unlink(path);
    }

    public async Exists(path: string, session: POSIXAuthority)
    {
        return (await this.CheckAccess(path, FileAccess.Read, session)) !== null;
    }

    public async ListDirectoryContents(dirPath: string, session: POSIXAuthority)
    {
        const access = await this.CheckAccess(dirPath, FileAccess.Execute, session);
        if(!access)
            return [];
        return fs.promises.readdir(dirPath, "utf-8");
    }

    public async ReadTextFile(path: string, session: POSIXAuthority)
    {
        await this.RequireAccess(path, FileAccess.Read, session);
        return fs.promises.readFile(path, "utf-8");
    }

    public async RemoveDirectoryIfEmpty(dirPath: string, session: POSIXAuthority)
    {
        await this.RequireAccess(dirPath, FileAccess.Write, session);
        return fs.promises.rmdir(dirPath);
    }

    public async RemoveDirectoryRecursive(dirPath: string, session: POSIXAuthority)
    {
        await this.RequireAccess(dirPath, FileAccess.Write, session);
        return fs.promises.rmdir(dirPath, { recursive: true });
    }

    public async WriteTextFile(path: string, data: string, session: POSIXAuthority)
    {
        let access = await this.CheckAccess(path, FileAccess.Write, session);
        if(access === null)
        {
            await this.RequireAccess(mod_path.dirname(path), FileAccess.Write, session);
            access = true;
        }

        if(access)
            return fs.promises.writeFile(path, data, "utf-8");

        this.ThrowNoAccess(path);
    }

    //Private methods
    private async CheckAccess(path: string, access: FileAccess, session: POSIXAuthority)
    {
        let stats;
        try
        {
            stats = await fs.promises.lstat(path);
        }
        catch(e)
        {
            if(e.code === "ENOENT")
                return null;
            throw e;
        }

        if(this.CheckFileAccess(stats.mode & 7, access))
            return true;
        if(this.CheckFileAccess((stats.mode >> 3) & 7, access) && this.permissionsManager.MatchesGroupIdWithAuthority(stats.gid, session))
            return true;
        if( (stats.uid === session.uid) && this.CheckFileAccess((stats.mode >> 6) & 7, access) )
            return true;
        return this.permissionsManager.CanSudo(session.uid);
    }

    private CheckFileAccess(test: FileAccess, desired: FileAccess)
    {
        return (test & desired) != 0;
    }

    private async RequireAccess(path: string, access: FileAccess, session: POSIXAuthority)
    {
        const hasAccess = await this.CheckAccess(path, access, session);
        if(hasAccess === null)
            throw new Error("Can't fulfill postconditions because file does not exist: " + path);
        if(!hasAccess)
            this.ThrowNoAccess(path);
    }

    private ThrowNoAccess(path: string)
    {
        throw new Error("Missing access for path: " + path);
    }
}