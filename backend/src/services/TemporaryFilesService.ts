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
import * as crypto from "crypto";
import * as fs from "fs";
import * as os from "os";
import * as path from "path";

import { Injectable } from "../Injector";
import { CommandExecutor } from "./CommandExecutor";
import { POSIXAuthority } from "./PermissionsManager";

@Injectable
export class TemporaryFilesService
{
    constructor(private commandExecutor: CommandExecutor)
    {
    }

    //Public methods
    public CleanUp(path: string, session: POSIXAuthority)
    {
        this.commandExecutor.ExecuteCommandExitCodeOnly(["rm", "-rf", path], session);
    }

    public async CreateTempDirectory()
    {
        const globalTempDir = await this.GetGlobalTempDir();

        return new Promise<string>( (resolve, reject) => {
            fs.mkdtemp(`${globalTempDir}${path.sep}`, "utf-8", (err, folder) => {   
                if(err)
                    reject(err);
                else
                    resolve(folder);
            });
        });
    }

    public async CreateTempFilePath()
    {
        const randomString = crypto.randomBytes(12).toString("hex");
        return path.join(await this.GetGlobalTempDir(), randomString);
    }

    //Private methods
    private async GetGlobalTempDir()
    {
        const globalTempDir = os.tmpdir();

        const globDir = "/tmp/srvmgr";

        await new Promise( (resolve, _) => {
            fs.exists(globDir, (exists => {
                if(exists)
                    resolve();
                else
                    fs.mkdir(globDir, resolve);
            }));
        });

        return globDir;
    }
}