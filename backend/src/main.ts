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
import * as http from "http";
import * as websocket from "websocket";
import { Injector } from "./Injector";
import { ConnectionManager } from "./services/ConnectionManager";
import { ApiEndpointMetadata } from "./Api";

const port = 8081;

//functions
async function LoadApiCalls()
{
    const path = __dirname + "/api/";
        
    const apiCalls = [];
    const paths = fs.readdirSync(path);

    for (let i = 0; i < paths.length; i++)
    {
        const fileName = paths[i];

        if(fileName.endsWith(".js"))
        {
            const filePath = path + fileName;
            const apiClass: any = (await import(filePath)).default;

            const name = fileName.substr(0, fileName.length - 3);

            apiCalls.push({ apiClass: apiClass, name: name });
        }
    }
        
    return apiCalls;
}

async function SetupApiRoutes()
{
    const connectionManager = Injector.Resolve<ConnectionManager>(ConnectionManager);

    const apiDefs = await LoadApiCalls();
    for (let index = 0; index < apiDefs.length; index++)
    {
        const {apiClass, name} = apiDefs[index];

        const instance = Injector.Resolve<any>(apiClass);
        for (let index = 0; index < instance.__routesSetup.length; index++)
        {
            const routeSetup: ApiEndpointMetadata = instance.__routesSetup[index];
            const route = "/" + name + "/" + routeSetup.attributes.route;

            connectionManager.RegisterEndpoint(route, instance[routeSetup.methodName].bind(instance));
        }
    }
}

async function SetupServer()
{
    const httpServer = http.createServer();
    httpServer.listen(port);

    const connectionManager = Injector.Resolve<ConnectionManager>(ConnectionManager);
    const webSocketServer = new websocket.server({ httpServer: httpServer });
    webSocketServer.on("request", (request) =>
    {
        if(request.origin !== "http://localhost:8080")
        {
            request.reject(401);
        }
        else
        {
            const connection = request.accept(undefined, request.origin);
            connectionManager.Add(connection);
        }
    });
}

async function Init()
{
    await SetupApiRoutes();
    await SetupServer();
}



Init(); //setup server