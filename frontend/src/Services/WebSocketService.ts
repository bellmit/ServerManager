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
import { Dictionary, ObservableEvent } from "acfrontend";

export class WebSocketService
{
    constructor()
    {
        this.apiListeners = {};
        this.onOpen = new ObservableEvent();
        this.responseCounter = 0;
        
        this.webSocketConnection = new WebSocket("ws://localhost:8081");

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
    public RegisterApiListenerHandler(route: string, handler: Function)
    {
        this.apiListeners[route] = handler;
    }

    public SendMessage(route: string, data: any = undefined)
    {
        if(this.webSocketConnection.readyState == 1)
        {
            this.webSocketConnection.send(JSON.stringify({ msg: route, data: data }));
        }
        else
        {
            this.onOpen.Subscribe(this.SendMessage.bind(this, route, data));
        }
    }

    public SendRequest<T>(message: string, data: any): Promise<T>
    {
        const id = this.responseCounter++;
        const responseMsg = "/tmp/" + id;

        return new Promise<T>( (resolve, reject) => {
            this.RegisterApiListenerHandler(responseMsg, (result: any) => {
                this.UnregisterApiListenerHandler(responseMsg);
                resolve(result);
            });
            this.webSocketConnection.send(JSON.stringify({ msg: message, responseMsg: responseMsg, data: data }));
        });
    }

    //Private members
    private webSocketConnection: WebSocket;
    private apiListeners: Dictionary<Function>;
    private onOpen: ObservableEvent;
    private responseCounter: number;

    //Private methods
    private UnregisterApiListenerHandler(message: string)
    {
        delete this.apiListeners[message];
    }

    //Event handlers
    private OnMessageReceived(message: MessageEvent)
    {
        const parsedMessage = JSON.parse(message.data);
        if("route" in parsedMessage)
        {
            if(parsedMessage.route in this.apiListeners)
            {
                this.apiListeners[parsedMessage.route](parsedMessage.data);
            }
        }
    }
}