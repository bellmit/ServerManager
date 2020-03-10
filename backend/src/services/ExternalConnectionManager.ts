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
import * as crypto from "crypto";

import { Dictionary, Property } from "acts-util";
import { ExternalConnectionConfig, ExternalConnectionType } from "srvmgr-api";

import { Injectable } from "../Injector";
import { ExternalConnection } from "../Model/ExternalConnection";
import { WebdavConnection } from "../Model/WebdavConnection";
import { EncryptedConnection } from "../Model/EncryptedConnection";
import { ConfigManager } from "./ConfigManager";
import { FilesystemConnection } from "../Model/FilesystemConnection";

interface ExternalConnectionEncryptionConfig
{
    salt: Buffer;
    password: string;
}

interface ExternalConnectionManagerConfig
{
    connections: ExternalConnectionConfig[];
    encryptionData: Dictionary<ExternalConnectionEncryptionConfig>;
}

const CONFIG_KEY = "external_connections";

@Injectable
export class ExternalConnectionManager
{
    constructor(private configManager: ConfigManager)
    {
    }

    //Properties
    public get connections()
    {
        if(this.connectionConfigs === undefined)
        {
            const cfg = this.ReadConfig();
            this.encryptionData = cfg.encryptionData;
            this.connectionConfigs = new Property<ExternalConnectionConfig[]>(cfg.connections);
        }
        return this.connectionConfigs;
    }

    //Public methods
    public Delete(connectionName: string)
    {
        const connections = this.connections.Get();
        this.RemoveConnection(connections, connectionName);
        this.connectionConfigs!.Set(connections);

        this.WriteConfig();
    }

    public IsEncrypted(connectionName: string)
    {
        if(this.encryptionData === undefined)
            return false;
        return connectionName in this.encryptionData;
    }
;
    public OpenConnection(connectionName: string): ExternalConnection
    {
        const result = this.connections.Get().find(connection => connection.name === connectionName);
        if(result === undefined)
            throw new Error("Illegal connection name");

        return this.InstantiateConnection(result, this.encryptionData![connectionName]);
    }

    public SetConnection(originalName: string | undefined, config: ExternalConnectionConfig, encrypt: boolean)
    {
        const connections = this.connections.Get();

        //check if target exists
        if( (originalName !== undefined) && (originalName !== config.name) && (connections.find( connection => connection.name === config.name ) !== undefined) )
            return false;

        const encData = encrypt ? this.GetEncryptionData(originalName) : undefined;

        //delete old
        if(originalName !== undefined)
        {
            this.RemoveConnection(connections, originalName);
        }

        //set new
        connections.push(config);
        this.connectionConfigs!.Set(connections);
        if( encData !== undefined )
        {
            if(this.encryptionData === undefined)
                this.encryptionData = {};
            this.encryptionData[config.name] = encData;
        }
        this.WriteConfig();

        return true;
    }

    //Private members
    private connectionConfigs?: Property<ExternalConnectionConfig[]>;
    private encryptionData?: Dictionary<ExternalConnectionEncryptionConfig>;

    //Private methods
    private Base64Decode(data: string)
    {
        const buffer = new Buffer(data, "base64");
        return buffer.toString("utf8");
    }

    private Base64Encode(data: string)
    {
        const buffer = new Buffer(data, "utf8");
        return buffer.toString("base64");
    }

    private GenerateRandomNatural(low: number, high: number)
    {
        const buffer = crypto.randomBytes(4);
        const num = buffer.readUInt32BE(0) / (2**32 - 1);
        return Math.floor(num * (high - low) + low);
    }

    private GenerateRandomPassword(minLength: number, maxLength: number)
    {
        const length = this.GenerateRandomNatural(minLength, maxLength);

        let result = "";
        for(let i = 0; i < length; i++)
            result += String.fromCharCode( this.GenerateRandomNatural(33, 126) );
        return result;
    }

    private GetEncryptionData(connectionName: string | undefined)
    {
        if( (connectionName === undefined) || (this.encryptionData === undefined) || !(connectionName in this.encryptionData) )
        {
            const MIN_PW_LENGTH = 32;
            const SALT_LENGTH = 64;
            return {
                password: this.GenerateRandomPassword(MIN_PW_LENGTH, SALT_LENGTH),
                salt: crypto.randomBytes(SALT_LENGTH)
            };
        }
        return this.encryptionData[connectionName];
    }

    private InstantiateConnection(config: ExternalConnectionConfig, encryption?: ExternalConnectionEncryptionConfig)
    {
        const instance = this.InstantiateConnectionType(config.type, config.options!);
        if(encryption !== undefined)
            return new EncryptedConnection(encryption.salt, encryption.password, instance);

        return instance;
    }

    private InstantiateConnectionType(configType: ExternalConnectionType, options: Dictionary<string>)
    {
        switch(configType)
        {
            case "file":
                return new FilesystemConnection(options.root!);
            case "webdav":
                return new WebdavConnection(options.root!, options.username!, options.password!);
        }
    }

    private ReadConfig(): ExternalConnectionManagerConfig
    {
        let cfg = this.configManager.Get<any>(CONFIG_KEY);
        if(cfg === undefined)
            return { connections: [], encryptionData: {} };
        if(cfg.encryptionData !== undefined)
        {
            for (const key in cfg.encryptionData)
            {
                if(cfg.encryptionData.hasOwnProperty(key))
                {
                    const element = cfg.encryptionData[key];

                    element.password = this.Base64Decode(element.password);
                    element.salt = new Buffer(element.salt, "base64");
                }
            }
        }

        return cfg;
    }

    private RemoveConnection(connections: ExternalConnectionConfig[], connectionName: string)
    {
        const srcIdx = connections.findIndex( connection => connection.name === connectionName );
        connections.Remove(srcIdx);
        if(this.encryptionData !== undefined)
            delete this.encryptionData[connectionName];
    }

    private WriteConfig()
    {
        let encData: Dictionary<any> = {};
        if(this.encryptionData !== undefined)
        {
            for (const key in this.encryptionData)
            {
                if(!this.encryptionData.hasOwnProperty(key))
                    continue;

                const element = this.encryptionData[key]!;
                encData[key] = {
                    salt: element.salt.toString("base64"),
                    password: this.Base64Encode(element.password)
                }
            }
        }
        const cfg: ExternalConnectionManagerConfig = {
            connections: this.connectionConfigs !== undefined ? this.connectionConfigs.Get() : [],
            encryptionData: encData,
        };
        this.configManager.Set(CONFIG_KEY, cfg);
    }
}