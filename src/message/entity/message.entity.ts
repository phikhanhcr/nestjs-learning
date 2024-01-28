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

    @ObjectIdColumn()
    @Column({
        type: 'bytea',
        nullable: true,
        name: 'channel_id',
    })
    channelId: ObjectId;

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
}
