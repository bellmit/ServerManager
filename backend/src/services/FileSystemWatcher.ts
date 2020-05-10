/**
 * ServerManager
 * Copyright (C) 2019 Amir Czwink (amir130@hotmail.de)
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
import fs from "fs";
import Path from "path";

import { Injectable } from "../Injector";

@Injectable
export class FileSystemWatcher
{
    //Public methods
    public ObserveFile(filePath: string, observer: () => void)
    {
        observer();

        const debouncer = observer.Debounce(500);
        const watcher = fs.watch(filePath, () => debouncer());

        return {
            Unsubscribe()
            {
                watcher.close();
            }
        };
    }

    public ObserveTextFile(filePath: string, observer: (data: string) => void)
    {
        return this.ObserveFile(filePath, () => this.ReadFile(filePath).then( (data: string) => observer(data) ));
    }

    //Private methods
    private async ReadFile(fileName: string)
    {
        return new Promise<string>( (resolve, reject) => {
            fs.readFile(fileName, "utf8", async (error, data) => {
                if(error)
                    reject(error);
                else
                    resolve(data);
            });
        });
    }
}