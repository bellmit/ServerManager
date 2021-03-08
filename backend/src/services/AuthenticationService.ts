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
import { Dictionary, MulticastObservable, Observer } from "acts-util-core";

import { Injectable } from "../Injector";
import { CommandExecutor } from "./CommandExecutor";
import { FileSystemWatcher } from "./FileSystemWatcher";
import { POSIXAuthority } from "./POSIXAuthority";

interface ShadowData
{
    cryptData: string;
}

@Injectable
export class AuthenticationService
{
    constructor(private fileSystemWatcher: FileSystemWatcher, private commandExecutor: CommandExecutor)
    {
        this._shadow = new MulticastObservable<Dictionary<ShadowData>>( this.ObserveShadowFile.bind(this) );

        this._shadow.Subscribe( { next: shadowData => this.currentShadowData = shadowData } );
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

        const crypt = require('../../../build/Release/crypt.node').crypt;
        const newCryptValue = crypt(password, cryptValue);

        return newCryptValue === cryptValue;
    }

    public ChangePassword(userName: string, oldPassword: string, newPassword: string, session: POSIXAuthority)
    {
        if(userName.trim().length === 0)
            return false;
        const childProcess = this.commandExecutor.CreateChildProcess(["sudo", "passwd", userName], session);
        if(oldPassword.trim().length !== 0) //it is possible, that the user does not have a password before. In that case it should be blank
            childProcess.stdin.write(oldPassword + "\n");
        childProcess.stdin.write(newPassword + "\n");
        childProcess.stdin.write(newPassword + "\n");
        childProcess.stdin.write("\n"); //in case the user had a password but oldPassword.length == 0, this will terminate passwd

        return new Promise<boolean>( (resolve, reject) => {
            childProcess.on("close", (code, _) => resolve(code === 0));
            childProcess.on("error", reject);
        });
    }

    //Private members
    private _shadow : MulticastObservable<Dictionary<ShadowData>>;
    private currentShadowData?: Dictionary<ShadowData>;

    //Private methods
    private ObserveShadowFile(observer: Observer<Dictionary<ShadowData>>)
    {
        return this.fileSystemWatcher.ObserveTextFile("/etc/shadow", (data: string) => this.ParseShadow(data).then( shadowData => observer.next(shadowData) ) );
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

            if( (protection === "!") //user is locked
            || (protection === "*") ) //user is also locked but never had an established password
                continue;

            result[userName] = {
                cryptData: protection
            };
        }
        return result;
    }
}