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

import { Injectable, Injector, HttpService } from "acfrontend";
import { Property } from "acts-util";

import { Routes, AuthResult } from "srvmgr-api";

import { WebSocketService, BACKEND_HOST } from "./WebSocketService";

interface LoginInfo
{
    expiryDateTime: Date;
}

@Injectable
export class AuthenticationService
{
    constructor()
    {
        this._loginInfo = new Property<LoginInfo | undefined>(undefined);
        this._token = null;
    }

    //Properties
    public get loginInfo()
    {
        return this._loginInfo;
    }

    public get token()
    {
        return this._token;
    }

    //Public methods
    public IsLoggedIn()
    {
        return this._token !== null;
    }

    public async Login(userName: string, password: string)
    {
        const httpService = new HttpService();
        const result = await httpService.Post<AuthResult>("http://" + BACKEND_HOST + Routes.AUTH, {userName: userName, password: password});
        if(result.success)
        {
            this.ConnectWebsocket();

            this._loginInfo.Set({
                expiryDateTime: new Date(result.expiryDateTime!),
            });
            this._token = result.token!;

            return true;
        }

        this.Logout();

        return false;
    }

    public Logout()
    {
        Injector.Resolve(WebSocketService).Close();
        Injector.Register(WebSocketService, null);

        this._loginInfo.Set(undefined);
        this._token = null;

        location.reload(true);
    }

    public UpdateExpiryDateTime(date: Date)
    {
        this._loginInfo.Set({ expiryDateTime: date});
    }

    //Private members
    private _loginInfo: Property<LoginInfo | undefined>;
    private _token: string | null;

    //Private methods
    private ConnectWebsocket()
    {
        const webSocketService = Injector.Resolve(WebSocketService);
        Injector.Register(WebSocketService, webSocketService);
    }
}