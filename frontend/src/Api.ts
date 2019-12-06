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
import { Instantiatable, Injectable, Injector } from "acfrontend";
import { WebSocketService } from "./WebSocketService";

export interface ApiListenerProperties
{
    route: string;
}

export interface ApiListenerMetadata
{
    methodName: string;
    properties: ApiListenerProperties;
}

export function ApiListener(properties: ApiListenerProperties)
{
    return function(targetClass: any, methodName: string, methodDescriptor: PropertyDescriptor)
    {
        if(!("__apiListeners" in targetClass))
            targetClass.__apiListeners = [];
        const metadata: ApiListenerMetadata = {
            methodName: methodName,
            properties: properties
        };
        targetClass.__apiListeners.push(metadata);
    };
}

export function ApiService<T extends Instantiatable<{}>>(constructor:T)
{
    return Injectable(class extends constructor
    {
        constructor(...args:any[])
        {
            super(...args);

            const listeners: Array<ApiListenerMetadata> = constructor.prototype.__apiListeners;
            if(listeners !== undefined)
            {
                for (let index = 0; index < listeners.length; index++)
                {
                    const listener = listeners[index];

                    const webSocketService = Injector.Resolve(WebSocketService);
                    webSocketService.RegisterApiListenerHandler(listener.properties.route, (this as any)[listener.methodName].bind(this));
                }
            }
        }
    });
}