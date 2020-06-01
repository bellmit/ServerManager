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
import { ObservableEvent, Injectable } from "acfrontend";
import { Dictionary } from "acts-util-core";

import { JsonResponseMessage, JsonRequestMessage } from "srvmgr-api";

import { AuthenticationService } from "./AuthenticationService";

export const BACKEND_HOST = "localhost:8081";

//only used to make sure that metadata is emitted for the class
function EmitMetadata(target: any)
{
}

@EmitMetadata
export class WebSocketService
{
    constructor(private authenticationService: AuthenticationService)
    {
        this.apiListeners = {};
        this.onOpen = new ObservableEvent();
        this.responseCounter = 0;
        
        this.webSocketConnection = new WebSocket("ws://" + BACKEND_HOST);

        this.webSocketConnection.onclose = () =>
        {
            this.authenticationService.Logout();
        };

        this.webSocketConnection.onopen = () => 
        {
            this.onOpen.Emit();
        };

        this.webSocketConnection.onerror = (error) => 
        {
            throw new Error("Error from backend: " + error);
        };

        this.webSocketConnection.onmessage = this.OnMessageReceived.bind(this);
    }

    //Public methods
    public Close()
    {
        if( this.webSocketConnection.readyState !== WebSocket.CLOSED )
            this.webSocketConnection.close();
    }

    public RegisterApiListenerHandler(route: string, handler: Function)
    {
        this.apiListeners[route] = handler;
    }

    public SendMessage(msg: string, data: any = undefined)
    {
        this.IssueDataTransfer({ msg: msg, data: data, token: this.authenticationService.token! });
    }

    public SendRequest<T>(message: string, data?: any): Promise<T>
    {
        const id = this.responseCounter++;
        const responseMsg = "/tmp/" + id;

        return new Promise<T>( (resolve, reject) => {
            this.RegisterApiListenerHandler(responseMsg, (result: any) => {
                this.UnregisterApiListenerHandler(responseMsg);
                resolve(result);
            });
            this.IssueDataTransfer({ msg: message, responseMsg: responseMsg, data: data, token: this.authenticationService.token! });
        });
    }

    //Private members
    private webSocketConnection: WebSocket;
    private apiListeners: Dictionary<Function>;
    private onOpen: ObservableEvent;
    private responseCounter: number;

    //Private methods
    private IssueDataTransfer(message: JsonRequestMessage)
    {
        if(this.webSocketConnection.readyState == 1)
            this.SendJson(message);
        else
            this.onOpen.Subscribe(this.SendJson.bind(this, message));
    }

    private SendJson(data: any)
    {
        this.webSocketConnection.send(JSON.stringify(data));
    }

    private UnregisterApiListenerHandler(message: string)
    {
        delete this.apiListeners[message];
    }

    //Event handlers
    private OnMessageReceived(message: MessageEvent)
    {
        const parsedMessage: JsonResponseMessage = JSON.parse(message.data);
        if(parsedMessage.msg === undefined)
            return;

        this.authenticationService.UpdateExpiryDateTime( new Date(parsedMessage.expiryDateTime) );
            
        if(parsedMessage.msg in this.apiListeners)
        {
            this.apiListeners[parsedMessage.msg]!(parsedMessage.data);
        }
    }
}