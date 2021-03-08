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

import { SUBMSG_LIST } from "../Messages";

export type ModuleName = "apache" | "jdownloader" | "letsencrypt" | "mariadb" | "nextcloud" | "openvpn" | "phpmyadmin" | "samba";
export const moduleNames: Array<ModuleName> = [ "apache", "jdownloader", "letsencrypt", "mariadb", "nextcloud", "openvpn", "phpmyadmin", "samba" ];

export interface Module
{
    name: ModuleName;
    installed: boolean;
}

const MSG_MODULES = "/Modules/";
export namespace API
{
    export namespace Install
    {
        export const message = MSG_MODULES + "Install";
    }

    export namespace List
    {
        export const message = MSG_MODULES + SUBMSG_LIST;
    }

    export namespace Uninstall
    {
        export const message = MSG_MODULES + "Uninstall";
    }
}