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
import express from "express";

import { Messages, BackupSaveRequest, DownloadFileRequest, Routes } from "srvmgr-api";

import { Injectable } from "../Injector";
import { ApiEndpoint, ApiCall, ApiRequest } from "../Api";
import { ConnectionManager } from "../services/ConnectionManager";
import { BackupManager } from "../services/BackupManager";
import { HttpEndpoint } from "../Http";

@Injectable
class BackupsApi
{
    constructor(private connectionManager: ConnectionManager, private backupManager: BackupManager)
    {
    }

    @ApiEndpoint({ route: Messages.BACKUPS_DELETE })
    public DeleteBackup(call: ApiCall, backupName: string)
    {
        this.backupManager.Delete(backupName);
    }

    @HttpEndpoint({ method: "post", route: Routes.BACKUPS_DOWNLOAD })
    public async DownloadFile(request: express.Request, response: express.Response)
    {
        const data = request.body;
        const stream = await this.backupManager.ReadBackupFile(data.backupName, data.fileName);
        if(stream === undefined)
        {
            response.writeHead(404);
            response.end();
        }
        else
        {
            response.writeHead(200, { "Content-disposition": "attachment; filename=" + data.fileName });
            stream.pipe(response);
        }
    }

    @ApiEndpoint({ route: Messages.BACKUPS_LIST_FILES })
    public async ListBackupFiles(request: ApiRequest, backupName: string)
    {
        this.connectionManager.Respond(request, await this.backupManager.ListBackupFileNames(backupName));
    }

    @ApiEndpoint({ route: Messages.BACKUPS_LIST })
    public async ListBackups(call: ApiCall)
    {
        this.connectionManager.Send(call.senderConnectionId, call.calledRoute, this.backupManager.tasks);
    }

    @ApiEndpoint({ route: Messages.BACKUPS_RUN })
    public RunBackup(call: ApiCall, backupName: string)
    {
        this.backupManager.RunBackup(backupName);
    }

    @ApiEndpoint({ route: Messages.BACKUPS_SET })
    public SetBackup(request: ApiRequest, data: BackupSaveRequest)
    {
        data.backup.nextBackupTime = new Date(data.backup.nextBackupTime); //from Json we get string not date!!!

        const result = this.backupManager.SetBackup(data.originalName, data.backup);
        this.connectionManager.Respond(request, result);
    }
}

export default BackupsApi;