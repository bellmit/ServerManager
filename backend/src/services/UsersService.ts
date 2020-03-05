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
import * as fs from "fs";

import { Observer, Dictionary, MulticastObservable } from "acts-util";
import { User } from "srvmgr-api";

import { Injectable } from "../Injector";

interface Protection
{
}

@Injectable
export class UsersService
{
    constructor()
    {
        this._users = new MulticastObservable<User[]>(this.ObserveUserDatabase.bind(this));
        this.protection = {};
    }

    //Properties
    public get users()
    {
        return this._users;
    }

    //Private members
    private _users: MulticastObservable<User[]>;
    private protection: Dictionary<Protection>;

    //Private methods
    private ObserveUserDatabase(observer: Observer<User[]>)
    {
        const action = () => this.ReadUsers().then( users => observer.next(users));
        const debouncer = action.Debounce(500);

        action();

        const watcher = fs.watch("/etc/passwd", () => debouncer());

        return {
            Unsubscribe()
            {
                watcher.close();
            }
        };
    }

    /*private async ParseShadow(data: string)
    {
        const result: Dictionary<ShadowData> = {};

        const lines = data.split("\n");
        for (const line of lines)
        {
            const parts = line.split(":");

            const userName = parts[0];
            const protection = parts[1];

            if(protection === "*")
                continue;

            /*result[userName] = {
            };

            console.log(protection);
        }
        throw new Error("Method not implemented.");
        return result;
    }*/

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
            if(protection === "x")
                delete this.protection[userName];
            else
                throw new Error("NOT IMPLEMENTED");

            result.push({
                name: userName,
                uid: uid,
                gid: parseInt(parts[3]),
                displayName: parts[4],
                isSystemUser: (uid < 1000) || (uid > 60000), //TODO: specific ranges are defined in /etc/login.defs who is a system user and who is a real one,
                //one most systems, real users start with uid 1000 and end with 60000. However, these should be read from file
            });
        }

        return result;
    }

    /*private async ReadShadowData(): Promise<Dictionary<ShadowData>>
    {
        return new Promise<Dictionary<ShadowData>>( (resolve, reject) => {
            fs.readFile("/etc/shadow", "utf8", async (error, data) => {
                if(error)
                    reject(error);
                else
                {
                    const shadowData = await this.ParseShadow(data);
                    resolve(shadowData);
                }
            });
        });
    }*/

    private async ReadUsers()
    {
        return new Promise<User[]>( (resolve, reject) => {
            fs.readFile("/etc/passwd", "utf8", async (error, data) => {
                if(error)
                    reject(error);
                else
                {
                    const users = await this.ParseUsers(data);
                    resolve(users);
                }
            });
        });
    }
}