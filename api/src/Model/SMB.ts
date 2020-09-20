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

import { Dictionary } from "acts-util-core";
import { SUBMSG_LIST, SUBMSG_ADD } from "../Messages";

const MSG_SMB = "/SMB/";
const MSG_SMB_USERS = MSG_SMB + "Users/";
const MSG_SMB_SHARES = MSG_SMB + "Shares/";

export type GlobalSettings = Dictionary<boolean | number | string | null>;

export function CreateDefaultShare(shareName: string): Share
{
    return { name: shareName, properties: {
        allowGuests: false,
        browseable: true,
        comment: "",
        createMask: 0o744,
        directoryMask: 0o744,
        path: "",
        printable: false,
        writable: false
    } };
}

export interface ShareProperties
{
    allowGuests: boolean;
    browseable: boolean;
    comment: string;
    createMask: number;
    directoryMask: number;
    path: string;
    printable: boolean;
    writable: boolean;
}

export interface Share
{
    name: string;
    properties: ShareProperties;
}

export interface User
{
    name: string;
    enabled: boolean;
}

export namespace Api
{
    export namespace AddUser
    {
        export const message = MSG_SMB_USERS + SUBMSG_ADD;

        export interface RequestData
        {
            userName: string;
            password: string;
        }
        export type ResponseData = boolean;
    }

    export namespace ListShares
    {
        export const message = MSG_SMB_SHARES + SUBMSG_LIST;

        export type ResponseData = Share[];
    }

    export namespace ListUsers
    {
        export const message = MSG_SMB_USERS + SUBMSG_LIST;

        export type ResponseData = User[];
    }

    export namespace SetShare
    {
        export const message = MSG_SMB_SHARES + SUBMSG_ADD;

        export interface RequestData
        {
            oldShareName?: string;
            share: Share;
        }
    }
}