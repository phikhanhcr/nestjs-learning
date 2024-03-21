import { ChannelMessageType } from 'src/channel/entity/channel.entity';
import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    DeleteDateColumn,
    ObjectIdColumn,
} from 'typeorm';
import { ObjectId } from 'bson';

export interface ISaveMessage {
    channel_id: number;
    message: string;
    message_type: ChannelMessageType;
    sender_id: number;
    sender_name: string;
    sender_avatar: string;
    sequence: number;

    sent_at: number;
}

export interface IMessageResponse {
    id: number;
    channelId: number;
    senderId: number;
    senderName: string;
    senderAvatar: string;
    message: string;
    messageType: ChannelMessageType;
    sequence: number;
    createdAt: number;
}

export interface IMessage {
    id: number;
    channelId: number;
    senderId: number;
    senderName: string;
    senderAvatar: string;
    message: string;
    messageType: ChannelMessageType;
    sequence: number;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date;
}

@Entity({
    name: 'messages',
})
export class Message {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        name: 'channel_id',
        nullable: false,
        type: 'integer',
    })
    channelId: number;

    @Column({
        name: 'sender_id',
        nullable: false,
    })
    senderId: number;

    @Column({
        name: 'sender_name',
        nullable: false,
    })
    senderName: string;

    @Column({
        name: 'sender_avatar',
        nullable: false,
    })
    senderAvatar: string;

    @Column('character varying', {
        name: 'message',
        nullable: false,
    })
    message: string;

    @Column({
        name: 'message_type',
        nullable: false,
        default: ChannelMessageType.TEXT,
    })
    messageType: ChannelMessageType;

    @Column({
        name: 'sequence',
        nullable: false,
    })
    sequence: number;

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

    transform(): IMessageResponse {
        return {
            id: this.id,
            channelId: this.channelId,
            senderId: this.senderId,
            senderName: this.senderName,
            senderAvatar: this.senderAvatar,
            message: this.message,
            messageType: this.messageType,
            sequence: this.sequence,
            createdAt: this.createdAt.getTime(),
        };
    }
}
