// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import * as fs from 'fs';
import * as fsextra from 'fs-extra';
import { SemVer } from 'semver';
import * as vscode from 'vscode';
import { Architecture, OSType } from '../utils/platform';

//===========================
// registry

export enum RegistryHive {
    HKCU,
    HKLM
}

export const IRegistry = Symbol('IRegistry');
export interface IRegistry {
    getKeys(key: string, hive: RegistryHive, arch?: Architecture): Promise<string[]>;
    getValue(key: string, hive: RegistryHive, arch?: Architecture, name?: string): Promise<string | undefined | null>;
}

//===========================
// platform

export const IsWindows = Symbol('IS_WINDOWS');

export const IPlatformService = Symbol('IPlatformService');
export interface IPlatformService {
    readonly osType: OSType;
    osRelease: string;
    readonly pathVariableName: 'Path' | 'PATH';
    readonly virtualEnvBinName: 'bin' | 'Scripts';

    // convenience methods
    readonly isWindows: boolean;
    readonly isMac: boolean;
    readonly isLinux: boolean;
    readonly is64bit: boolean;
    getVersion(): Promise<SemVer>;
}

//===========================
// temp FS

export type TemporaryFile = { filePath: string } & vscode.Disposable;
export type TemporaryDirectory = { path: string } & vscode.Disposable;

export interface ITempFileSystem {
    createFile(suffix: string): Promise<TemporaryFile>;
}

//===========================
// FS paths

// The low-level file path operations used by the extension.
export interface IFileSystemPaths {
    readonly sep: string;
    join(...filenames: string[]): string;
    dirname(filename: string): string;
    basename(filename: string, suffix?: string): string;
    normalize(filename: string): string;
    normCase(filename: string): string;
}

// Where to fine executables.
//
// In particular this class provides all the tools needed to find
// executables, including through an environment variable.
export interface IExecutables {
    delimiter: string;
    envVar: string;
}

// A collection of high-level utilities related to filesystem paths.
export interface IFileSystemPathUtils {
    readonly paths: IFileSystemPaths;
    readonly executables: IExecutables;
    readonly home: string;
    // Return true if the two paths are equivalent on the current
    // filesystem and false otherwise.  On Windows this is significant.
    // On non-Windows the filenames must always be exactly the same.
    arePathsSame(path1: string, path2: string): boolean;
    // Return the clean (displayable) form of the given filename.
    getDisplayName(pathValue: string, cwd?: string): string;
}

//===========================
// filesystem operations

export import FileType = vscode.FileType;
export import FileStat = vscode.FileStat;
export type ReadStream = fs.ReadStream;
export type WriteStream = fs.WriteStream;

// The low-level filesystem operations on which the extension depends.
export interface IRawFileSystem {
    // Get information about a file (resolve symlinks).
    stat(filename: string): Promise<FileStat>;
    // Get information about a file (do not resolve synlinks).
    lstat(filename: string): Promise<FileStat>;
    // Change a file's permissions.
    chmod(filename: string, mode: string | number): Promise<void>;
    // Move the file to a different location (and/or rename it).
    move(src: string, tgt: string): Promise<void>;

    //***********************
    // files

    // Return the raw bytes of the given file.
    readData(filename: string): Promise<Buffer>;
    // Return the text of the given file (decoded from UTF-8).
    readText(filename: string): Promise<string>;
    // Write the given text to the file (UTF-8 encoded).
    writeText(filename: string, data: {}): Promise<void>;
    // Write the given text to the end of the file (UTF-8 encoded).
    appendText(filename: string, text: string): Promise<void>;
    // Copy a file.
    copyFile(src: string, dest: string): Promise<void>;
    // Delete a file.
    rmfile(filename: string): Promise<void>;

    //***********************
    // directories

    // Create the directory and any missing parent directories.
    mkdirp(dirname: string): Promise<void>;
    // Delete the directory and everything in it.
    rmtree(dirname: string): Promise<void>;
    // Return the contents of the directory.
    listdir(dirname: string): Promise<[string, FileType][]>;

    //***********************
    // not async

    // Return the text of the given file (decoded from UTF-8).
    readTextSync(filename: string): string;
    // Create a streaming wrappr around an open file (for reading).
    createReadStream(filename: string): ReadStream;
    // Create a streaming wrappr around an open file (for writing).
    createWriteStream(filename: string): WriteStream;
}

export const IFileSystem = Symbol('IFileSystem');
export interface IFileSystem {
    // path-related
    directorySeparatorChar: string;
    arePathsSame(path1: string, path2: string): boolean;

    // "raw" operations
    stat(filePath: string): Promise<FileStat>;
    createDirectory(path: string): Promise<void>;
    deleteDirectory(path: string): Promise<void>;
    listdir(dirname: string): Promise<[string, FileType][]>;
    readFile(filePath: string): Promise<string>;
    readData(filePath: string): Promise<Buffer>;
    writeFile(filePath: string, text: string | Buffer, options?: string | fsextra.WriteFileOptions): Promise<void>;
    appendFile(filename: string, text: string | Buffer): Promise<void>;
    copyFile(src: string, dest: string): Promise<void>;
    deleteFile(filename: string): Promise<void>;
    chmod(path: string, mode: string | number): Promise<void>;
    move(src: string, tgt: string): Promise<void>;
    // sync
    readFileSync(filename: string): string;
    createReadStream(path: string): fs.ReadStream;
    createWriteStream(path: string): fs.WriteStream;

    // utils
    fileExists(path: string): Promise<boolean>;
    fileExistsSync(path: string): boolean;
    directoryExists(path: string): Promise<boolean>;
    getSubDirectories(rootDir: string): Promise<string[]>;
    getFiles(rootDir: string): Promise<string[]>;
    getFileHash(filePath: string): Promise<string>;
    search(globPattern: string, cwd?: string): Promise<string[]>;
    createTemporaryFile(extension: string): Promise<TemporaryFile>;
    isDirReadonly(dirname: string): Promise<boolean>;
}
