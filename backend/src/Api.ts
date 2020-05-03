/**
 * ServerManager
 * Copyright (C) 2019-2020 Amir Czwink (amir130@hotmail.de)
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
export interface ApiSessionInfo
{
    gid: number;
    uid: number;
}

export interface ApiCall
{
    calledRoute: string;
    senderConnectionId: string;
    session: ApiSessionInfo;
}

export interface ApiRequest extends ApiCall
{
    responseMsg: string;
}

interface ApiEndPointAttributes
{
    route: string;
}

export interface ApiEndpointMetadata
{
    methodName: string;
    attributes: ApiEndPointAttributes;
}

export function ApiEndpoint(attributes: ApiEndPointAttributes)
{
    return function(targetClass: any, methodName: string, methodDescriptor: PropertyDescriptor)
    {
        if(!("__routesSetup" in targetClass))
            targetClass.__routesSetup = [];
        const metadata: ApiEndpointMetadata = {
            methodName: methodName,
            attributes: attributes
        };
        targetClass.__routesSetup.push(metadata);
    };
}
