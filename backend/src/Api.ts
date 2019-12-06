/**
 * ServerManager
 * Copyright (C) 2019 Amir Czwink (amir130@hotmail.de)
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
export interface ApiCall
{
    calledRoute: string;
    senderConnectionId: string;
}

export interface ApiEndpointMetadata
{
    methodName: string;
}

export function ApiEndpoint()
{
    return function(targetClass: any, methodName: string, methodDescriptor: PropertyDescriptor)
    {
        if(!("__routesSetup" in targetClass))
            targetClass.__routesSetup = [];
        const metadata: ApiEndpointMetadata = {
            methodName: methodName
        };
        targetClass.__routesSetup.push(metadata);
    };
}
