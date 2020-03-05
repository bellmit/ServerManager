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
import * as fs from "fs";
import * as path from "path";
import * as stream from "stream";

import { Dictionary } from "acts-util";

import { ExternalConnection } from "./ExternalConnection";
import { TemporaryFilesService } from "../services/TemporaryFilesService";
import { Injector } from "../Injector";

interface FilePublicMetadata
{
    version: number;
    nonce: Buffer;
}

interface FilePrivateMetadata
{
    fileName: string;
}

interface DirectoryPrivateMetadata
{
    nextFileNumber: number;
    files: Dictionary<FilePrivateMetadata>;
}

const AUTH_TAG_SIZE = 16;

export class EncryptedConnection implements ExternalConnection
{
    constructor(private salt: Buffer, private password: string, private innerConnection: ExternalConnection)
    {
    }

    //Public methods
    public Exists(filePath: string): Promise<boolean>
    {
        throw new Error("Method not implemented.");
    }

    public ReadFile(filePath: string): Promise<fs.ReadStream>
    {
        throw new Error("Method not implemented.");
    }

    public async StoreFile(localFilePath: string, remoteFilePath: string): Promise<void>
    {
        const encryptedFilePath = await this.EncryptToTempFile(localFilePath);

        //pass to actual connection
        const metadata = await this.ReadMetadataFile();
        const fileNumber = metadata.nextFileNumber++;
        const newRemoteFileName = fileNumber.toString();
        const newRemoteFilePath = path.join(path.dirname(remoteFilePath), newRemoteFileName);

        await this.innerConnection.StoreFile(encryptedFilePath, newRemoteFilePath);

        //clean up
        this.TempFilesService.CleanUp(encryptedFilePath);

        //write metadata
        metadata.files[newRemoteFileName] = {
            fileName: path.basename(localFilePath)
        };
        await this.WriteMetadataFile(metadata);
    }

    //Private properties
    private get TempFilesService()
    {
        return Injector.Resolve<TemporaryFilesService>(TemporaryFilesService);
    }

    //Private methods
    private async BeginEncrypt()
    {
        const nonce = crypto.randomBytes(16);

        const publicMetadata = {
            version: 1,
            nonce: nonce.toString("base64"),
        };

        const encryptedFilePath = await this.TempFilesService.CreateTempFilePath();
        const file = fs.createWriteStream(encryptedFilePath);

        this.WriteJSON(file, publicMetadata);
        const cipher = crypto.createCipheriv("aes-256-gcm", this.DeriveEncryptionKey(), nonce, { authTagLength: AUTH_TAG_SIZE} );

        return {
            cipher,
            encryptedFilePath,
            file
        };
    }

    private DeriveEncryptionKey()
    {
        const KEY_LENGTH = 32;

        const key = this.salt; //TODO!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! INSTALL NEW NODE VERSION AND THEN USE SCRYPT
        //const key = crypto.scryptSync(this.password, salt, KEY_LENGTH, { N: 16384, r: 8});

        return key;
    }

    private async EncryptBufferToTempFile(buffer: Buffer)
    {
        const {cipher, encryptedFilePath, file} = await this.BeginEncrypt();

        return new Promise<string>( (resolve, _) => {
            let encrypted = cipher.update(buffer);
            encrypted = Buffer.concat([encrypted, cipher.final()]);
            const result = Buffer.concat([encrypted, cipher.getAuthTag()]);

            file.end(result, () => resolve(encryptedFilePath));
        });
    }

    private async EncryptToTempFile(filePath: string)
    {
        const {cipher, encryptedFilePath, file} = await this.BeginEncrypt();

        const reader = fs.createReadStream(filePath);

        const appendStream = new stream.Transform({
            transform(chunk, _, callback)
            {
                callback(null, chunk);
            },
            flush(callback)
            {
                this.push(cipher.getAuthTag());
                callback();
            }
        });

        return new Promise<string>( (resolve, _) => {
            reader.pipe(cipher).pipe(appendStream).pipe(file).on("close", () => resolve(encryptedFilePath));
        });
    }

    private async ReadAllData(stream: stream.Readable)
    {
        let result = Buffer.alloc(0);
        return new Promise<Buffer>( (resolve, reject) => {
            stream.on("data", (chunk: any) => {
                result = Buffer.concat([result, chunk]);
            });
            stream.on("end", () => resolve(result));
            stream.read();
        });
    }

    private async ReadMetadataFile(): Promise<DirectoryPrivateMetadata>
    {
        if(!await this.innerConnection.Exists("/metadata"))
        {
            return {
                nextFileNumber: 1,
                files: {}
            };
        }
        const file = await this.innerConnection.ReadFile("/metadata");
        const data = await this.ReadAllData(file);

        const publicMetadataLength = data.readUInt32BE(0);
        const headerSize = 4+publicMetadataLength;
        const publicMetadataString = data.toString("utf8", 4, headerSize);
        const payload = data.slice(headerSize, data.length - AUTH_TAG_SIZE);
        const authTag = data.slice(headerSize + payload.length);
        const publicMetadata = JSON.parse(publicMetadataString);
        const nonce = new Buffer(publicMetadata.nonce, "base64");


        const decipher = crypto.createDecipheriv("aes-256-gcm", this.DeriveEncryptionKey(), nonce, { authTagLength: AUTH_TAG_SIZE });
        decipher.setAuthTag(authTag);
        let decrpytedData = decipher.update(payload);
        decrpytedData = Buffer.concat([decrpytedData, decipher.final()]);

        const metadata = JSON.parse(decrpytedData.toString("utf8"));

        return metadata;
    }

    private async WriteMetadataFile(metadata: DirectoryPrivateMetadata)
    {
        const buffer = new Buffer(JSON.stringify(metadata), "utf8");
        const encryptedFilePath = await this.EncryptBufferToTempFile(buffer);

        await this.innerConnection.StoreFile(encryptedFilePath, "/metadata");

        this.TempFilesService.CleanUp(encryptedFilePath);
    }

    private WriteJSON(file: stream.Writable, data: object)
    {
        const json = JSON.stringify(data);
        const encodedData = new Buffer(json, "utf8");

        const lenBuffer = new Buffer(4);
        lenBuffer.writeUInt32BE(encodedData.length, 0);
        file.write(lenBuffer);

        file.write(encodedData);
    }
}