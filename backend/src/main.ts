/**
 * ServerManager
 * Copyright (C) 2019-2021 Amir Czwink (amir130@hotmail.de)
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
import * as https from "https";
import * as websocket from "websocket";
import * as os from "os";

import { API, Factory, GlobalInjector, HTTPEndPointProperties, HTTPRequest } from "acts-util-node";

import { ConnectionManager } from "./services/ConnectionManager";
import { BackupManager } from "./services/BackupManager";
import { SessionManager } from "./services/SessionManager";
import { ConfigManager } from "./services/ConfigManager";
import { WebSocketAPIEndPointAttributes } from "./Api";
import { HTTPResult } from "acts-util-node/dist/http/HTTPRequestHandler";

const port = 8081;

//Functions
async function LoadPluginApiCalls(apiLoader: API.Loader<any, any, WebSocketAPIEndPointAttributes>)
{
    const path = __dirname + "/modules/";
    const children = await fs.promises.readdir(path);

    for (const child of children)
    {
        const fileName = child + "/_api.js";
        const filePath = path + fileName;

        if(fs.existsSync(filePath))
        {
            await apiLoader.LoadFile(filePath);
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

    console.log("Setting up server...");

    const requestHandler = Factory.CreateHTTPRequestHandler({
        trustedOrigins: backendSettings.trustedOrigins
    });
    
    const httpsServer = https.createServer({
        key: fs.readFileSync(backendSettings.keyPath),
        cert: fs.readFileSync(backendSettings.certPath)
    }, requestHandler.requestListener);

    //TODO!!!! bottom
    //app.use(bodyParser.urlencoded({ extended: false }));

    const apiLoader = new API.Loader<any, HTTPResult, HTTPEndPointProperties | WebSocketAPIEndPointAttributes>();
    await apiLoader.LoadDirectory(__dirname + "/api/");
    await LoadPluginApiCalls(apiLoader);

    const connectionManager = GlobalInjector.Resolve<ConnectionManager>(ConnectionManager);

    const apiSetups = apiLoader.GetEndPointSetups();
    for (const apiSetup of apiSetups)
    {
        if("method" in apiSetup.properties)
        {
            requestHandler.RegisterRoute(apiSetup.properties, async (req: HTTPRequest<any>) =>
            {
                if(req.routePath === "/auth")
                    return apiSetup.method(req);
                else
                {
                    if( (req.headers.authorization !== undefined) && req.headers.authorization.startsWith("Bearer "))
                    {
                        const result = sessionManager.Authenticate(req.headers.authorization.substring(7), req.ip);
                        if( (result !== undefined) && (result !== null) )
                            return apiSetup.method(req);
                    }

                    return {
                        statusCode: 401
                    };
                }
            });
        }
        else
            connectionManager.RegisterEndpoint(apiSetup.properties.route, apiSetup.method);
    }

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

    httpsServer.listen(port);
}

function SetupBackup()
{
    console.log("Scheduling backup tasks...");

    const bkpManager = GlobalInjector.Resolve<BackupManager>(BackupManager);
    bkpManager.Schedule();
}

async function Init()
{
    await ValidateConfig();
    await SetupServer();

    setTimeout(SetupBackup, 1000);

    console.log("Initialization finished.");
}



Init(); //setup server