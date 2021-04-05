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
import * as Apache from "./Model/Apache";
import * as Commands from "./Model/Commands";
import * as JDownloader from "./Model/JDownloader";
import * as MySQL from "./Model/MySQL";
import * as Network from "./Model/Network";
import * as Processes from "./Model/Processes";
import * as SMB from "./Model/SMB";
import * as SystemInfo from "./Model/SystemInfo";
import * as SystemUpdate from "./Model/SystemUpdate";

import { Messages, JsonRequestMessage, JsonResponseMessage } from "./Messages";
import { User, Group } from "./Model/User";
import { BackupTask, BackupSaveRequest, DownloadFileRequest } from "./Model/BackupTask";
import { ExternalConnectionConfig, ExternalConnectionType, ExternalConnectionTypes, ExternalConnectionSettings } from "./Model/ExternalConnection";
import * as Module from "./Model/Module";
import { Routes } from "./Http";
import { AuthResult } from "./Model/Auth";
import { SystemService, SystemServiceAction, SystemServiceActionData } from "./Model/SystemServices";
import { NotificationSettings } from "./Model/Notifications";
import { CertificatesApi } from "./Model/Certificates";
import { OpenVPNApi } from "./Model/OpenVPN";
import { FileSystemApi } from "./Model/FileSystem";
import { PowerApi } from "./Model/Power";

interface OperationStatus
{
    success: boolean;
    errorMessage?: string;
}

export {
    Apache,
    AuthResult,
    BackupSaveRequest,
    BackupTask,
    DownloadFileRequest,
    CertificatesApi,
    Commands,
    ExternalConnectionConfig,
    ExternalConnectionSettings,
    ExternalConnectionType,
    ExternalConnectionTypes,
    FileSystemApi,
    JDownloader,
    Group,
    JsonRequestMessage,
    JsonResponseMessage,
    Messages,
    Module,
    MySQL,
    Network,
    NotificationSettings,
    OpenVPNApi,
    OperationStatus,
    PowerApi,
    Processes,
    Routes,
    User,
    SMB,
    SystemInfo,
    SystemService,
    SystemServiceAction,
    SystemServiceActionData,
    SystemUpdate,
};