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

import { Dictionary } from "acts-util-core";

import { User } from "srvmgr-api";

import { Injectable } from "../Injector";
import { POSIXAuthority } from "./PermissionsManager";
import { UsersService } from "./UsersService";

export interface SessionData
{
    token: string;
    expiryDateTime: Date;
}

interface Session extends POSIXAuthority
{
    expiryDateTime: Date;
    remoteAddress: string;
    userName: string;
}

@Injectable
export class SessionManager
{
    constructor(private usersService: UsersService)
    {
        this.sessions = {};
        this.userData = {};

        this.usersService.users.Subscribe({ next: this.OnUsersChanged.bind(this) });
    }

    //Public methods
    public Authenticate(token: string, remoteAddress: string)
    {
        const session = this.FindSession(token);
        if( !( (session === undefined) || (session === null) ) )
            session.expiryDateTime = this.CreateExpiryDateTime();
        return session;
    }

    public async CreateSession(userName: string, remoteAddress: string): Promise<SessionData>
    {
        while(true)
        {
            const key = this.SearchSession(userName, remoteAddress);
            if(key === undefined)
                break;
            delete this.sessions[key];
        }

        const token = await this.CreateToken();
        const expiryDateTime = this.CreateExpiryDateTime();
        this.sessions[token] = {
            expiryDateTime: expiryDateTime,
            remoteAddress: remoteAddress,
            userName: userName,
            gid: this.userData[userName]!.gid,
            uid: this.userData[userName]!.uid,
        };

        return {
            token: token,
            expiryDateTime: expiryDateTime
        };
    }

    public SessionExists(remoteAddress: string)
    {
        return this.SearchSession(undefined, remoteAddress) !== undefined;
    }

    public FindSession(token: string)
    {
        const session = this.sessions[token];
        if(session === undefined)
            return undefined;

        if(new Date() >= session.expiryDateTime)
        {
            delete this.sessions[token];
            return null;
        }

        return session;
    }

    //Private members
    private sessions: Dictionary<Session>;
    private userData: Dictionary<POSIXAuthority>;

    //Private methods
    private CreateExpiryDateTime()
    {
        const minutes = 10;
        const t = minutes * 60 * 1000;
        return new Date( Date.now() + t );
    }

    private SearchSession(userName?: string, remoteAddress?: string)
    {
        for (const key in this.sessions)
        {
            if (this.sessions.hasOwnProperty(key))
            {
                const session = this.FindSession(key);
                if( (session === undefined) || (session === null) )
                    continue;
                if(session.remoteAddress === remoteAddress)
                    return key;
                if(session.userName === userName)
                    return key;
            }
        }
        return undefined;
    }

    private CreateToken()
    {
        return new Promise<string>( (resolve, reject) =>
        {
            crypto.randomBytes(8, (error, data) => {
                if (error) reject(error);

                resolve(data.toString("base64"));
            });
        });
    }

    //Event handlers
    private OnUsersChanged(users: User[])
    {
        this.userData = {};
        for (const user of users)
        {
            this.userData[user.name] = { gid: user.gid, uid: user.uid };
        }
    }
}