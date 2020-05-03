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

interface ShadowData
{
    cryptData: string;
}

@Injectable
export class UsersService
{
    constructor()
    {
        this._shadow = new MulticastObservable<Dictionary<ShadowData>>( this.ObserveShadowFile.bind(this) );
        this._users = new MulticastObservable<User[]>(this.ObserveUserDatabase.bind(this));

        this._shadow.Subscribe( { next: shadowData => this.currentShadowData = shadowData } );
    }

    //Properties
    public get users()
    {
        return this._users;
    }

    //Public methods
    public async Authenticate(userName: string, password: string)
    {
        if(this.currentShadowData === undefined)
            return false;
        const cryptBlock = this.currentShadowData[userName];
        if(cryptBlock === undefined)
            return false;
        const cryptValue = cryptBlock.cryptData;

        const crypt = require('../../build/Release/crypt.node').crypt;
        const newCryptValue = crypt(password, cryptValue);

        return newCryptValue === cryptValue;
    }

    //Private members
    private currentShadowData?: Dictionary<ShadowData>;
    private _shadow : MulticastObservable<Dictionary<ShadowData>>;
    private _users: MulticastObservable<User[]>;

    //Private methods
    private ObserveFile(fileName: string, observer: (data: string) => void)
    {
        const action = () => this.ReadFile(fileName).then( (data: string) => observer(data) );
        const debouncer = action.Debounce(500);

        action();

        const watcher = fs.watch(fileName, () => debouncer());

        return {
            Unsubscribe()
            {
                watcher.close();
            }
        };
    }

    private ObserveShadowFile(observer: Observer<Dictionary<ShadowData>>)
    {
        return this.ObserveFile("/etc/shadow", (data: string) => this.ParseShadow(data).then( shadowData => observer.next(shadowData) ) );
    }

    private ObserveUserDatabase(observer: Observer<User[]>)
    {
        return this.ObserveFile("/etc/passwd", (data: string) => this.ParseUsers(data).then( users => observer.next(users) ) );
    }

    private async ParseShadow(data: string)
    {
        const result: Dictionary<ShadowData> = {};

        const lines = data.split("\n");
        for (const line of lines)
        {
            if(!line.trim())
                continue;
            const parts = line.split(":");

            const userName = parts[0];
            const protection = parts[1];

            if( (protection === "!") || (protection === "*") )
                continue;

            result[userName] = {
                cryptData: protection
            };
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
                isSystemUser: (uid < 1000) || (uid > 60000), //TODO: specific ranges are defined in /etc/login.defs who is a system user and who is a real one,
                //on most systems, real users start with uid 1000 and end with 60000. However, these should be read from file
            });
        }

        return result;
    }

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