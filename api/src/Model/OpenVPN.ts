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

import { SUBMSG_ADD } from "../Messages";

const MSG_OPENVPN = "/OpenVPN/";

export namespace OpenVPNApi
{
    export namespace AddCA
    {
        export const message = MSG_OPENVPN + SUBMSG_ADD;

        export interface RequestData
        {
            name: string;
            keySize: number;
            countryCode: string;
            province: string;
            city: string;
            organization: string;
            email: string;
            organizationalUnit: string;
            domainName: string;
        }
    }
}