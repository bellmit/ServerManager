/**
 * ServerManager
 * Copyright (C) 2019-2020 Amir Czwink (amir130@hotmail.de)
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
import * as bodyParser from "body-parser";
import cors from "cors";
import express from "express";
import fs from "fs";
import * as https from "https";
import * as websocket from "websocket";
import * as os from "os";

import { ConnectionManager } from "./services/ConnectionManager";
import { ApiEndpointMetadata } from "./Api";
import { BackupManager } from "./services/BackupManager";
import { HttpEndpointMetadata } from "./Http";
import { SessionManager } from "./services/SessionManager";
import { GlobalInjector } from "./Injector";
import { ConfigManager } from "./services/ConfigManager";

const port = 8081;

//functions
async function LoadGeneralApiCalls()
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

            apiCalls.push( apiClass );
        }
    }
        
    return apiCalls;
}

async function LoadPluginApiCalls()
{
    const path = __dirname + "/modules/";
    const apiCalls = [];
    const paths = fs.readdirSync(path);

    for (let i = 0; i < paths.length; i++)
    {
        const fileName = paths[i] + "/_api.js";
        const filePath = path + fileName;

        if(fs.existsSync(filePath))
        {
            const apiClass: any = (await import(filePath)).default;

            apiCalls.push( apiClass );
        }
    }
        
    return apiCalls;
}

async function LoadApiCalls()
{
    return (await LoadGeneralApiCalls()).concat(await LoadPluginApiCalls());
}

async function SetupApiRoutes()
{
    console.log("Setting up api routes...");

    const connectionManager = GlobalInjector.Resolve<ConnectionManager>(ConnectionManager);

    const apiDefs = await LoadApiCalls();
    for (let index = 0; index < apiDefs.length; index++)
    {
        const apiClass = apiDefs[index];

        const instance = GlobalInjector.Resolve<any>(apiClass);
        if(instance.__routesSetup === undefined)
            continue;
            
        for (let index = 0; index < instance.__routesSetup.length; index++)
        {
            const routeSetup: ApiEndpointMetadata = instance.__routesSetup[index];
            const route = routeSetup.attributes.route;

            connectionManager.RegisterEndpoint(route, instance[routeSetup.methodName].bind(instance));
        }
    }
}

async function ValidateConfig()
{
    const configManager = GlobalInjector.Resolve(ConfigManager);
    const backendSettings = configManager.Get<any>("backend");
    if( backendSettings === undefined )
    {
        const keyPath = "/etc/ssl/private/servermanager.key";
        const certPath = "/etc/ssl/certs/servermanager.crt";

        configManager.Set("backend", {
            keyPath,
            certPath,
            trustedOrigins: [
                "https://localhost:8080",
                "https://" + os.hostname() + ":8080",
            ]
        });
    }
}

async function SetupServer()
{
    const configManager = GlobalInjector.Resolve(ConfigManager);
    const backendSettings = configManager.Get<any>("backend");

    console.log("Setting up http server...");
    
    const app = express();
    //const httpServer = app.listen(port);
    const httpsServer = https.createServer({
        key: fs.readFileSync(backendSettings.keyPath),
        cert: fs.readFileSync(backendSettings.certPath)
    }, app);

    httpsServer.listen(port);

    const corsOptions = {
        origin: backendSettings.trustedOrigins,
    };

    app.use(cors(corsOptions));
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: false }));

    const apiDefs = await LoadApiCalls();
    for (let index = 0; index < apiDefs.length; index++)
    {
        const apiClass = apiDefs[index];

        const instance = GlobalInjector.Resolve<any>(apiClass);
        if(instance.__httpRoutesSetup === undefined)
            continue;
        for (let index = 0; index < instance.__httpRoutesSetup.length; index++)
        {
            const routeSetup: HttpEndpointMetadata = instance.__httpRoutesSetup[index];

            (app as any)[routeSetup.attributes.method](routeSetup.attributes.route, (req: express.Request, res: express.Response) =>
            {
                if(req.route.path === "/auth")
                {
                    instance[routeSetup.methodName](req, res);
                }
                else
                {
                    if( (req.headers.authorization !== undefined) && req.headers.authorization.startsWith("Bearer "))
                    {
                        const result = sessionManager.Authenticate(req.headers.authorization.substring(7), req.ip);
                        if( (result !== undefined) && (result !== null) )
                        {
                            instance[routeSetup.methodName](req, res);
                            return;
                        }
                    }

                    res.sendStatus(401).end();
                }
            });
        }
    }

    const connectionManager = GlobalInjector.Resolve<ConnectionManager>(ConnectionManager);
    const sessionManager = GlobalInjector.Resolve<SessionManager>(SessionManager);
    const webSocketServer = new websocket.server({ httpServer: httpsServer });
    webSocketServer.on("request", (request) =>
    {
        let match = false;
        for (const trusted of backendSettings.trustedOrigins)
        {
            if(request.origin === trusted)
            {
                match = true;
                break;
            }
        }

        if(match && sessionManager.SessionExists(request.remoteAddress))
        {
            const connection = request.accept(undefined, request.origin);
            connectionManager.Add(connection);
            return;
        }
        
        request.reject(401);
    });
}

function SetupBackup()
{
    console.log("Scheduling backup tasks...");

    const bkpManager = GlobalInjector.Resolve<BackupManager>(BackupManager);
    bkpManager.Schedule();
}

async function Init()
{
    await SetupApiRoutes();
    await ValidateConfig();
    await SetupServer();

    setTimeout(SetupBackup, 1000);

    console.log("Initialization finished.");
}



Init(); //setup server