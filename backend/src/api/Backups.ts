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

import { Messages, BackupSaveRequest, Routes } from "srvmgr-api";

import { HTTPEndPoint, HTTPRequest, Injectable } from "acts-util-node";
import { WebSocketAPIEndpoint, APICall, ApiRequest } from "../Api";
import { ConnectionManager } from "../services/ConnectionManager";
import { BackupManager } from "../services/BackupManager";
import { HTTPResult } from "acts-util-node/dist/http/HTTPRequestHandler";

@Injectable
class BackupsApi
{
    constructor(private connectionManager: ConnectionManager, private backupManager: BackupManager)
    {
    }

    @WebSocketAPIEndpoint({ route: Messages.BACKUPS_DELETE })
    public DeleteBackup(call: APICall, backupName: string)
    {
        this.backupManager.Delete(backupName);
    }

    @HTTPEndPoint({ method: "POST", route: Routes.BACKUPS_DOWNLOAD })
    public async DownloadFile(request: HTTPRequest<{ backupName: string; fileName: string; }>): Promise<HTTPResult>
    {
        const data = request.data;
        const stream = await this.backupManager.ReadBackupFile(data.backupName, data.fileName);
        if(stream === undefined)
        {
            return {
                statusCode: 404
            };
        }

        return {
            headers: {
                "Content-disposition": "attachment; filename=" + data.fileName
            },
            data: stream
        };
    }

    @WebSocketAPIEndpoint({ route: Messages.BACKUPS_LIST_FILES })
    public async ListBackupFiles(request: ApiRequest, backupName: string)
    {
        this.connectionManager.Respond(request, await this.backupManager.ListBackupFileNames(backupName));
    }

    @WebSocketAPIEndpoint({ route: Messages.BACKUPS_LIST })
    public async ListBackups(call: APICall)
    {
        this.connectionManager.Send(call.senderConnectionId, call.calledRoute, this.backupManager.tasks);
    }

    @WebSocketAPIEndpoint({ route: Messages.BACKUPS_RUN })
    public RunBackup(call: APICall, backupName: string)
    {
        this.backupManager.RunBackup(backupName, call.session);
    }

    @WebSocketAPIEndpoint({ route: Messages.BACKUPS_SET })
    public SetBackup(request: ApiRequest, data: BackupSaveRequest)
    {
        data.backup.lastBackupTime = new Date(data.backup.lastBackupTime); //from Json we get string not date!!!

        const result = this.backupManager.SetBackup(data.originalName, data.backup);
        this.connectionManager.Respond(request, result);
    }
}

export default BackupsApi;