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
import { Property } from "acts-util-core";

import { BackupTask, Messages, BackupSaveRequest, Routes } from "srvmgr-api";

import { WebSocketService, BACKEND_HOST } from "../../Services/WebSocketService";
import { ApiListener, ApiService } from "../../API/Api";
import { HttpService } from "acfrontend";
import { AuthenticationService } from "../../Services/AuthenticationService";

const MSG_BACKUPS = "/Backups/";
const MSG_BACKUPS_LIST = MSG_BACKUPS + "List";

export interface DirectoryEntry
{
    fileName: string;
}

@ApiService
export class BackupService
{
    constructor(private webSocketService: WebSocketService, private authService: AuthenticationService)
    {
        this._backups = new Property<BackupTask[]>([]);

        this.webSocketService.SendMessage(MSG_BACKUPS_LIST);
    }

    //Properties
    public get backups()
    {
        return this._backups;
    }

    //Public methods
    public DeleteBackup(backupName: string)
    {
        this.webSocketService.SendMessage(Messages.BACKUPS_DELETE, backupName);
    }

    public DownloadFile(backupName: string, fileName: string): Promise<Blob>
    {
        const http = new HttpService;
        return http.Request({
            data: JSON.stringify({
                backupName: backupName,
                fileName: fileName
            }),
            headers: {
                Authorization: "Bearer " + this.authService.token!,
                "Content-Type": "application/json",
            },
            method: "POST",
            responseType: "blob",
            url: "http://" + BACKEND_HOST + Routes.BACKUPS_DOWNLOAD,
        });
    }

    public FetchBackups(backupName: string)
    {
        return this.webSocketService.SendRequest<DirectoryEntry[]>(Messages.BACKUPS_LIST_FILES, backupName);
    }

    public RunBackup(backupName: string)
    {
        this.webSocketService.SendMessage(Messages.BACKUPS_RUN, backupName);
    }

    public SetBackup(backupName: string | undefined, backup: BackupTask)
    {
        const data: BackupSaveRequest = {
            originalName: backupName,
            backup: backup
        }
        return this.webSocketService.SendRequest<boolean>(Messages.BACKUPS_SET, data);
    }

    //Private members
    private _backups: Property<BackupTask[]>;

    //Api Listeners
    @ApiListener({ route: MSG_BACKUPS_LIST })
    private OnReceiveBackupsList(backups: BackupTask[])
    {
        this._backups.Set(backups);
    }
}