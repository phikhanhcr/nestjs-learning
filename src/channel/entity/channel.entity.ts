import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    DeleteDateColumn,
    ObjectIdColumn,
    PrimaryColumn,
} from 'typeorm';
import { BSON, EJSON, ObjectId } from 'bson';
export interface IChannelInformationResponse {
    id: string;
    name: string;
    avatar: string;
}

export enum ChannelMessageType {
    TEXT = 0,
    STICKER = 1,
    IMAGE = 2,
    IMAGES = 3,
}

export enum ChannelType {
    DIRECT = 1,
    GROUP = 2,
}

export interface IKeyChannel {
    u1: number;
    u2: number;
}

export interface ILastMessage {
    id: number;
    message: string;
    message_type: ChannelMessageType;
    sequence: number;
    // created_At
    sent_at: Date;
    sender: {
        id: number;
        name: string;
        avatar: string;
    };
}

export interface IParticipant {
    id: number;
    name: string;
    avatar: string;
}

export interface IChannel {
    id: number;
    key: ObjectId;
    key_channel: string;
    last_message: ILastMessage;
    last_sequence: number;
    participants: IParticipant[];
    channel_type: ChannelType;
    created_at: Date;
    updated_at: Date;
}

@Entity({
    name: 'channels',
})
export class Channel {
    @PrimaryGeneratedColumn()
    id: number;

    @ObjectIdColumn()
    @PrimaryColumn()
    @Column({
        type: 'bytea',
        nullable: false,
        name: 'key',
    })
    key: ObjectId;

    @Column({
        type: 'json',
        nullable: false,
        name: 'key_channel',
    })
    keyChannel: IKeyChannel;

    @Column({
        type: 'json',
        nullable: true,
        default: null,
        name: 'last_message',
    })
    lastMessage: ILastMessage;

    @Column({
        type: 'integer',
        name: 'last_sequence',
    })
    lastSequence: number;

    @Column({
        type: 'jsonb',
        array: false,
        default: () => "'[]'",
        nullable: false,
        name: 'participants',
    })
    participants: object[];

    @Column({
        type: 'smallint',
        nullable: false,
        default: ChannelType.DIRECT,
        name: 'channel_type',
    })
    channelType: ChannelType;

    @CreateDateColumn({
        name: 'created_at',
        default: () => 'CURRENT_TIMESTAMP',
        type: 'timestamp with time zone',
    })
    createdAt: Date;

    @UpdateDateColumn({
        default: () => 'CURRENT_TIMESTAMP',
        type: 'timestamp with time zone',
        name: 'updated_at',
    })
    updatedAt: Date;
}
