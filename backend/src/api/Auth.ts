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
import express from "express";

import { Routes, AuthResult } from "srvmgr-api";

import { Injectable } from "../Injector";
import { HttpEndpoint } from "../Http";
import { SessionManager } from "../services/SessionManager";
import { AuthenticationService } from "../services/AuthenticationService";

@Injectable
class AuthApi
{
    constructor(private authService: AuthenticationService, private sessionManager: SessionManager)
    {
    }

    @HttpEndpoint({ method: "post", route: Routes.AUTH })
    public async Authenticate(request: express.Request, response: express.Response)
    {
        const data = request.body;
        const result:AuthResult = {
            success: await this.authService.Authenticate(data.userName, data.password)
        };

        if(result.success)
        {
            const sessionData = await this.sessionManager.CreateSession(data.userName, request.ip);
            result.expiryDateTime = sessionData.expiryDateTime.toUTCString();
            result.token = sessionData.token;
        }

        response.json(result);
        response.end();
    }
}

export default AuthApi;