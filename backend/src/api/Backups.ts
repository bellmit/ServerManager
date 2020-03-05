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
import { Messages, BackupSaveRequest } from "srvmgr-api";

import { Injectable } from "../Injector";
import { ApiEndpoint, ApiCall, ApiRequest } from "../Api";
import { ConnectionManager } from "../services/ConnectionManager";
import { BackupManager } from "../services/BackupManager";

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
        const result = this.backupManager.SetBackup(data.originalName, data.backup);
        this.connectionManager.Respond(request, result);
    }
}

export default BackupsApi;