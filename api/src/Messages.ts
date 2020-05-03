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

interface JsonMessage
{
    msg: string;
    data: any;
}

export interface JsonRequestMessage extends JsonMessage
{
    responseMsg?: string;
    token: string;
}

export interface JsonResponseMessage extends JsonMessage
{
    expiryDateTime: string;
}

const MSG_BACKUPS = "/Backups/";
const MSG_EXTERNALCONNECTIONS = "/ExternalConnections/";
const MSG_MODULES = "/Modules/";
const MSG_MYSQL = "/MySQL/";
const MSG_USERS = "/Users/";

const SUBMSG_DELETE = "Delete";
const SUBMSG_LIST = "List";
const SUBMSG_SET = "Set";

export const Messages = {
    BACKUPS_DELETE: MSG_BACKUPS + SUBMSG_DELETE,
    BACKUPS_LIST: MSG_BACKUPS + SUBMSG_LIST,
    BACKUPS_LIST_FILES : MSG_BACKUPS + "ListFiles",
    BACKUPS_RUN: MSG_BACKUPS + "Run",
    BACKUPS_SET: MSG_BACKUPS + SUBMSG_SET,

    EXTERNALCONNECTIONS_DELETE: MSG_EXTERNALCONNECTIONS + SUBMSG_DELETE,
    EXTERNALCONNECTIONS_ISENCRYPTED: MSG_EXTERNALCONNECTIONS + "IsEncrypted",
    EXTERNALCONNECTIONS_LIST: MSG_EXTERNALCONNECTIONS + SUBMSG_LIST,
    EXTERNALCONNECTIONS_SET: MSG_EXTERNALCONNECTIONS + SUBMSG_SET,

    MODULES_INSTALL: MSG_MODULES + "Install",
    MODULES_LIST: MSG_MODULES + SUBMSG_LIST,

    MYSQL_SHOW_STATUS: MSG_MYSQL + "ShowStatus",

    USERS_LIST: MSG_USERS + SUBMSG_LIST,
};