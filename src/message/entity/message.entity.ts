import { ChannelMessageType } from 'src/channel/entities/channel.entity';
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, DeleteDateColumn } from 'typeorm';

@Entity({
    name: 'messages',
})
export class Channel {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        name: 'channel_id',
        nullable: false,
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
}
